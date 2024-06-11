<p style="padding-top: 30px;" align="center">
  <img src="https://assets.x7finance.org/images/svgs/x7.svg" alt="X7 Banner Logo" />
</p>

<br />
<div align="center"><strong>X7 Finance</strong></div>
<div align="center">Trust No One. Trust Code. Long Live DeFi</div>
<div align="center">X7 is a completely decentralized exchange - complete with it's innovative lending protocols.</div>
<br />
<div align="center">
<a href="https://www.x7finance.org">Website</a>
<span> · </span>
<a href="https://t.me/X7m105portal">Telegram</a>
<span> · </span>
<a href="https://x.com/X7_Finance">Twitter X</a>
</div>

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Xchange Create, follow the steps below:

1. Install from NPM Registry and follow the CLI instructions.

```
npx xchange-create@latest
```

> 💬 Hint: If you choose Foundry as solidity framework in the CLI, you'll also need Foundryup installed in your machine. Checkout: [getfoundry.sh](https://getfoundry.sh)

2. Run a local network in the first terminal:

```
pnpm run chain
```

This command starts a local Ethereum network using Hardhat or Foundry, depending on which one you selected in the CLI. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in:

- `packages/hardhat/hardhat.config.ts` if you have Hardhat as solidity framework.
- `packages/foundry/foundry.toml` if you have Foundry as solidity framework.

3. On a second terminal, deploy the test contract:

```
pnpm run deploy
```

This command deploys a test smart contract to the local network. The contract can be modified to suit your needs. Is located in:

- Hardhat => `packages/hardhat/contracts`
- Foundry => `packages/foundry/contracts`

The `pnpm run deploy` command uses a deploy script to deploy the contract to the network. You can customize it. Is located in:

- Hardhat => `packages/hardhat/deploy`
- Foundry => `packages/foundry/script`

4. On a third terminal, start your NextJS app:

```
pnpm run start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/xchange.config.ts`.

Run smart contract test with `pnpm run hardhat:test` or `pnpm run foundry:test` depending of your solidity framework.

**What's next**:

- Edit your smart contract `TestContract.sol` in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`
- Edit your smart contract test in: `packages/hardhat/test`. To run test use `pnpm run hardhat:test`

```bash
# fastest way to deploy a loan locally
pnpm install && pnpm run generate

# separate shell
pnpm run chain

# deploy all
pnpm run task deploy:all
```



```bash
# setup
pnpm install && pnpm run generate

# nextjs
pnpm run next:format && pnpm run next:check-types && pnpm run next:lint && pnpm run next:build

# local
pnpm run chain # needs separate shell
pnpm run account

# individual deployment commands

# with all the parameters

# deploy contract
TOKEN_NAME="MyToken" TOKEN_SYMBOL="MTK" TOKEN_SUPPLY="2000000" CONTRACT_NAME=StandardToken pnpm run task deploy:contract

# create a pair on Xchange, with chain native denomination
CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" pnpm run task create:pair

# approve the lending pool
CONTRACT_NAME=StandardToken CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" pnpm run task approve:lendingpool

# take a loan via the X7 Lending Pool
CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" \
AMOUNT="1000" \
LOAN_TERM_CONTRACT_ADDRESS="0x1234567890123456789012345678901234567890" \
LOAN_AMOUNT="500" \
LOAN_DURATION="2592000" \
LIQUIDITY_RECEIVER_ADDRESS="0x0987654321098765432109876543210987654321" \
DEADLINE="1234567890" \
PAYABLE_AMOUNT="0.1" \
pnpm run task initiate:loan
```
