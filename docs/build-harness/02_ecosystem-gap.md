# 02. Ecosystem Gap

## Current Ecosystem Landscape

Existing blockchain payment systems were engineered for human users holding Web3 wallets, not autonomous AI software:

1. **ERC-4337 Account Abstraction:**
   * Uses Paymasters to sponsor gas, but requires off-chain bundler infrastructure, introduces gas overhead, and still converts volatile token prices under the hood.
2. **Traditional Multi-Sig Wallets (Safe):**
   * Designed for human signers. Lacks micro-transaction support, real-time agent execution loop latency, and automated threshold co-signing mechanisms.
3. **General-Purpose DeFi Chains:**
   * Require juggling DEX liquidity and cross-currency bridges just to settle a $0.25 API query.

## Why PolicyArc Exists

PolicyArc fills the critical gap between **autonomous AI decision loops** and **institutional stablecoin settlement**:

```
┌─────────────────────────────────┐
│     Autonomous AI Agent         │
│  (Reasoning, API Tools, Tasks)  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│           PolicyArc             │  <--- THE MISSING OPERATING SYSTEM LAYER
│  - Deterministic Spending Caps  │       - Zero Volatile Gas Friction
│  - Human-in-the-Loop Thresholds │       - Real-time Sub-Second Receipts
│  - Recipient Whitelists         │       - Fail-Closed Treasury Protection
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Arc Blockchain (L1)       │
│  - Native USDC Gas Asset        │
│  - Malachite BFT Engine (&lt;1s)   │
│  - Circle StableFX              │
└─────────────────────────────────┘
```

PolicyArc delivers the first purpose-built economic safety layer designed explicitly to harness Arc's native USDC gas superpower.
