import { TwitterApi } from "twitter-api-v2"
import { SocialMessage } from "../types"
import { log, LogCodes } from "../logger"

export class TwitterService {
  private client: TwitterApi
  private lastCheckedId?: string
  private userId?: string

  constructor(
    apiKey: string,
    apiSecret: string,
    accessToken: string,
    accessSecret: string,
    userId?: string
  ) {
    this.userId = userId
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    })
  }

  async getMentions(userId?: string): Promise<SocialMessage[]> {
    try {
      const mentions = await this.client.v2.userMentionTimeline(
        userId || this.userId!
      )

      // Update last checked ID
      if (mentions.data && mentions.data.data.length > 0) {
        this.lastCheckedId = mentions.data.data[0].id
      }

      // Convert to SocialMessage format
      return mentions.data.data.map(tweet => ({
        platform: "twitter",
        messageType: "mention",
        content: tweet.text,
        userId: tweet.author_id!,
        timestamp: new Date().toISOString(),
      }))
    } catch (error) {
      console.error(error)
      log.error(LogCodes.GET_MENTIONS, "Error fetching Twitter data:", error)
      return []
    }
  }
}
