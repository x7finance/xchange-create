import { contracts } from "~~/utils/xchange/contract"
import xchangeConfig from "~~/xchange.config"

export function getAllContracts() {
  const contractsData = contracts?.[xchangeConfig.targetNetworks[0].id]
  return contractsData ? contractsData : {}
}
