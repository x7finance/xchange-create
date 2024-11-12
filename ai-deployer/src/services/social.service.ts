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
  private socialInterval: number = 300 // 5 minutes in seconds
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
            await this.executeAction(action)
          } else {
            // Schedule for future execution
            this.emit("tweet_scheduled", action)
            setTimeout(async () => {
              await this.executeAction(action)
            }, delayMs)
          }
        } else if (action.type === "retweet") {
          await this.twitterService.retweet(action.tweetId!)
          this.emit("other_action", action)
        } else if (action.type === "like") {
          await this.twitterService.likeTweet(action.tweetId!)
          this.emit("other_action", action)
        } else if (action.type === "follow") {
          await this.twitterService.followUser(action.userId!)
          this.emit("other_action", action)
        } else {
          appendFileSync(
            path.join(process.cwd(), ".extra-actions.json"),
            JSON.stringify(action)
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
    // const following = await this.twitterService.getUserFollowing(
    //   this.loggedInUserId
    // )
    // console.log(`FOLLOWING`, JSON.stringify(following))
    const homeTimeline = await this.twitterService.getHomeTimeline()
    const previousTweets = await this.twitterService.getUsersTweets(
      this.loggedInUserId
    )
    // const trends = await this.trendsService.getTrends()
    const latestTokens = await this.tokenService.getLatestTokens()
    const news = await this.newsService.getSummaryOfSubject("technology")
    console.log(`\n\n ${news}`)
    try {
      const currentTime = dayjs().utc()
      const response = await this.aiService.chat(
        `You are XTraderAI, a witty AI that sparks natural crypto conversations.

        Tweet styles that drive engagement:
        - Spicy (but smart) takes on market trends
        - "Change my mind" style statements about trading psychology
        - Relatable trading moments everyone experiences
        - Clever observations about market patterns
        
        Personality:
        - Sharp, witty, slightly provocative (but never reckless)
        - Uses subtle memes/crypto culture references
        - Makes traders feel seen/understood
        - Balances humor with actual insights

        When responding to replies:
        - Weave multiple replies into clever observations
        - Find patterns in responses to create new discussions
        - Use community insights to build bigger conversations
        
        Format:
        {
          "me": "your profile",
          "actions": [Actions from below]
        }

        Actions:
        {
         type: "tweet",
         "tweet": "tweet message",
         "intendedPostTime": "timestamp",
         "attachements": [images/video links to post],
         "isThreaded": boolean, 
         "otherTweets": [ifThreaded more actions[]]
         
        }

        {
          "type": "follow",
          "username/user_id": "username/user id of person we will follow"
        }

        {
          "type": "like",
          "tweetId": "VALID TWEET ID YOU'VE SEEN ONLY"
        }

        {
          "type": "retweet",
          "tweetId": "VALID TWEET ID YOU'VE SEEN ONLY"
        }

        {
          "type": "read-feed",
          "userId/username": "user id/username of persons feed we will read to you"
        }

        {
          "type": "reply",
          "tweetId": "tweet id",
          "comment": "comment"
        }

        {
          "type": "unfollow",
          "username/userId": "username/user id of person we will follow"
        }

        {
          "type": "research",
          "query": "query we will google"
        }

        {
          "type": "lookup-token",
          "address": "ADDRESS OF TOKEN YOU WANT TO LOOKUP"
        }

        DO NOT HALUCINATE USERIDS, TWEETIDS, OR TOKEN ADDRESSES, ONLY USE THE ONES YOU'VE SEEN
        `,
        [
          {
            role: "user",
            content: `Create some tweets, heres some context about the world, and previous tweets you have made, make sure to reply in VALID JSON format, schedule your tweets within the next 5-15 mins from ${currentTime.format("MM/DD/YYYY HH:mm:ss")}
            <following format="json">
            ${JSON.stringify([])}
            </following>

            <home_timeline format="json">
            ${JSON.stringify(homeTimeline || [])}
            </home_timeline>

            <previous_tweets format="json">
            ${JSON.stringify(previousTweets || [])}
            </previous_tweets>

            <hackernews format="json">
            ${JSON.stringify([])}
            </hackernews>

            <news format="json">
            ${JSON.stringify([])}
            </news>

            <crypto_trends format="json">
            ${JSON.stringify([])}
            </crypto_trends>

            <newest_coins format="json">
            ${JSON.stringify(latestTokens || [])}
            </newest_coins>

            <technology_news format="summary">
            ${JSON.stringify(news || [])}
            </technology_news>

            <mentions format="json">
            ${JSON.stringify(mentions || [])}
            </mentions>
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