export interface SocialMessage {
  platform: "twitter" | "discord" | "telegram"
  messageType: "tweet" | "mention" | "dm" | "reply"
  content: string
  userId: string
  timestamp: string
  originalMessage?: SocialMessage // For replies/quotes
}

export interface TokenProfile {
  chainId: string
  tokenAddress: string
  description?: string
  links?: Array<{
    label?: string
    type?: string
    url: string
  }>
}

export interface AIResponse {
  message: string
  why: string
  action?: {
    type: "deploy_token" | "tweet" | "no_action"
    parameters?: {
      tokenType?: "deflationary" | "tax" | "regular"
      name?: string
      symbol?: string
      initialSupply?: string
      [key: string]: any
    }
  }

  actionOrderId: string
  type: "deploy_token" | "tweet" | "no_action"
  time: string
  parameters: {
    tweet: string
    tokenType: "deflationary" | "tax" | "regular"
    name: string
    symbol: string
    description: string
    initialSupply: string
    tax: string
    [x: string]: any
  }
}

export interface TokenDeployment {
  type: "deflationary" | "tax" | "regular"
  name: string
  symbol: string
  initialSupply: string
  deployerAddress: string
  network: string
  timestamp: string
}

export interface Trends {
  googleTrends: string[]
  cryptoTrends: string[]
  newsHeadlines: string[]
}

export interface MentionsTokensAndTrendReply {
  mentions: SocialMessage[]
  tokens: TokenProfile[]
  trends: Trends | null
  ourProjects: AIResponse[]
}
