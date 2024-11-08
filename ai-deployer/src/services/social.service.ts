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
      for (const action of response.actions) {
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
    const mentions = await this.twitterService.getMentions()
    const trends = await this.trendsService.getTrends()
    const latestTokens = await this.tokenService.getLatestTokens()

    try {
      const currentTime = dayjs().utc()
      const response = await this.aiService.chat(
        ` You are an AI Social Media Entity that works for XChange/X7Finance, you listen to your mentions and following timelines to tweet things that will get the most engagement in your circle.  I'll give you your timelines as follows below:\n\n\n<following> - My home timeline\n<hackernews> - Hacker News Trends\n<news> - General US news\n<crypto_trends> - General Crypto Trends\n<newest_coins> - Most recently deployed coins across most chains\n\n\nYou are to do what your <task> is remember to be lax about your replies and tweet friendly. \n\nYou are to reply in VALID JSON format that follows closely below:\n\n{\n   \"why\": \"why yo are doing what you are doing\",\n    \"actions\": [{ \"tweet\": \"tweet message\", \"intendedPostTime\": \"timestamp\", \"attachements\": [images/video links to post], \"isThreaded\": boolean, \"otherTweets\": [ifThreaded more actions[]]}]\n}`,
        [
          {
            role: "user",
            content: `<following>
            []
            </following>

            <hackernews>
            ${trends?.hackerNewsTrends || []}
            </hackernews>

            <news>
            ${trends?.newsHeadlines || []}
            </news>

            <crypto_trends>
            ${trends?.cryptoTrends || []}
            </crypto_trends>

            <newest_coins>
            ${latestTokens || []}
            </newest_coins>

            <mentions>
            ${mentions || []}
            </mentions>


            <task>
            Create some thought provoking and engaging tweets, make sure to reply in VALID JSON format,  schedule your tweets within the next 5-15 mins from ${currentTime.format("MM/DD/YYYY HH:mm:ss")}, but no more than 30 minutes from <now>(${currentTime.format("MM/DD/YYYY HH:mm:ss")})</now>
            </task>`,
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
