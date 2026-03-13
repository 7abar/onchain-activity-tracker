import { describe, it, expect } from "vitest";
import { classifyTx, labelAddress } from "./labels.js";
import { formatTx, formatHeader } from "./format.js";
import type { TrackedTx } from "./fetcher.js";

describe("labelAddress", () => {
  it("labels known contracts", () => {
    expect(labelAddress("0x2626664c2603336E57B271c5C0b26F421741e481")).toBe(
      "Uniswap V3: SwapRouter02"
    );
    expect(labelAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")).toBe(
      "USDC (Base)"
    );
  });

  it("returns address unchanged for unknowns", () => {
    const unknown = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
    expect(labelAddress(unknown)).toBe(unknown);
  });
});

describe("classifyTx", () => {
  it("classifies plain ETH transfer", () => {
    expect(classifyTx({ input: "0x", value: 100n, to: "0xabc" })).toBe(
      "ETH Transfer"
    );
  });

  it("classifies contract deploy", () => {
    expect(classifyTx({ input: "0x60806040", value: 0n, to: null })).toBe(
      "Contract Deploy"
    );
  });

  it("classifies ERC-20 transfer by selector", () => {
    const input = "0xa9059cbb" + "0".repeat(56);
    expect(classifyTx({ input, value: 0n, to: "0xtoken" })).toBe(
      "ERC-20 Transfer"
    );
  });

  it("classifies Uniswap V3 swap", () => {
    const input = "0x04e45aaf" + "0".repeat(200);
    expect(classifyTx({ input, value: 100n, to: "0xrouter" })).toBe(
      "Uniswap V3: Swap"
    );
  });

  it("labels known contract calls", () => {
    const result = classifyTx({
      input: "0xdeadbeef",
      value: 0n,
      to: "0x29Ff65DBA69Af3edEBC0570a7cd7f1000B66e1BA",
    });
    expect(result).toContain("AgentScope");
  });
});

describe("formatTx", () => {
  const mockTx: TrackedTx = {
    hash: "0xabc123def456abc123def456abc123def456abc123def456abc123def456abcd",
    blockNumber: 12345678,
    timestamp: Math.floor(Date.now() / 1000) - 300,
    from: "0x2012F75004C6e889405D078780AB41AE8606b85b",
    to: "0x2626664c2603336E57B271c5C0b26F421741e481",
    value: "0.001",
    type: "Uniswap V3: Swap",
    label: "Uniswap V3: SwapRouter02",
    direction: "out",
    status: "success",
  };

  it("includes the tx hash", () => {
    const output = formatTx(mockTx, 0);
    expect(output).toContain("0xabc1");
  });

  it("includes the tx type", () => {
    const output = formatTx(mockTx, 0);
    expect(output).toContain("Uniswap");
  });
});

describe("formatHeader", () => {
  it("includes address and balance", () => {
    const header = formatHeader(
      "0x2012F75004C6e889405D078780AB41AE8606b85b",
      "0.004173"
    );
    expect(header).toContain("0x2012F75004C6e889405D078780AB41AE8606b85b");
    expect(header).toContain("0.004173");
  });
});
