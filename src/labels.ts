/**
 * Known contract labels for Base mainnet.
 * Used to make transaction history human-readable.
 */
export const KNOWN_CONTRACTS: Record<string, string> = {
  // Uniswap V3
  "0x2626664c2603336e57b271c5c0b26f421741e481": "Uniswap V3: SwapRouter02",
  "0x33128a8fc17869897dce68ed026d694621f6fdfd": "Uniswap V3: Factory",
  // WETH
  "0x4200000000000000000000000000000000000006": "WETH (Base)",
  // USDC
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC (Base)",
  // DAI
  "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": "DAI (Base)",
  // Coinbase: Base Bridge
  "0x49048044d57e1c92a77f79988d21fa8faf74e97e": "Base: L1 Bridge",
  // AgentScope
  "0x29ff65dba69af3edebc0570a7cd7f1000b66e1ba": "AgentScope",
  "0xcef94f8f4f6f875c016c246edfacde8c0578d580": "ScopeToken",
  "0x377f2788a6a96064df572a1a582717799d4023d6": "DealEngine",
  "0x07bd306226b598834d1d5c14c11575b5d196a885": "TrustAnchor",
  "0x1b1d0cf6eb4816c311109dd3557152827654c7b6": "AgentScopeFactory",
  // Aave V3 on Base
  "0xa238dd80c259a72e81d7e4664a9801593f98d1c5": "Aave V3: Pool",
  // Morpho
  "0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb": "Morpho",
};

export function labelAddress(address: string): string {
  const lower = address.toLowerCase();
  return KNOWN_CONTRACTS[lower] ?? address;
}

/**
 * Classify a transaction based on its properties.
 */
export function classifyTx(tx: {
  input: string;
  value: bigint;
  to: string | null;
}): string {
  if (!tx.to) return "Contract Deploy";

  const label = labelAddress(tx.to);
  const hasValue = tx.value > 0n;
  const hasData = tx.input && tx.input !== "0x";

  if (!hasData && hasValue) return "ETH Transfer";
  if (!hasData && !hasValue) return "ETH Transfer (0)";

  const selector = tx.input.slice(0, 10).toLowerCase();

  const SELECTORS: Record<string, string> = {
    "0xa9059cbb": "ERC-20 Transfer",
    "0x095ea7b3": "ERC-20 Approve",
    "0x23b872dd": "ERC-20 TransferFrom",
    "0x04e45aaf": "Uniswap V3: Swap",
    "0x5ae401dc": "Uniswap V3: Multicall",
    "0x12aa3caf": "1inch Swap",
    "0xe8e33700": "Uniswap V2: Add Liquidity",
    "0xbaa2abde": "Uniswap V2: Remove Liquidity",
    "0x617ba037": "Aave: Supply",
    "0x69328dec": "Aave: Withdraw",
    "0x40c10f19": "ERC-20 Mint",
    "0x42842e0e": "ERC-721 Transfer",
    "0x2eb2c2d6": "ERC-1155 Batch Transfer",
  };

  const known = SELECTORS[selector];
  if (known) return known;

  if (label !== tx.to) return `Call: ${label}`;

  return `Contract Call (${selector})`;
}
