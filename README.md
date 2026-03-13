# onchain-activity-tracker

CLI tool to track, label, and summarize onchain wallet activity on Base / EVM chains.

No wallet connection needed — just paste any address. Transactions are labeled with human-readable names (Uniswap Swap, USDC Transfer, AgentScope call, etc.) instead of raw function selectors and contract addresses.

## Demo

```
$ node src/cli.js 0x2012F75004C6e889405D078780AB41AE8606b85b --limit 10

─────────────────────────────────────────────────────────────────────
  ONCHAIN ACTIVITY TRACKER  Base Mainnet
  Address: 0x2012F75004C6e889405D078780AB41AE8606b85b  Balance: 0.004173 ETH
─────────────────────────────────────────────────────────────────────

  1 ● ▲ OUT  0x014d…032c  Uniswap V3: Swap             → Uniswap V3: SwapRouter02  0.000200 ETH  5m ago
  2 ● ▲ OUT  0x2603…1a43  ETH Transfer                 → AgentScope               0.001000 ETH  6m ago
  3 ● ▲ OUT  0x039e…e795  Call: ScopeToken              → ScopeToken               —             6m ago
  4 ● ▲ OUT  0xdaef…18dd  Uniswap V3: Swap             → Uniswap V3: SwapRouter02  0.000100 ETH  8m ago
  5 ● ▲ OUT  0x8546…e006  Call: ScopeToken              → ScopeToken               —             12m ago
─────────────────────────────────────────────────────────────────────
  5 transactions shown  ·  basescan.org for full history
─────────────────────────────────────────────────────────────────────

  Summary:
    Incoming: 0  Outgoing: 5  Failed: 0
    Types: Uniswap V3: Swap, ETH Transfer, Call: ScopeToken
```

## Usage

```bash
# Clone and install
git clone https://github.com/7abar/onchain-activity-tracker
cd onchain-activity-tracker
npm install

# Track any address
node src/cli.js 0xYourAddress

# Options
node src/cli.js 0xYourAddress --limit 50
node src/cli.js 0xYourAddress --limit 10 --api-key YOUR_BASESCAN_KEY
node src/cli.js 0xYourAddress --rpc https://mainnet.base.org
```

## Options

| Flag | Default | Description |
|---|---|---|
| `--limit` | 25 | Number of transactions to show |
| `--rpc` | Base mainnet | Custom RPC URL |
| `--api-key` | Built-in | BaseScan API key |

## Features

- **Human-readable labels** — "Uniswap V3: Swap" instead of `0x04e45aaf`
- **Known contract directory** — Uniswap, WETH, USDC, DAI, Aave, Morpho, AgentScope
- **Direction detection** — IN / OUT / Contract Deploy
- **Status** — success vs reverted at a glance
- **Transaction summary** — type breakdown, counts
- **Zero config** — works out of the box with a Base RPC

## Labeled Contracts (Base Mainnet)

- Uniswap V3: SwapRouter02
- WETH, USDC, DAI
- Aave V3: Pool
- Morpho
- Base L1 Bridge
- AgentScope, ScopeToken, DealEngine, TrustAnchor

## Adding Labels

Edit `src/labels.ts` to add your own contract names:

```typescript
export const KNOWN_CONTRACTS: Record<string, string> = {
  "0xYourContract": "My Protocol: ContractName",
  // ...
};
```

## Tests

```bash
npm test
```

## Built With

- [viem](https://viem.sh) — EVM interaction
- [BaseScan API](https://basescan.org/apis) — Transaction history
- Zero UI dependencies — pure Node.js + ANSI colors

## License

MIT
