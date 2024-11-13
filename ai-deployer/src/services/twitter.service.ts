import { TwitterApi, UserV2 } from "twitter-api-v2"
import { SocialAction, SocialMessage } from "../types"
import { log, LogCodes } from "../logger"
import http from "http"

import { writeFileSync, readFileSync, existsSync } from "fs"
import path from "path"
import * as open from "open"
import dayjs from "dayjs"

export class TwitterService {
  private static instance: TwitterService | null = null
  private client: TwitterApi
  private lastCheckedId?: string
  private userId?: string
  private server?: http.Server
  private tokenPath: string
  private codeVerifier: string
  private state: string
  public loggedIn: boolean = false
  public activeOauthURL: string = ""

  constructor(clientId: string, clientSecret: string, userId?: string) {
    this.userId = userId
    this.tokenPath = path.join(process.cwd(), ".twitter-token.json")
    this.codeVerifier = ""
    this.state = ""
    this.client = new TwitterApi({
      clientId,
      clientSecret,
    })
  }

  private async saveTokens(tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }) {
    writeFileSync(
      this.tokenPath,
      JSON.stringify({
        ...tokens,
        expiresAt: Date.now() + tokens.expiresIn * 1000,
      })
    )
  }

  private async loadTokens(): Promise<{
    accessToken: string
    refreshToken: string
    expiresAt: number
  } | null> {
    try {
      if (existsSync(this.tokenPath)) {
        const tokens = JSON.parse(readFileSync(this.tokenPath, "utf8"))
        return tokens
      }
    } catch (error) {
      console.error("Error loading tokens:", error)
    }
    return null
  }

  private async refreshTokenIfNeeded() {
    const tokens = await this.loadTokens()
    if (!tokens) return false

    if (tokens.expiresAt <= Date.now()) {
      try {
        const refreshedTokens = await this.client.refreshOAuth2Token(
          tokens.refreshToken
        )
        await this.saveTokens({
          accessToken: refreshedTokens.accessToken,
          refreshToken: refreshedTokens.refreshToken!,
          expiresIn: refreshedTokens.expiresIn,
        })
        this.client = new TwitterApi(refreshedTokens.accessToken)
        return true
      } catch (error) {
        console.error("Error refreshing token:", error)
        return false
      }
    } else {
      this.client = new TwitterApi(tokens.accessToken)
      return true
    }
  }

  public static getInstance(
    clientId: string,
    clientSecret: string,
    userId?: string
  ): TwitterService {
    if (!TwitterService.instance) {
      const instance = new TwitterService(clientId, clientSecret, userId)

      // Try to load existing tokens first
      instance.refreshTokenIfNeeded().then(async hasValidTokens => {
        if (!hasValidTokens) {
          // Start OAuth flow if no valid tokens exist
          await instance.startOAuthFlow()
        } else {
          instance.loggedIn = true
        }
      })

      TwitterService.instance = instance
    }
    return TwitterService.instance
  }

  private async startOAuthFlow(): Promise<void> {
    return new Promise((resolve, reject) => {
      const callbackPort = 42069
      const callbackUrl = `${process.env.REDIRECT_URL}:${callbackPort}/callback`

      this.server = http
        .createServer(async (req, res) => {
          if (req.url?.startsWith("/callback")) {
            const url = new URL(
              req.url,
              `${process.env.REDIRECT_URL}:${callbackPort}`
            )
            const code = url.searchParams.get("code")

            if (code) {
              try {
                const tokens = await this.client.loginWithOAuth2({
                  code,
                  codeVerifier: this.codeVerifier,
                  redirectUri: callbackUrl,
                })

                await this.saveTokens({
                  accessToken: tokens.accessToken,
                  refreshToken: tokens.refreshToken!,
                  expiresIn: tokens.expiresIn,
                })

                this.loggedIn = true
                this.client = new TwitterApi(tokens.accessToken)

                res.writeHead(200, { "Content-Type": "text/html" })
                res.end(
                  "<h1>Authentication successful! You can close this window.</h1>"
                )

                if (this.server) {
                  this.server.close()
                }

                resolve()
              } catch (error) {
                console.error("Error getting tokens:", error)
                res.writeHead(500, { "Content-Type": "text/html" })
                res.end("<h1>Authentication failed!</h1>")
                reject(error)
              }
            }
          }
        })
        .listen(callbackPort)

      // Generate and store PKCE code verifier and challenge
      const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
        callbackUrl,
        {
          scope: [
            "tweet.read",
            "tweet.write",
            "users.read",
            "follows.read",
            "follows.write",
            "offline.access",
          ],
        }
      )

      this.codeVerifier = codeVerifier
      this.state = state
      // Open the authorization URL in the default browser
      open.default(url)
      this.activeOauthURL = url
      console.log(
        "If your browser doesn't open automatically, please visit this URL:",
        url
      )
    })
  }

  async getMyReplies(): Promise<SocialMessage[]> {
    try {
      await this.refreshTokenIfNeeded()
      const fromDiskReplies = readFileSync(
        path.join(process.cwd(), ".replies.log"),
        "utf-8"
      )
      const replies = fromDiskReplies
        .split("\n")
        .filter(line => line.trim())
        .map(line => JSON.parse(line))

      return replies
    } catch (error) {
      console.error(error)
      log.error(LogCodes.GET_MY_REPLIES, "Error fetching my replies:", error)
      return []
    }
  }

  async getMentions(userId?: string): Promise<SocialMessage[]> {
    try {
      await this.refreshTokenIfNeeded()

      const mentions = await this.client.v2.userMentionTimeline(
        userId || this.userId!,
        this.lastCheckedId
          ? {
              max_results: 30,
              since_id: this.lastCheckedId!,
              expansions: ["author_id", "in_reply_to_user_id"],
            }
          : {
              max_results: 30,
              expansions: ["author_id", "in_reply_to_user_id"],
            }
      )

      if (mentions.data && mentions.data?.data?.length > 0) {
        this.lastCheckedId = mentions.data.data[0].id
      }

      console.log("mentions", JSON.stringify(mentions))

      return (mentions?.data?.data ?? []).map(tweet => ({
        platform: "twitter",
        messageType: "mention",
        content: tweet.text,
        userId: tweet.author_id!,
        tweetId: tweet.id,
        timestamp: new Date().toISOString(),
      }))
    } catch (error) {
      console.error(error)
      log.error(LogCodes.GET_MENTIONS, "Error fetching Twitter data:", error)
      return []
    }
  }

  async postTweet(content: SocialAction): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded()

      if (content.isThreaded && content.otherTweets!.length > 0) {
        let lastTweetId: string | undefined

        for (const tweet of [content, ...content.otherTweets!]) {
          const response = await this.client.v2.tweet(
            tweet.tweet || "I failed",
            {
              reply: lastTweetId
                ? { in_reply_to_tweet_id: lastTweetId }
                : undefined,
            }
          )
          lastTweetId = response.data.id
        }
      } else {
        await this.client.v2.tweet(content.tweet || "I failed")
      }
      return true
    } catch (error) {
      console.error(error)
      log.error(LogCodes.POST_TWEET, "Error posting tweet:", error)
      return false
    }
  }

  async postReply(content: SocialAction): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded()
      const toReplyId = content.tweetId!.replace("tweetId:", "")

      const replied = await this.client.v2.reply(content.tweet!, toReplyId)
      return replied.data.id !== undefined
    } catch (error) {
      console.error(error)
      log.error(LogCodes.POST_REPLY, "Error posting reply:", error)
      return false
    }
  }

  async getUsersTweets(userId: string): Promise<SocialMessage[]> {
    await this.refreshTokenIfNeeded()

    try {
      const latestTweets = await this.client.v2.userTimeline(userId, {
        max_results: 90,
        expansions: ["author_id", "in_reply_to_user_id"],
      })

      let storedTweets: SocialMessage[] = []
      if (userId === this.userId) {
        const fromDisk = readFileSync(
          path.join(process.cwd(), ".tweets.log"),
          "utf-8"
        )
        const fromDiskScheduledTweets = readFileSync(
          path.join(process.cwd(), ".scheduled-tweets.log"),
          "utf-8"
        )
        const tweets = fromDisk
          .split("\n")
          .filter(line => line.trim())
          .map(line => JSON.parse(line))

        const scheduledReplies = fromDiskScheduledTweets
          .split("\n")
          .filter(line => line.trim())
          .map(line => JSON.parse(line))

        storedTweets = [...tweets, ...scheduledReplies]
      }

      return (latestTweets?.data?.data ?? [])
        .map(tweet => ({
          platform: "twitter",
          messageType: "tweet",
          content: tweet.text,
          userId: tweet.author_id!,
          tweetId: tweet.id,
          timestamp: dayjs(tweet.created_at).toISOString(),
        }))
        .concat(
          storedTweets.map((action: SocialAction) => ({
            platform: "twitter" as const,
            messageType: "tweet" as const,
            content: action.tweet ?? "",
            userId: action.userId ?? "",
            tweetId: action.tweetId ?? "",
            timestamp: dayjs(action.intendedPostTime).toISOString(),
          }))
        )
    } catch (error) {
      console.error(error)
      log.error(LogCodes.GET_USER_TWEETS, "Error fetching user tweets:", error)
      return []
    }
  }

  async getUserFollowing(userId: string): Promise<Partial<UserV2>[]> {
    await this.refreshTokenIfNeeded()

    const toFollowId = userId.replace("userId:", "")

    const following = await this.client.v2.following(toFollowId)

    return (following?.data ?? []).map((user: UserV2) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      created_at: user.created_at,
      protected: user.protected,
      description: user.description,
    }))
  }

  async getHomeTimeline(): Promise<SocialMessage[]> {
    await this.refreshTokenIfNeeded()

    const timeline = await this.client.v2.homeTimeline({
      expansions: ["author_id", "in_reply_to_user_id"],
    })

    return (timeline?.data?.data ?? []).map(tweet => ({
      platform: "twitter",
      messageType: "tweet",
      content: tweet.text,
      userId: tweet.author_id!,
      tweetId: tweet.id,
      timestamp: dayjs(tweet.created_at).toISOString(),
    }))
  }

  async likeTweet(tweetId: string): Promise<boolean> {
    await this.refreshTokenIfNeeded()

    const toLikeId = tweetId.replace("tweetId:", "")

    try {
      const result = await this.client.v2.like(this.userId!, toLikeId)
      return result.data.liked
    } catch (error) {
      console.error(error)
      log.error(LogCodes.LIKE_TWEET_FAILED, "Error liking tweet:", error)
      return false
    }
  }

  async unLikeTweet(tweetId: string): Promise<boolean> {
    await this.refreshTokenIfNeeded()
    const toLikeId = tweetId.replace("tweetId:", "")

    try {
      const result = await this.client.v2.unlike(this.userId!, toLikeId)
      return !result.data.liked
    } catch (error) {
      console.error(error)
      log.error(LogCodes.UNLIKE_TWEET_FAILED, "Error unliking tweet:", error)
      return false
    }
  }

  async followUser(userId: string): Promise<boolean> {
    await this.refreshTokenIfNeeded()
    const toFollowId = userId.replace("userId:", "")

    try {
      const result = await this.client.v2.follow(this.userId!, toFollowId)
      return result.data.following
    } catch (error) {
      console.error(error)
      log.error(LogCodes.FOLLOW_USER_FAILED, "Error following user:", error)
      return false
    }
  }

  async unFollowUser(userId: string): Promise<boolean> {
    await this.refreshTokenIfNeeded()
    const toFollowId = userId.replace("userId:", "")

    try {
      const result = await this.client.v2.unfollow(this.userId!, toFollowId)
      return !result.data.following
    } catch (error) {
      console.error(error)
      log.error(LogCodes.UNFOLLOW_USER_FAILED, "Error unfollowing user:", error)
      return false
    }
  }

  async retweet(tweetId: string): Promise<boolean> {
    await this.refreshTokenIfNeeded()
    const retweetId = tweetId.replace("tweetId:", "")

    try {
      const result = await this.client.v2.retweet(this.userId!, retweetId)
      return result.data.retweeted
    } catch (error) {
      console.error(error)
      log.error(LogCodes.RETWEET_FAILED, "Error retweeting:", error)
      return false
    }
  }
}
