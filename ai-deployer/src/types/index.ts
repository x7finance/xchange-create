export interface SocialMessage {
  platform: string
  messageType: string
  content: string
  userId: string
  tweetId: string
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
  newsHeadlines: string[]
  cryptoTrends: TrendingCoin[]
  hackerNewsTrends: string[]
  worldNews: NewsArticle[]
}

export interface MentionsTokensAndTrendReply {
  mentions: SocialMessage[]
  tokens: TokenProfile[]
  trends: Trends | null
  ourProjects: AIResponse[]
}

export interface CoinPriceChanges {
  [currency: string]: number
}

export interface TrendingCoinData {
  price: number
  price_btc: string
  price_change_percentage_24h: CoinPriceChanges
  market_cap: string
  market_cap_btc: string
  total_volume: string
  total_volume_btc: string
  sparkline: string
  content: null
}

export interface TrendingCoin {
  item: {
    id: string
    coin_id: number
    name: string
    symbol: string
    market_cap_rank: number
    thumb: string
    small: string
    large: string
    slug: string
    price_btc: number
    score: number
    data: TrendingCoinData
  }
}

export interface SocialAction {
  timestamp: any
  type?: string
  tweet?: string
  intendedPostTime?: string
  attachments?: string[]
  isThreaded?: boolean
  otherTweets?: SocialAction[]
  tweetId?: string
  comment?: string
  username?: string
  userId?: string
  query?: string
}

export interface SocialResponse {
  summary: string
  actions?: SocialAction[]
}

export interface NewsArticle {
  title: string
  text?: string
  description: string
  source: string
  url: string
}

export interface HNStory {
  title: string
  id: number
}

export interface NewsSource {
  title: string
  description: string
  url: string
  source: string
  publishedAt: Date
}
