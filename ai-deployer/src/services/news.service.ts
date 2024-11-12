import axios from "axios"
import Parser from "rss-parser"
import { log, LogCodes } from "../logger"
import { TrendsService } from "./trends.service"
import { NewsSource, Trends } from "../types"
import { AIService } from "./ai.service"

export class NewsService {
  private static instance: NewsService
  private parser: Parser
  private newsCache: Map<string, { data: NewsSource[]; timestamp: number }>
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 5 minutes
  private aiService: AIService
  // RSS Feed URLs organized by provider
  private readonly RSS_FEEDS = {
    reuters: {
      world: "https://www.reutersagency.com/feed/",
      business:
        "https://www.reutersagency.com/feed/?best-topics=business-finance",
      technology: "https://www.reutersagency.com/feed/?best-topics=tech",
    },
    ap: {
      topNews: "https://feeds.apnews.com/rss/apnews",
      technology: "https://feeds.apnews.com/rss/aptechnology",
      business: "https://feeds.apnews.com/rss/apbusiness",
    },
    bbc: {
      world: "http://feeds.bbci.co.uk/news/world/rss.xml",
      technology: "http://feeds.bbci.co.uk/news/technology/rss.xml",
      business: "http://feeds.bbci.co.uk/news/business/rss.xml",
    },
    guardian: {
      world: "https://www.theguardian.com/world/rss",
      technology: "https://www.theguardian.com/technology/rss",
      business: "https://www.theguardian.com/business/rss",
    },
    npr: {
      news: "https://feeds.npr.org/1001/rss.xml",
      technology: "https://feeds.npr.org/1019/rss.xml",
      business: "https://feeds.npr.org/1006/rss.xml",
    },
  }

  private constructor() {
    this.parser = new Parser()
    this.aiService = AIService.getInstance(process.env.ANTHROPIC_API_KEY!)
    this.newsCache = new Map()
  }

  public static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService()
    }
    return NewsService.instance
  }

  private async fetchRSSFeed(
    url: string,
    source: string
  ): Promise<NewsSource[]> {
    try {
      const feed = await this.parser.parseURL(url)
      return feed.items.map((item: any) => ({
        title: item.title || "",
        description: item.contentSnippet || item.content || "",
        url: item.link || "",
        source: source,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      }))
    } catch (error) {
      log.error(
        LogCodes.RSS_FETCH_ERROR,
        `Error fetching RSS feed from ${source}:`,
        error
      )
      return []
    }
  }

  private async fetchAllSourceFeeds(category: string): Promise<NewsSource[]> {
    const feedPromises: Promise<NewsSource[]>[] = []

    Object.entries(this.RSS_FEEDS).forEach(([provider, feeds]) => {
      if (feeds[category as keyof typeof feeds]) {
        feedPromises.push(
          this.fetchRSSFeed(feeds[category as keyof typeof feeds], provider)
        )
      }
    })

    try {
      const results = await Promise.allSettled(feedPromises)
      return results
        .filter(
          (result): result is PromiseFulfilledResult<NewsSource[]> =>
            result.status === "fulfilled"
        )
        .flatMap(result => result.value)
    } catch (error) {
      log.error(
        LogCodes.RSS_FETCH_ERROR,
        "Error fetching multiple feeds:",
        error
      )
      return []
    }
  }

  private isCacheValid(category: string): boolean {
    const cache = this.newsCache.get(category)
    return (
      cache !== undefined && Date.now() - cache.timestamp < this.CACHE_DURATION
    )
  }

  public async getNews(category: string = "technology"): Promise<NewsSource[]> {
    try {
      // Check cache first
      if (this.isCacheValid(category)) {
        return this.newsCache.get(category)!.data
      }

      // Fetch fresh data
      const news = await this.fetchAllSourceFeeds(category)

      // Sort by date
      const sortedNews = news.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      )

      // Update cache
      this.newsCache.set(category, {
        data: sortedNews,
        timestamp: Date.now(),
      })

      return sortedNews
    } catch (error) {
      log.error(LogCodes.NEWS_FETCH_ERROR, "Error getting news:", error)
      // Return cached data if available, empty array if not
      return this.newsCache.get(category)?.data || []
    }
  }

  public async searchNews(query: string): Promise<NewsSource[]> {
    try {
      // Search across all categories
      const allNews = await Promise.all(
        ["world", "business", "tech"].map(category => this.getNews(category))
      )

      // Flatten and filter by query
      const searchResults = allNews
        .flat()
        .filter(
          article =>
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.description.toLowerCase().includes(query.toLowerCase())
        )
        // Remove duplicates based on URL
        .filter(
          (article, index, self) =>
            index === self.findIndex(a => a.url === article.url)
        )

      return searchResults
    } catch (error) {
      log.error(LogCodes.NEWS_SEARCH_ERROR, "Error searching news:", error)
      return []
    }
  }

  // Method to combine with your existing trends service
  public async getNewsAndTrends(): Promise<{
    trends: Trends | null
    news: NewsSource[]
  }> {
    try {
      const trendsService = new TrendsService()
      const [trends, news] = await Promise.all([
        trendsService.getTrends(),
        this.getNews(),
      ])

      return {
        trends,
        news,
      }
    } catch (error) {
      log.error(
        LogCodes.NEWS_TRENDS_ERROR,
        "Error getting news and trends:",
        error
      )
      return {
        trends: null,
        news: [],
      }
    }
  }

  public async getSummaryOfSubject(subject: string): Promise<string> {
    const news = await this.getNews(subject)
    const summary = await this.aiService.chat(
      `Summarize the news the user provides you into a nice readable and understandbale section, however long you need to be definitive. Reply in JSON format with { "summary": "<summary>" }`,
      [
        {
          role: "user",
          content: `Heres the news ${JSON.stringify(news)}`,
        },
      ]
    )

    console.log(`SUMMARY`, summary)
    return summary.summary
  }
}
