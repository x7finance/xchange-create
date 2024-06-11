import { createPublicClient, http } from "viem";
import { arbitrum, base, bsc, mainnet, optimism, polygon, baseSepolia, sepolia } from "viem/chains";

const chainMap: Record<string, any> = {
  base: base,
  polygon: polygon,
  bsc: bsc,
  mainnet: mainnet,
  arbitrum: arbitrum,
  optimism: optimism,
  // testnets
  baseSepolia: baseSepolia,
  sepolia: sepolia,
};

export async function getGasPrice(network: string): Promise<number> {


  const chain = chainMap[network];
  const client = createPublicClient({
    chain,
    transport: http(),
  });

  const gasPrice = await client.getGasPrice();
  const gasPriceInGwei = Number(gasPrice) / 10 ** 9;

  return gasPriceInGwei;
}