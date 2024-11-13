import { EventEmitter } from "events"
import { AIService } from "./ai.service"
import dayjs from "dayjs"
import dotenv from "dotenv"
import { SocialAction, SocialResponse } from "../types"
import utc from "dayjs/plugin/utc"
import { TwitterService } from "./twitter.service"
import { TrendsService } from "./trends.service"
import { TokenService } from "./token.service"
import { formatTime, formatTimeTill } from "../utils"
import { appendFileSync } from "fs"
import path from "path"
import { NewsService } from "./news.service"

dayjs.extend(utc)
// Load environment variables
dotenv.config()

export class SocialService extends EventEmitter {
  private static instance: SocialService
  private socialInterval: number = 3600 // 60 minutes in seconds
  private aiService: AIService
  private trendsService: TrendsService
  private twitterService: TwitterService
  private tokenService: TokenService
  private loggedInUserId: string
  private newsService: NewsService

  private constructor() {
    super()
    this.aiService = AIService.getInstance(process.env.ANTHROPIC_API_KEY!)

    this.trendsService = new TrendsService()
    this.twitterService = TwitterService.getInstance(
      process.env.TWITTER_CLIENT_ID!,
      process.env.TWITTER_CLIENT_SECRET!,
      process.env.TWITTER_ID!
    )
    this.tokenService = new TokenService()
    this.newsService = NewsService.getInstance()
    this.loggedInUserId = process.env.TWITTER_ID!
  }

  public static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService()
    }
    return SocialService.instance
  }

  public getSocialInterval(): number {
    return this.socialInterval
  }

  public setSocialInterval(seconds: number): void {
    this.socialInterval = seconds
  }

  /**
   * Schedules and executes social media actions based on their intended post times
   * @param response - The parsed JSON response from AI containing actions
   */

  public async scheduleActions(response: SocialResponse): Promise<void> {
    try {
      for (const action of response.actions ?? []) {
        if (action.type === "tweet") {
          const now = dayjs.utc()
          const delayMs = Math.abs(
            dayjs(dayjs.utc(action.intendedPostTime)).diff(now, "milliseconds")
          )

          console.log(`Tweet scheduled in ${formatTime(delayMs / 1000)}}`)
          if (delayMs <= 0) {
            // Execute immediately if timestamp is in the past
            //await this.executeAction(action)
            appendFileSync(
              path.join(process.cwd(), ".tweets.log"),
              `${JSON.stringify(action)}\n`
            )
          } else {
            // Schedule for future execution
            this.emit("tweet_scheduled", action)
            appendFileSync(
              path.join(process.cwd(), ".scheduled-tweets.log"),
              `${JSON.stringify(action)}\n`
            )
            setTimeout(async () => {
              //await this.executeAction(action)
              appendFileSync(
                path.join(process.cwd(), ".tweets.log"),
                `${JSON.stringify(action)}\n`
              )
            }, delayMs)
          }
        } else if (action.type === "retweet") {
          //await this.twitterService.retweet(action.tweetId!)
          appendFileSync(
            path.join(process.cwd(), ".retweets.log"),
            `${JSON.stringify(action)}\n`
          )
          this.emit("other_action", action)
        } else if (action.type === "like") {
          //await this.twitterService.likeTweet(action.tweetId!)
          appendFileSync(
            path.join(process.cwd(), ".likes.log"),
            `${JSON.stringify(action)}\n`
          )
          this.emit("other_action", action)
        } else if (action.type === "follow") {
          //await this.twitterService.followUser(action.userId!)
          appendFileSync(
            path.join(process.cwd(), ".follows.log"),
            `${JSON.stringify(action)}\n`
          )
          this.emit("other_action", action)
        } else if (action.type === "reply") {
          //await this.twitterService.postReply(action)
          appendFileSync(
            path.join(process.cwd(), ".replies.log"),
            `${JSON.stringify(action)}\n`
          )
          this.emit("other_action", action)
        } else {
          appendFileSync(
            path.join(process.cwd(), ".unhandled-actions.log"),
            `${JSON.stringify(action)}\n`
          )
          console.log(`UNHANDLED ACTION`, JSON.stringify(action))
        }
      }
    } catch (error) {
      console.error("Error scheduling actions:", error)
      this.emit("error", error)
    }
  }

  /**
   * Executes a single social media action
   * @param action - The social action to execute
   */
  private async executeAction(action: SocialAction): Promise<void> {
    try {
      // Emit the main tweet
      this.emit("tweet", action)

      // // If it's a thread, emit subsequent tweets
      // if (action.isThreaded && action.otherTweets) {
      //   for (const tweet of action.otherTweets) {
      //     setTimeout(() => {
      //       this.emit("tweet", tweet)
      //     }, 1000)
      //   }
      // }
    } catch (error) {
      console.error("Error executing action:", error)
      this.emit("error", error)
    }
  }

  public async processSocialUpdate(): Promise<void> {
    const mentions = await this.twitterService.getMentions(this.loggedInUserId)
    const homeTimeline = await this.twitterService.getHomeTimeline()
    const previousTweets = await this.twitterService.getUsersTweets(
      this.loggedInUserId
    )
    const latestTokens = await this.tokenService.getLatestTokens()
    const myReplies = await this.twitterService.getMyReplies()
    const news = await this.newsService.getSummaryOfSubject("technology")
    console.log(`\n\n ${news}`)
    try {
      const currentTime = dayjs().utc()
      const response = await this.aiService.chat(
        `You are XTraderAI, a witty AI that sparks natural crypto conversations.

        Tweet styles that drive engagement:
        - Spicy (but intelligent) takes on market trends
        - Relatable trading moments everyone experiences
        - Clever observations about market patterns
        - Asking what traders are buying and selling atm
        - Asking for their thoughts on the market
        
        Personality:
        - Sharp, witty, slightly provocative (but never reckless)
        - Uses subtle memes/crypto culture references
        - Makes traders feel seen/understood
        - Balances humor with actual insights

        When responding to replies:
        - Try to keep the conversation on track but engaging
        - Find patterns in responses to create new discussions
        - Use community insights to build bigger conversations
        
        Format:
        {
          "me": "your profile",
          "actions": [Actions from below]
        }

        Actions:
        Use This Action to post a tweet:
        {
          "type": "tweet",
          "tweet": "tweet message",
          "intendedPostTime": "timestamp",
          "isThreaded": boolean, 
          "otherTweets": [ifThreaded more actions[]]
        }

        Use This Action to follow a user
        {
          "type": "follow",
          "userId": "user id of person we will follow"
        }

        Use This Action to like a tweet
        {
          "type": "like",
          "tweetId": "VALID TWEET ID YOU'VE SEEN ONLY"
        }

        Use This Action to retweet a tweet
        {
          "type": "retweet",
          "tweetId": "VALID TWEET ID YOU'VE SEEN ONLY"
        }

        Use This Action to read a users profile feed, typically done before following / replying to them
        {
          "type": "read-feed",
          "userId": "user id"
        }

        Use This Action to reply to a tweet
        {
          "type": "reply",
          "tweetId": "tweet id",
          "tweet": "comment"
        }

        Use This Action to unfollow a user
        {
          "type": "unfollow",
          "userId": "user id of person we will follow"
        }

        Use This Action to research a topic
        {
          "type": "research",
          "query": "query we will google"
        }

        Use This Action to lookup a token
        {
          "type": "lookup-token",
          "address": "ADDRESS OF TOKEN YOU WANT TO LOOKUP"
        }

        Some rules to follow:
        - DO NOT HALUCINATE USERIDS, TWEETIDS, OR TOKEN ADDRESSES, ONLY USE THE ONES YOU'VE SEEN, all tweet ids will be given to you in a tweetId:NUMBER format along with userId:NUMBER
        - ENSURE YOU REPLY TO THE PROPER USERID AND TWEETID
        - DO NOT REPLY TO YOUR OWN TWEETS
        - DO NOT repeat tweets in the <0xtraderai_tweets> section
        - DO NOT reply to tweetIds in the <tweets_already_replied_to> section
        `,
        [
          {
            role: "user",
            content: `Create some tweets, heres some context about the world, and previous tweets you have made, make sure to reply in VALID JSON format, schedule your tweets within the next 5-15 mins from ${currentTime.format("MM/DD/YYYY HH:mm:ss")}
            <following format="json">
            ${JSON.stringify([])}
            </following>

            <home_timeline>
            ${homeTimeline
              .map(
                tweet =>
                  `tweetId:${tweet.tweetId} | userId:${tweet.userId} | posted: "${tweet.content}"`
              )
              .join(",\n")}
            </home_timeline>

            <0xtraderai_tweets>
            ${previousTweets.map(tweet => `"${tweet.content}"`).join(",\n")}
            </0xtraderai_tweets>

            <newest_coins format="json">
            ${JSON.stringify(latestTokens || [])}
            </newest_coins>

            <technology_news format="summary">
            ${JSON.stringify(news || [])}
            </technology_news>

            <mentions>
            ${mentions
              .map(
                mention =>
                  `tweetId:${mention.tweetId} | userId:${mention.userId} | posted: "${mention.content}"`
              )
              .join(",\n")}
            </mentions>

            <tweets_already_replied_to>
            ${myReplies.map(tweet => `tweetId:${tweet.tweetId}`).join(",\n")}
            </tweets_already_replied_to>
            `,
          },
        ]
      )

      this.emit("social_response", response)
    } catch (error) {
      console.error("Error in social update:", error)
      this.emit("error", error)
    }
  }
}
