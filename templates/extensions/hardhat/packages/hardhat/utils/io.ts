/* eslint-disable no-console */
import fs from "fs";
import path from "path";

export const getNetwork = () => process.env.DEPLOY_NETWORK || "hardhat";

export const writeABI = (contractPath, contractFileName) => {
  try {
    console.log("Writing ABI for", contractFileName);
    const rawData = fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts", contractPath),
    );

    const info = JSON.parse(rawData.toString());

    fs.writeFileSync(
      path.join(__dirname, "../abis", `${contractFileName}.json`),
      JSON.stringify(info.abi, null, 2),
    );
  } catch (error) {
    console.error("Writing ABI error: ", error);
  }
};

export const writeContract = (contractFileName, address, deployer, args) => {
  const NETWORK = getNetwork();

  fs.writeFileSync(
    path.join(
      __dirname,
      `../publish/addresses/${NETWORK}/${contractFileName}.json`,
    ),
    JSON.stringify(
      {
        address,
        deployer,
        args,
      },
      null,
      2,
    ),
  );
};

export const readContract = contractFileName => {
  const NETWORK = getNetwork();

  try {
    const rawData = fs.readFileSync(
      path.join(
        __dirname,
        `../publish/addresses/${NETWORK}/${contractFileName}.json`,
      ),
    );
    const info = JSON.parse(rawData.toString());
    return {
      address: info.address,
      args: info.args,
    };
  } catch (error) {
    return {
      address: null,
      args: [],
    };
  }
};
