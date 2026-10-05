# 03. Architecture

## System Components

The PolicyArc architecture consists of four tightly coupled layers:

1. **Smart Contract Layer (`contracts/`):**
   * `PolicyVault.sol`: The core EVM contract deployed on Arc. Holds USDC treasury, tracks `spentToday` in rolling 24-hour windows, enforces `perTxLimit`, `dailyLimit`, and `approvalThreshold`, and validates supervisor ECDSA signatures.
   * `MockUSDC.sol`: 6-decimal standard ERC-20 token simulating Circle USDC on Arc, equipped with a developer testnet faucet.
2. **Client SDK Layer (`sdk/`):**
   * `PolicyArcClient.js`: Lightweight JavaScript/TypeScript module for autonomous agents. Performs pre-flight local rule evaluation before submitting on-chain transactions, serializes task payloads into SHA-256 hashes, and extracts parsed receipts.
3. **Execution Runtime (`scripts/`):**
   * `standalone_sim.js`: Deterministic execution runtime modeling Arc's Malachite consensus and USDC gas mechanics with zero external dependencies.
   * `test_harness.js`: Automated invariant verification runner checking all 7 invariants.
   * `deploy_live.js`: Direct broadcaster for live Arc Testnet.
4. **Interface & Observability (`frontend/`):**
   * `index.html`: Interactive operator console rendered in brutalist monochrome archival style with electric matrix phosphor green telemetry.
   * `docs.html`: Complete technical specification and API documentation.

## Core Data Flow

```
Agent Action Request
   │
   ▼
[PolicyArcClient.evaluateSpendPolicy]  <-- Local Pre-flight Check
   │
   ├── (Violates Whitelist or Hard Limit?) ──> FAIL-CLOSED REJECTION (0 Gas Spent)
   │
   ├── (Amount > $2.00 Threshold?) ─────────> Triggers Supervisor Co-Signature Drawer
   │                                             │
   │                                             ▼
   │                                          Supervisor Signs ECDSA Digest
   │                                             │
   ▼                                             ▼
[PolicyVault.executeSpend] on Arc L1 ───────────┘
   │
   ├── Verify Nonce, Limits, and Signature
   ├── Transfer USDC to Service Recipient
   ├── Deduct Gas Fee in Native USDC (~0.000120 USDC)
   │
   ▼
Emit PolicySpendExecuted Event
   │
   ▼
Generate Verifiable Execution Receipt (SHA-256 Hash + Explorer Proof)
```
