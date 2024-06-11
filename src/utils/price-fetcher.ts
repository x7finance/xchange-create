import axios from "axios";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

const nativeTokenIds: Record<string, string> = {
  mainnet: "ethereum",
  bsc: "binancecoin",
  polygon: "matic-network",
  arbitrum: "ethereum", // Arbitrum uses ETH as its native token
  optimism: "ethereum", // Optimism uses ETH as its native token
  base: "ethereum", // Base uses ETH as its native token
};

export async function fetchNativeTokenPrice(network: string): Promise<number> {
  const tokenId = nativeTokenIds[network];

  if (!tokenId) {
    throw new Error(`Unsupported network: ${network}`);
  }

  try {
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: tokenId,
        vs_currencies: "usd",
      },
    });

    const data = response.data;
    const price = data[tokenId]?.usd;

    if (!price) {
      throw new Error(`Failed to fetch price for ${tokenId}`);
    }

    return price;
  } catch (error) {
    console.error("Error fetching native token price:", error);
    throw error;
  }
}
