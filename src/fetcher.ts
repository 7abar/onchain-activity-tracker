import { createPublicClient, http, formatEther } from "viem";
import { base } from "viem/chains";
import { classifyTx, labelAddress } from "./labels.js";

export interface TrackedTx {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string | null;
  value: string;
  type: string;
  label: string;
  direction: "in" | "out" | "deploy";
  status: "success" | "reverted";
}

export interface TrackerOptions {
  address: string;
  rpcUrl?: string;
  basescanApiKey?: string;
  limit?: number;
}

/**
 * Fetch and label recent transactions for a wallet address.
 * Uses BaseScan API for tx history (viem alone can't list all txs for an address).
 */
export async function fetchActivity(
  options: TrackerOptions
): Promise<TrackedTx[]> {
  const { address, basescanApiKey, limit = 25 } = options;
  const apiKey = basescanApiKey ?? "J3GQEYNW94YDJ7RM616Y2MSU9WC5SEUS63";
  const addr = address.toLowerCase();

  const url =
    `https://api.basescan.org/api?module=account&action=txlist` +
    `&address=${addr}&startblock=0&endblock=99999999` +
    `&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`;

  const response = await fetch(url);
  const data = (await response.json()) as {
    status: string;
    result: Array<{
      hash: string;
      blockNumber: string;
      timeStamp: string;
      from: string;
      to: string;
      value: string;
      input: string;
      isError: string;
    }>;
  };

  if (data.status !== "1" || !Array.isArray(data.result)) return [];

  return data.result.slice(0, limit).map((tx) => {
    const value = BigInt(tx.value ?? "0");
    const type = classifyTx({ input: tx.input, value, to: tx.to || null });
    const direction =
      !tx.to ? "deploy"
      : tx.from.toLowerCase() === addr ? "out"
      : "in";

    return {
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp),
      from: tx.from,
      to: tx.to,
      value: formatEther(value),
      type,
      label: tx.to ? labelAddress(tx.to) : "Contract Deploy",
      direction,
      status: tx.isError === "0" ? "success" : "reverted",
    };
  });
}

/**
 * Get current ETH balance via RPC.
 */
export async function getEthBalance(
  address: string,
  rpcUrl?: string
): Promise<string> {
  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl ?? "https://mainnet.base.org"),
  });
  const bal = await client.getBalance({ address: address as `0x${string}` });
  return formatEther(bal);
}
