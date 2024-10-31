import axios from "axios"
import { log, LogCodes } from "../logger"
import { TokenProfile } from "../types"

export class TokenService {
  private static readonly DEX_SCREENER_URL =
    "https://api.dexscreener.com/token-profiles/latest/v1"
  private cachedTokens: TokenProfile[] = []
  private lastFetchTime: number = 0
  private readonly CACHE_DURATION = 15 * 60 * 1000 // 5 minutes

  async getLatestTokens(): Promise<TokenProfile[]> {
    try {
      // Return cached tokens if they're still fresh
      if (this.isCacheValid()) {
        return this.cachedTokens
      }

      const response = await axios.get(TokenService.DEX_SCREENER_URL)
      this.cachedTokens = response.data
      this.lastFetchTime = Date.now()

      return this.cachedTokens
    } catch (error) {
      log.error(
        LogCodes.GET_LATEST_TOKENS,
        "Error fetching latest tokens:",
        error
      )
      // Return cached tokens if available, otherwise empty array
      return this.cachedTokens.length ? this.cachedTokens : []
    }
  }

  private isCacheValid(): boolean {
    return (
      this.cachedTokens.length > 0 &&
      Date.now() - this.lastFetchTime < this.CACHE_DURATION
    )
  }
}
