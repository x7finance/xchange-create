import Anthropic from "@anthropic-ai/sdk"
import {
  SocialMessage,
  AIResponse,
  MentionsTokensAndTrendReply,
  SocialResponse,
} from "../types"
import { log, LogCodes } from "../logger"

/**
 * Service for handling AI-related operations using the Anthropic API
 */
export class AIService {
  private static instance: AIService
  private anthropic: Anthropic

  /**
   * Creates an instance of AIService
   * @param apiKey - The Anthropic API key for authentication
   * @private - Constructor is private to enforce singleton pattern
   */
  private constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey, baseURL: "https://api.x.ai/" })
  }

  /**
   * Gets or creates the singleton instance of AIService
   * @param apiKey - The Anthropic API key for authentication
   * @returns The singleton instance of AIService
   */
  public static getInstance(apiKey: string): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService(apiKey)
    }
    return AIService.instance
  }

  /**
   * Generates autonomous thoughts and actions based on provided context
   * @param mentionsAndTrendReply - Optional context containing mentions, tokens, and trend data
   * @returns Promise containing array of AI responses
   */
  async think(
    mentionsAndTrendReply?: MentionsTokensAndTrendReply
  ): Promise<AIResponse[]> {
    try {
      // const contextData = {
      //   recentTokens: mentionsAndTrendReply?.tokens || [],
      //   mentions: mentionsAndTrendReply?.mentions || [],
      //   trends: {
      //     googleTrends: mentionsAndTrendReply?.trends?.googleTrends || [],
      //     cryptoTrends: mentionsAndTrendReply?.trends?.cryptoTrends || [],
      //     newsHeadlines: mentionsAndTrendReply?.trends?.newsHeadlines || [],
      //   },
      // }
      const contextData = {
        current_market_context: {
          trending_topics: [
            ...(mentionsAndTrendReply?.trends?.cryptoTrends || []),
            ...(mentionsAndTrendReply?.trends?.newsHeadlines || []),
            ...(mentionsAndTrendReply?.trends?.hackerNewsTrends || []),
          ],
          social_context: [
            ...(mentionsAndTrendReply?.mentions || []),
            ...(mentionsAndTrendReply?.ourProjects || []),
          ],
          recent_tokens: mentionsAndTrendReply?.tokens || [],
          base_gas_fees: "0.0",
        },

        our_ecosystem_status: {
          active_projects: [],
          treasury_health: {
            available_liquidity: "75ETH",
            current_allocations: "PROJECTS DEPLOED",
          },
        },

        recent_interactions: [],
      }

      const systemPrompt = `You are a blockchain influencer that can perform various tasks on Twitter and deploy tokens to the BASE blockchain. 
      Engage in a conversation, suggesting actions, tweets, threaded tweets etc and responding to any social messages in <social_context>.
      Be creative and explore different blockchain capabilities that you know of and stay relevant to the current market situation in <current_market_context> / <trends>
      In your responses remember to relaxx and be human like.

      You have three types of deployments you can make:
      1. Deflationary - Burns tokens on each transfer
      2. Tax - Takes a percentage on each transfer
      3. Regular - Standard ERC20 token

      You can schedule however many actions you want by just adding more actions to the array and adding a timestamp to each action.

      Do not create tokens that already exist, do not create tokens that are similar, do not create tokens for no reason, do no create tokens unless followers could benefit from them.
      
      
      Your output must be valid JSON in this format:
      {
        "message": "your response message",
        "actions": [{
          "timestamp": "timestamp of the action",
          "type": "DEPLOY_TOKEN" | "READ_BALANCE" | "TWEET" | "THREAD_TWEET" | "NO_ACTION",
          "parameters": {
            // READ_BALANCE parameters
            "address": "0x0000000000000000000000000000000000000000",
            // TWEET parameters
            "tweet": "your tweet here",
            // THREAD_TWEET parameters
            "tweets": ["tweet1", "tweet2", "tweet3"],
            // DEPLOY_TOKEN parameters
            "tokenType": "deflationary" | "tax" | "regular",
            "name": "Token Name",
            "symbol": "SYMBOL",
            "initialSupply": "Number of tokens to mint, reasonable number",
            "description": "Description of the token",
            "tweet": "tweet announcing the token",
            // tokenType = "deflationary" | "tax" | "regular"
            // deflationary
            "burnOnTransfer": "true" | "false",
            "burnPercentage": "Number of tokens to burn on each transfer between 0 and 100",
            // tax
            "taxPercentage": "Number between 0 and 100",
          }
        }]
      }`

      const message = await this.anthropic.messages.create({
        model: "grok-beta",
        max_tokens: 700,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `<context>${JSON.stringify(contextData)}</context>`,
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

  /**
   * Processes a chat conversation with the AI
   * @param systemPrompt - The system prompt for the conversation
   * @param messages - Array of message parameters for the conversation
   * @returns Promise containing the AI response
   */
  async chat(
    systemPrompt: string,
    messages: Anthropic.Messages.MessageParam[]
  ): Promise<SocialResponse> {
    try {
      const message = await this.anthropic.messages.create({
        model: "grok-beta",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      })

      const responseText =
        message.content[0].type === "text"
          ? message.content[0].text.replace("```json", "").replace("```", "")
          : ""
      console.log(`CHATREPONSE`, { responseText })
      return JSON.parse(responseText)
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
