import type { TrackedTx } from "./fetcher.js";

// ANSI color codes (no dependencies)
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

function col(text: string, ...colors: string[]): string {
  return colors.join("") + text + C.reset;
}

function shortHash(hash: string): string {
  return hash.slice(0, 6) + "…" + hash.slice(-4);
}

function shortAddr(addr: string): string {
  if (!addr) return "—";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function directionIcon(dir: TrackedTx["direction"]): string {
  if (dir === "in") return col("▼ IN ", C.green, C.bold);
  if (dir === "out") return col("▲ OUT", C.red, C.bold);
  return col("⊕ NEW", C.cyan, C.bold);
}

function statusDot(status: TrackedTx["status"]): string {
  return status === "success" ? col("●", C.green) : col("●", C.red);
}

export function formatHeader(address: string, balance: string): string {
  const line = "─".repeat(70);
  return [
    col(line, C.gray),
    col("  ONCHAIN ACTIVITY TRACKER", C.bold, C.cyan) +
      col("  Base Mainnet", C.gray),
    col("  Address: ", C.gray) +
      col(address, C.white, C.bold) +
      col("  Balance: ", C.gray) +
      col(balance + " ETH", C.yellow, C.bold),
    col(line, C.gray),
  ].join("\n");
}

export function formatTx(tx: TrackedTx, index: number): string {
  const num = col(String(index + 1).padStart(3), C.gray);
  const dir = directionIcon(tx.direction);
  const dot = statusDot(tx.status);
  const hash = col(shortHash(tx.hash), C.blue);
  const time = col(timeAgo(tx.timestamp), C.gray);
  const type = col(tx.type.padEnd(28), C.yellow);
  const value =
    tx.value !== "0.0" && tx.value !== "0."
      ? col(parseFloat(tx.value).toFixed(6) + " ETH", C.green)
      : col("—", C.gray);

  const to =
    tx.label !== tx.to
      ? col(tx.label, C.magenta)
      : col(shortAddr(tx.to ?? ""), C.dim);

  return `${num} ${dot} ${dir}  ${hash}  ${type}  → ${to}  ${value}  ${time}`;
}

export function formatFooter(count: number): string {
  return [
    col("─".repeat(70), C.gray),
    col(`  ${count} transactions shown  ·  `, C.gray) +
      col("basescan.org", C.blue) +
      col(" for full history", C.gray),
    col("─".repeat(70), C.gray),
  ].join("\n");
}

export function formatSummary(txs: TrackedTx[]): string {
  const inCount = txs.filter((t) => t.direction === "in").length;
  const outCount = txs.filter((t) => t.direction === "out").length;
  const failed = txs.filter((t) => t.status === "reverted").length;
  const types = [...new Set(txs.map((t) => t.type))];

  return [
    "",
    col("  Summary:", C.bold),
    col(`    Incoming: ${inCount}  Outgoing: ${outCount}  Failed: ${failed}`, C.gray),
    col(`    Types: `, C.gray) + col(types.slice(0, 5).join(", "), C.yellow),
    "",
  ].join("\n");
}
