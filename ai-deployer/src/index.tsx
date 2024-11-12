import React from "react"
import { render } from "ink"
import { HomeView } from "./views/home"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Validate environment variables
const requiredEnvVars = [
  "ANTHROPIC_API_KEY",
  "TWITTER_API_KEY",
  "TWITTER_API_SECRET",
  "TWITTER_ACCESS_TOKEN",
  "TWITTER_ACCESS_SECRET",
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not set in environment variables`)
  }
}

// class MemeTokenDaemon {
//   private aiService: AIService
//   private twitterService: TwitterService
//   private trendsService: TrendsService
//   private isRunning: boolean = false
//   private checkInterval: number = 1 * 60 * 1000 // 1 minutes
//   private tokenService: TokenService
//   constructor() {
//     this.tokenService = new TokenService()
//     this.aiService = new AIService(
//       process.env.ANTHROPIC_API_KEY!,
//       this.tokenService
//     )
//     this.trendsService = new TrendsService()
//     this.twitterService = new TwitterService(
//       process.env.TWITTER_API_KEY!,
//       process.env.TWITTER_API_SECRET!,
//       process.env.TWITTER_ACCESS_TOKEN!,
//       process.env.TWITTER_ACCESS_SECRET!,
//       process.env.TWITTER_ID!
//     )
//   }

//   async start() {
//     this.isRunning = true
//     log.info(LogCodes.DAEMON_START, "MemeToken Daemon started")

//     while (this.isRunning) {
//       try {
//         const mentions = await this.twitterService.getMentions()
//         console.log(`Mentions:`, { mentions })

//         const trends = await this.trendsService.getTrends()
//         console.log(`Trending topics:`, { trends })

//         const latestTokens = await this.tokenService.getLatestTokens()
//         console.log(`Latest tokens:`, { latestTokens })
//         const thoughts = await this.aiService.autonomousThoughts({
//           mentions,
//           tokens: latestTokens,
//           trends,
//         })
//         console.log(JSON.stringify({ thoughts }))
//         log.info(LogCodes.AUTONOMOUS_THOUGHTS, "Autonomous thoughts:", thoughts)
//         await sleep(this.checkInterval)
//         // // Get social media updates
//         // const messages = await this.twitterService.getMentionsAndTrends()

//         // // Process each message
//         // for (const message of messages) {
//         //   const aiResponse = await this.aiService.generateResponse(message)

//         //   if (aiResponse.action?.type === "deploy_token") {
//         //     // Handle token deployment
//         //     log.info(
//         //       LogCodes.TOKEN_DEPLOYMENT,
//         //       "Deploying token:",
//         //       aiResponse.action.parameters
//         //     )
//         //     // Add token deployment logic here
//         //   }
//         // }

//         // Wait for next check
//         await new Promise(resolve => setTimeout(resolve, this.checkInterval))
//       } catch (error) {
//         log.error(LogCodes.DAEMON_ERROR, "Error in daemon loop:", error)
//         await new Promise(resolve => setTimeout(resolve, 30000)) // Wait 30s on error
//       }
//     }
//   }

//   stop() {
//     this.isRunning = false
//     log.info(LogCodes.DAEMON_STOP, "MemeToken Daemon stopped")
//   }
// }

// // Start the daemon
// const daemon = new MemeTokenDaemon()
// daemon.start()

// // Handle graceful shutdown
// process.on("SIGTERM", () => daemon.stop())
// process.on("SIGINT", () => daemon.stop())

const enterAltScreenCommand = "\x1b[?1049h"
const leaveAltScreenCommand = "\x1b[?1049l"
process.stdout.write(enterAltScreenCommand)
process.on("exit", () => {
  process.stdout.write(leaveAltScreenCommand)
})

render(<HomeView />)
