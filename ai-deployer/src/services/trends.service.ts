// @ts-expect-error: google-trends-api is not typed
import googleTrends from "google-trends-api"
import axios from "axios"
import { log, LogCodes } from "../logger"
import { Trends } from "../types"

interface NewsArticle {
  title: string
  description: string
  source: string
  url: string
}

export class TrendsService {
  private trendCache: Trends | null = null
  private lastTrendUpdate: number = 0
  private readonly TREND_CACHE_DURATION = 5 * 60 * 1000 // Reduced to 5 minutes for more current data
  private readonly NEWS_API_KEY = process.env.NEWS_API_KEY
  private readonly REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID
  private readonly REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET

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
      const [googleTrends, newsHeadlines, cryptoTrends] = await Promise.all([
        this.getGoogleTrends(),
        this.getNewsApiTrends(),
        //this.getRedditTrends(),
        this.getCryptoTrends(),
      ])

      this.trendCache = {
        googleTrends,
        cryptoTrends,
        newsHeadlines,
      }
      this.lastTrendUpdate = Date.now()
      return this.trendCache
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching trends:", error)
      return this.trendCache ? this.trendCache : null
    }
  }

  private async getGoogleTrends(): Promise<string[]> {
    try {
      const trendingResults = await googleTrends.realTimeTrends({
        geo: "US",
        category: "all",
      })

      return JSON.parse(trendingResults)
        .storySummaries.trendingStories.map((story: any) => story.title)
        .slice(0, 10)
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching Google trends:", error)
      return []
    }
  }

  private async getNewsApiTrends(): Promise<string[]> {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${this.NEWS_API_KEY}`
      )

      return response.data.articles
        .map((article: NewsArticle) => article.title)
        .slice(0, 10)
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching News API trends:", error)
      return []
    }
  }

  private async getRedditTrends(): Promise<string[]> {
    try {
      // Get Reddit trending topics from r/CryptoCurrency and r/CryptoMarkets
      const response = await axios.get(
        "https://oauth.reddit.com/r/CryptoCurrency+CryptoMarkets/hot",
        {
          headers: {
            Authorization: `Bearer ${await this.getRedditToken()}`,
            "User-Agent": "TrendsBot/1.0.0",
          },
        }
      )

      return response.data.data.children
        .map((post: any) => post.data.title)
        .slice(0, 10)
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching Reddit trends:", error)
      return []
    }
  }

  private async getCryptoTrends(): Promise<string[]> {
    try {
      // Get trending cryptocurrencies from CoinGecko
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/search/trending"
      )

      return response.data.coins.map((coin: any) => coin.item.name).slice(0, 10)
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error fetching crypto trends:", error)
      return []
    }
  }

  private async getRedditToken(): Promise<string> {
    try {
      const response = await axios.post(
        "https://www.reddit.com/api/v1/access_token",
        `grant_type=client_credentials`,
        {
          auth: {
            username: this.REDDIT_CLIENT_ID!,
            password: this.REDDIT_CLIENT_SECRET!,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      return response.data.access_token
    } catch (error) {
      log.error(LogCodes.GET_TRENDS, "Error getting Reddit token:", error)
      throw error
    }
  }
}
