import { TwitterApi } from "twitter-api-v2"
import { SocialAction, SocialMessage } from "../types"
import { log, LogCodes } from "../logger"
import http from "http"

import { writeFileSync, readFileSync, existsSync } from "fs"
import path from "path"
import * as open from "open"

export class TwitterService {
  private static instance: TwitterService | null = null
  private client: TwitterApi
  private lastCheckedId?: string
  private userId?: string
  private server?: http.Server
  private tokenPath: string
  private codeVerifier: string
  private state: string

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
        }
      })

      TwitterService.instance = instance
    }
    return TwitterService.instance
  }

  private async startOAuthFlow(): Promise<void> {
    return new Promise((resolve, reject) => {
      const callbackPort = 42069
      const callbackUrl = `http://localhost:${callbackPort}/callback`

      this.server = http
        .createServer(async (req, res) => {
          if (req.url?.startsWith("/callback")) {
            const url = new URL(req.url, `http://localhost:${callbackPort}`)
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
          scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
        }
      )

      this.codeVerifier = codeVerifier
      this.state = state
      // Open the authorization URL in the default browser
      open.default(url)

      console.log(
        "If your browser doesn't open automatically, please visit this URL:",
        url
      )
    })
  }

  async getMentions(userId?: string): Promise<SocialMessage[]> {
    try {
      await this.refreshTokenIfNeeded()

      const mentions = await this.client.v2.userMentionTimeline(
        userId || this.userId!
      )

      console.log(mentions)
      if (mentions.data && mentions.data.data.length > 0) {
        this.lastCheckedId = mentions.data.data[0].id
      }

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

  async postTweet(content: SocialAction): Promise<boolean> {
    try {
      await this.refreshTokenIfNeeded()

      if (content.isThreaded && content.otherTweets!.length > 0) {
        let lastTweetId: string | undefined

        for (const tweet of [content, ...content.otherTweets!]) {
          const response = await this.client.v2.tweet(tweet.tweet, {
            reply: lastTweetId
              ? { in_reply_to_tweet_id: lastTweetId }
              : undefined,
          })
          lastTweetId = response.data.id
        }
      } else {
        await this.client.v2.tweet(content.tweet)
      }
      return true
    } catch (error) {
      console.error(error)
      log.error(LogCodes.POST_TWEET, "Error posting tweet:", error)
      return false
    }
  }
}
