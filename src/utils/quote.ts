import { getGasPrice } from "./gas-price";
import { Table } from "console-table-printer";
import { ammPoolsPerChain, Chain } from "./amm-pools";
import { Options } from "../types";
import { fetchNativeTokenPrice } from "./price-fetcher";
import { NativeTokenContracts } from "./native-token-addresses";

interface QuoteData {
  pool: string;
  deploymentCost: number;
  pairCreationCost: number;
  lendingPoolApprovalCost?: number | "N/A";
  loanInitiationCost?: number | "N/A";
  deploymentCostUsd?: number | "N/A";
  pairCreationCostUsd?: number | "N/A";
  lendingPoolApprovalCostUsd?: number | "N/A";
  loanInitiationCostUsd?: number | "N/A";
}

export async function displayQuote(options: Options) {
  const { network, contractType, usd } = options;

  if (!isValidNetwork(network)) {
    console.error(`Error: Unsupported network "${network}". Supported networks are: ${Object.keys(ammPoolsPerChain).join(", ")}.`);
    return;
  }

  if (!isValidContractType(contractType)) {
    console.error(`Error: Unsupported contract type "${contractType}". Supported contract types are: standard-token, tax-token, deflationary-token, my-custom-contract.`);
    return;
  }

  const gasPrice = await getGasPrice(network as Chain);

  const availablePools = ammPoolsPerChain[network as Chain];

  const nativeTokenAddress = NativeTokenContracts[network as Chain];
  const nativeTokenPrice = usd ? await fetchNativeTokenPrice(network) : 0;

  const quoteData: QuoteData[] = availablePools.map((pool) => ({
    pool,
    deploymentCost: calculateDeploymentCost(gasPrice, contractType),
    pairCreationCost: calculatePairCreationCost(gasPrice, contractType),
    lendingPoolApprovalCost: pool === "Xchange" ? calculateLendingPoolApprovalCost(gasPrice, contractType) : "N/A",
    loanInitiationCost: pool === "Xchange" ? calculateLoanInitiationCost(gasPrice, contractType) : "N/A",
    deploymentCostUsd: usd ? calculateDeploymentCost(gasPrice, contractType) * nativeTokenPrice : undefined,
    pairCreationCostUsd: usd ? calculatePairCreationCost(gasPrice, contractType) * nativeTokenPrice : undefined,
    lendingPoolApprovalCostUsd: pool === "Xchange" && usd ? calculateLendingPoolApprovalCost(gasPrice, contractType) * nativeTokenPrice : "N/A",
    loanInitiationCostUsd: pool === "Xchange" && usd ? calculateLoanInitiationCost(gasPrice, contractType) * nativeTokenPrice : "N/A",
  }));

  const table = new Table({
    title: "Cost To Deploy Contract + AMM Pool",
    columns: [
      { name: "Network", alignment: "left" },
      { name: "Pool", alignment: "left" },
      { name: "Deployment Cost", alignment: "right" },
      { name: "Pair Creation Cost", alignment: "right" },
      { name: "Lending Pool Approval Cost", alignment: "right" },
      { name: "Loan Initiation Cost", alignment: "right" },
      { name: "Gas Price (Gwei)", alignment: "right" },
    ],
  });

  quoteData.forEach((data) => {
    const row: Record<string, string | number> = {
      Network: network,
      Pool: data.pool,
      "Deployment Cost": usd
        ? formatPrice(data.deploymentCostUsd, true, network)
        : formatPrice(data.deploymentCost, false, network),
      "Pair Creation Cost": usd
        ? formatPrice(data.pairCreationCostUsd, true, network)
        : formatPrice(data.pairCreationCost, false, network),
      "Lending Pool Approval Cost": usd
        ? formatPrice(data.lendingPoolApprovalCostUsd, true, network)
        : formatPrice(data.lendingPoolApprovalCost, false, network),
      "Loan Initiation Cost": usd
        ? formatPrice(data.loanInitiationCostUsd, true, network)
        : formatPrice(data.loanInitiationCost, false, network),
      "Gas Price (Gwei)": gasPrice,
    };

    table.addRow(row);
  });

  table.printTable();
}

function isValidNetwork(network: string): boolean {
  return Object.keys(ammPoolsPerChain).includes(network);
}

function isValidContractType(contractType: string): boolean {
  const supportedContractTypes = ["standard-token", "tax-token", "deflationary-token", "my-custom-contract"];
  return supportedContractTypes.includes(contractType);
}

// Placeholder functions for calculating costs
function calculateDeploymentCost(gasPrice: number, contractType: string): number {
  // Calculate the deployment cost based on the gas price and contract name
  // You'll need to replace this with the actual calculation logic
  return gasPrice * 0.05;
}

function calculatePairCreationCost(gasPrice: number, contractType: string): number {
  // Calculate the pair creation cost based on the gas price and contract name
  // You'll need to replace this with the actual calculation logic
  return gasPrice * 0.002;
}

function calculateLendingPoolApprovalCost(gasPrice: number, contractType: string): number {
  // Calculate the lending pool approval cost based on the gas price and contract name
  // You'll need to replace this with the actual calculation logic
  return gasPrice * 0.001;
}

function calculateLoanInitiationCost(gasPrice: number, contractType: string): number {
  // Calculate the loan initiation cost based on the gas price and contract name
  // You'll need to replace this with the actual calculation logic
  return gasPrice * 0.01;
}

function formatNativePrice(price: number, network: string): string {
  return `${price.toFixed(4)} ${getNativeTokenSymbol(network)}`;
}

function formatUsdPrice(price: number): string {
  return `$${price.toFixed(2)} USD`;
}

function formatPrice(price: number | "N/A" | undefined, isUsd: boolean, network: string): string {
  if (price === "N/A" || price === undefined) {
    return "N/A";
  }
  return isUsd ? formatUsdPrice(price as number) : formatNativePrice(price as number, network);
}


function getNativeTokenSymbol(network: string): string {
  switch (network) {
    case "mainnet":
      return "ETH";
    case "bsc":
      return "BNB";
    case "polygon":
      return "MATIC";
    case "arbitrum":
      return "ETH";
    case "optimism":
      return "ETH";
    case "base":
      return "ETH";
    default:
      return "";
  }
}