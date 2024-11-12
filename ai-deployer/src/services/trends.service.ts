// @ts-expect-error: google-trends-api is not typed
import googleTrends from "google-trends-api"
import axios from "axios"
import { log, LogCodes } from "../logger"
import { HNStory, NewsArticle, TrendingCoin, Trends } from "../types"

export class TrendsService {
  private trendCache: Trends | null = null
  private lastTrendUpdate: number = 0
  private readonly TREND_CACHE_DURATION = 5 * 60 * 1000 // Reduced to 5 minutes for more current data
  private readonly NEWS_API_KEY = process.env.NEWS_API_KEY
  private readonly REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID
  private readonly REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET
  private readonly WORLD_NEWS_API_KEY = process.env.WORLD_NEWS_API_KEY

  /**
   * Combines trends from multiple sources
   */
  public async getTrends(): Promise<Trends | null> {
    if (
      this.trendCache &&
      Date.now() - this.lastTrendUpdate < this.TREND_CACHE_DURATION
    ) {
      return this.trendCache
    }

    try {
      const [newsHeadlines, cryptoTrends, hackerNewsTrends, worldNews] =
        await Promise.all([
          this.getNewsApiTrends(),
          this.getCryptoTrends(),
          this.getHackerNewsTrends(),
          this.getWorldNews(),
        ])

      this.trendCache = {
        cryptoTrends,
        newsHeadlines,
        hackerNewsTrends,
        worldNews,
      }
      this.lastTrendUpdate = Date.now()
      return this.trendCache
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching trends:", error)
      return this.trendCache ? this.trendCache : null
    }
  }

  private async getNewsApiTrends(): Promise<string[]> {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${this.NEWS_API_KEY}`
      )

      return response.data.articles.map((article: NewsArticle) => article.title)
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching News API trends:", error)
      return []
    }
  }

  private async getCryptoTrends(): Promise<TrendingCoin[]> {
    try {
      // Get trending cryptocurrencies from CoinGecko
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/search/trending"
      )

      return response.data.coins
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching crypto trends:", error)
      return []
    }
  }

  private async getHackerNewsTrends(): Promise<string[]> {
    try {
      // Get top stories IDs
      const response = await axios.get(
        "https://hacker-news.firebaseio.com/v0/topstories.json"
      )
      const topStoryIds = response.data // Get top 10 stories

      // Fetch details for each story
      const storyPromises = topStoryIds.map(async (id: number) => {
        const storyResponse = await axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        )
        return storyResponse.data as HNStory
      })

      const stories = await Promise.all(storyPromises)
      return stories.map(story => story.title)
    } catch (error) {
      log.error(
        LogCodes.GET_TRENDS,
        "Error fetching Hacker News trends:",
        error
      )
      return []
    }
  }

  private async getWorldNews(): Promise<NewsArticle[]> {
    const response = await axios.get(
      `https://api.worldnewsapi.com/search-news?text=cryptocurrency&language=en&api-key=${this.WORLD_NEWS_API_KEY}`
    )
    console.log(`RESPONSE`, JSON.stringify(response.data))
    return response.data.news.map((article: any) => ({
      title: article.title,
      text: article.text,
      description: article.summary,
      source: article.author,
      url: article.url,
    }))
  }
}
