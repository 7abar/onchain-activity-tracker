#!/usr/bin/env node
/**
 * onchain-activity-tracker
 * Track and label wallet activity on Base / EVM chains.
 *
 * Usage:
 *   node src/cli.js <address> [--limit 25] [--rpc <url>] [--api-key <key>]
 */
import { fetchActivity, getEthBalance } from "./fetcher.js";
import {
  formatHeader,
  formatTx,
  formatFooter,
  formatSummary,
} from "./format.js";

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const address = args.find((a) => a.startsWith("0x") && a.length === 42);
const limit = parseInt(getArg("--limit") ?? "25");
const rpcUrl = getArg("--rpc");
const apiKey = getArg("--api-key");

if (!address) {
  console.error(
    "\nUsage: node src/cli.js <0x_address> [--limit 25] [--rpc <url>] [--api-key <key>]\n"
  );
  console.error("Example:");
  console.error(
    "  node src/cli.js 0x2012F75004C6e889405D078780AB41AE8606b85b --limit 10\n"
  );
  process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nFetching activity...\n");

  const [txs, balance] = await Promise.all([
    fetchActivity({ address, limit, rpcUrl, basescanApiKey: apiKey }),
    getEthBalance(address, rpcUrl),
  ]);

  if (txs.length === 0) {
    console.log("No transactions found for this address.");
    return;
  }

  console.log(formatHeader(address, parseFloat(balance).toFixed(6)));
  console.log();

  txs.forEach((tx, i) => {
    console.log(formatTx(tx, i));
  });

  console.log(formatFooter(txs.length));
  console.log(formatSummary(txs));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
