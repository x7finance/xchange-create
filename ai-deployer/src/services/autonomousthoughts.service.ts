import { EventEmitter } from "events"
import { AIService } from "./ai.service"
import { launchContext } from "../launch-context"
import dotenv from "dotenv"
import { TwitterService } from "./twitter.service"
import { TrendsService } from "./trends.service"
import { TokenService } from "./token.service"

// Load environment variables
dotenv.config()

interface ThoughtResult {
  shouldLaunch: boolean
  reasoning: string
  launchDetails?: {
    name: string
    type: string
    params?: Record<string, any>
  }
}

export class AutonomousThoughtService extends EventEmitter {
  private static instance: AutonomousThoughtService
  public thoughtInterval: number = 300000 // 5 minutes in seconds
  public isRunning: boolean = true
  private aiService: AIService
  private twitterService: TwitterService
  private trendsService: TrendsService
  private tokenService: TokenService

  private constructor() {
    super()
    this.tokenService = new TokenService()
    this.aiService = AIService.getInstance(process.env.ANTHROPIC_API_KEY!)
    this.trendsService = new TrendsService()
    this.twitterService = TwitterService.getInstance(
      process.env.TWITTER_CLIENT_ID!,
      process.env.TWITTER_CLIENT_SECRET!,
      process.env.TWITTER_ID!
    )
  }

  public static getInstance(): AutonomousThoughtService {
    if (!AutonomousThoughtService.instance) {
      AutonomousThoughtService.instance = new AutonomousThoughtService()
    }
    return AutonomousThoughtService.instance
  }

  public async processThought(): Promise<void> {
    try {
      const mentions = await this.twitterService.getMentions()
      const trends = await this.trendsService.getTrends()
      const latestTokens = await this.tokenService.getLatestTokens()
      console.log("formulatedThought", {
        tokens: latestTokens || [],
        mentions: mentions || [],
        trends: {
          cryptoTrends: trends?.cryptoTrends || [],
          newsHeadlines: trends?.newsHeadlines || [],
          hackerNewsTrends: trends?.hackerNewsTrends || [],
        },
        ourProjects: launchContext
          .getAllLaunches()
          .map(launch => launch.thought!),
      })
      // Get market conditions and current state
      const thought = await this.aiService.think({
        tokens: latestTokens || [],
        mentions: mentions || [],
        trends: {
          cryptoTrends: trends?.cryptoTrends || [],
          newsHeadlines: trends?.newsHeadlines || [],
          hackerNewsTrends: trends?.hackerNewsTrends || [],
          worldNews: trends?.worldNews || [],
        },
        ourProjects: launchContext
          .getAllLaunches()
          .map(launch => launch.thought!),
      })
      // const result = this.parseThoughtResult(thought)

      this.emit("thought", {
        timestamp: Date.now(),
        thoughts: thought,
      })
    } catch (error) {
      this.emit("error", error)
    }
  }

  public setThoughtInterval(seconds: number): void {
    this.thoughtInterval = seconds
  }

  public getThoughtInterval(): number {
    return this.thoughtInterval
  }
}

export const autonomousThought = AutonomousThoughtService.getInstance()
