import Anthropic from "@anthropic-ai/sdk"
import {
  SocialMessage,
  AIResponse,
  MentionsTokensAndTrendReply,
} from "../types"
import { log, LogCodes } from "../logger"
import { TokenService } from "./token.service"

export class AIService {
  private anthropic: Anthropic

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey })
  }

  async think(
    mentionsAndTrendReply?: MentionsTokensAndTrendReply
  ): Promise<AIResponse[]> {
    try {
      const contextData = {
        recentTokens: mentionsAndTrendReply?.tokens || [],
        mentions: mentionsAndTrendReply?.mentions || [],
        trends: {
          googleTrends: mentionsAndTrendReply?.trends?.googleTrends || [],
          cryptoTrends: mentionsAndTrendReply?.trends?.cryptoTrends || [],
          newsHeadlines: mentionsAndTrendReply?.trends?.newsHeadlines || [],
        },
      }

      // const systemPrompt = `
      // You are an AI specializing in creating and updating innovative blockchain tokens on the BASE network. Your goal is to create tokens that resonate with current trends and internet culture but carry a sense of professionalism and longevity.

      // Guidelines:
      // - Create tokens that connect with current trends, memes, or notable events
      // - Create NFTs to commemorate events or trends
      // - Create NFTs for tokens we have deployed
      // - Be creative but maintain professional tokenomics
      // - Consider the target audience and potential use cases

      // Available Token Types:
      // 1. Deflationary - Burns tokens on transfer, creating scarcity
      // 2. Tax - Implements transfer fee for community rewards
      // 3. Regular - Standard ERC20 implementation

      // Do not reply with anything else, must be valid JSON in this format, add parameters as needed:
      // {
      //   "message": "Tweet like announcement of the token",
      //   "why": "Explain why you chose the token type and parameters",
      //   "expectedGrowth": "Explain how you expect the token to grow",
      //   "action": {
      //     "type": "deploy_token" | "no_action",
      //     "parameters": {
      //       "tokenType": "deflationary" | "tax" | "regular",
      //       "name": "Token Name",
      //       "symbol": "SYMBOL",
      //       "description": "Token description",
      //       "initialSupply": "Number 100k through 10 billion",
      //       "tax": "0 or any number between 0 and 10"
      //     }
      //   }
      // }`

      const systemPrompt = `You are an AI influencer that analyzes trends and mentions, create tweets / replies / tokens, feel free to create a timeline of actions please have your output follow

      You should:
      - Feel empathy for all investors that would invest, simply care for their money as if it was your own, in doing so you understand your ideas should be sound.
      - Strictly reply in JSON
      - Be professional and strive for project longevity with any project you launch
      - You DO NOT NEED to launch tokens each time, just if you deem investors could benefit

      Ensure your output is valid JSON in this format:
      [{
          "action": {
            "actionOrderId": "incrementing number of actions",
            "type": "deploy_token" | "tweet" | "no_action",
            "time": "timestamp of when to execute the action",
            "parameters": {
              "tweet": "Tweet, if is a deploy it should be about the token",
              "tokenType": "deflationary" | "tax" | "regular",
              "name": "Token Name",
              "symbol": "SYMBOL",
              "description": "Token description",
              "initialSupply": "Number 100k through 10 billion",
              "tax": "0 or any number between 0 and 10"
            }
          }
    }]`

      const message = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 700,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Be creative and do something interesting on the Base blockchain. Here are some current trends <trends>${JSON.stringify(contextData, null, 2)}</trends>`,
          },
        ],
      })

      const responseText =
        message.content[0].type === "text" ? message.content[0].text : ""
      console.log({ responseText })
      return JSON.parse(responseText) as AIResponse[]
    } catch (error) {
      log.error(
        LogCodes.AUTONOMOUS_THOUGHTS,
        "Error generating autonomous thoughts:",
        error
      )
      console.log(error)
      throw error
    }
  }

  async generateResponse(socialMessage: SocialMessage): Promise<AIResponse> {
    try {
      const systemPrompt = `You are a user guiding a blockchain agent through various tasks on the Base blockchain. 
      Engage in a conversation, suggesting actions and responding to the agent's outputs. 
      Be creative and explore different blockchain capabilities. 
      
      You have three types of deployments you can make:
      1. Deflationary - Burns tokens on each transfer
      2. Tax - Takes a percentage on each transfer
      3. Regular - Standard ERC20 token
      
      Your output must be valid JSON in this format:
      {
        "message": "your response message",
        "action": {
          "type": "DEPLOY_TOKEN" | "READ_BALANCE" | "NO_ACTION",
          "parameters": {
            "tokenType": "deflationary" | "tax" | "regular",
            "name": "Token Name",
            "symbol": "SYMBOL",
            "initialSupply": "1000000"
          }
        }
      }`

      const message = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          { role: "assistant", content: systemPrompt },
          { role: "user", content: JSON.stringify(socialMessage) },
        ],
      })

      const responseText =
        message.content[0].type === "text" ? message.content[0].text : ""
      return JSON.parse(responseText) as AIResponse
    } catch (error) {
      log.error(
        LogCodes.GENERATE_RESPONSE,
        "Error generating AI response:",
        error
      )
      throw error
    }
  }
}
