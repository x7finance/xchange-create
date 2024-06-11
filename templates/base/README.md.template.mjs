import { withDefaults } from "../utils.js";

const getQuickStart = ({
  solidityFramework,
  networkConfigPath,
  contractsPath,
  scriptsPath,
  testCommand,
}) => `## Quickstart

To get started with Xchange Create, follow the steps below:

1. Install dependencies if it was skipped in CLI:

\`\`\`bash
cd my-dapp-example
# install dependencies and generate a deployer key
pnpm install && pnpm run generate
\`\`\`

${
  Boolean(solidityFramework[0])
    ? `2. Run a local network in the first terminal:

\`\`\`bash
pnpm run chain
\`\`\`

This command starts a local Ethereum network using ${solidityFramework[0]}. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in ${networkConfigPath[0]}.

3. On a second terminal, deploy your contract to a testnet:

\`\`\`bash
pnpm run task deploy:all
\`\`\`

This command deploys a test smart contract to the local network. The contract is located in ${contractsPath[0]} and can be modified to suit your needs. The \`pnpm run deploy\` command uses the deploy script located in ${scriptsPath[0]} to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:`
    : "2. Start your NextJS app:"
}

\`\`\`bash
pnpm run start
\`\`\`

Visit your app on: \`http://localhost:3000\`. You can interact with your smart contract using the \`Debug Contracts\` page. You can tweak the app config in \`packages/nextjs/xchange.config.ts\`.
${
  Boolean(solidityFramework[0])
    ? `
Run smart contract test with ${testCommand[0]}

- Edit your smart contract \`TestContract.sol\` in ${contractsPath[0]}
- Edit your frontend homepage at \`packages/nextjs/app/page.tsx\`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in ${scriptsPath[0]}
`
    : ""
}`;

const contents = ({
  solidityFramework,
  networkConfigPath,
  contractsPath,
  scriptsPath,
  testCommand,
}) =>
  `# Xchange Create

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the EVM compatible blockchains. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with Xchange.

⚙️ Built using NextJS, RainbowKit, ${
    Boolean(solidityFramework[0]) ? solidityFramework[0] + ", " : ""
  }Wagmi, Viem, and Typescript.
${
  Boolean(solidityFramework[0])
    ? "\n- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it."
    : ""
}
- 🪝 **Custom hooks**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 **Components**: Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.


## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)

${getQuickStart({
  solidityFramework,
  networkConfigPath,
  contractsPath,
  scriptsPath,
  testCommand,
})}
## Documentation

Visit our [docs](https://www.x7finance.org/docs) to learn how to start building with Xchange.

To know more about its features, check out our [website](https://www.x7finance.org/docs).`;

export default withDefaults(contents, {
  solidityFramework: "",
  networkConfigPath: "",
  contractsPath: "",
  scriptsPath: "",
  testCommand: "",
});
