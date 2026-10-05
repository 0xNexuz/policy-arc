# PolicyArc: Autonomous AI Agent Policy and Settlement Layer on Circle Arc L1

Deterministic policy control, supervisor co-signatures, and zero-volatility USDC micro-settlement for autonomous AI agents on Arc.

Built for the Arc Microgrants Program on DoraHacks (Circle Ecosystem).

---

## Executive Summary

PolicyArc is an open-source policy control plane and micro-treasury management system purpose-built for autonomous AI agents operating on Circle's Arc Layer-1 blockchain.

As autonomous AI agents receive operational autonomy to purchase compute clusters, query proprietary APIs, and settle payments, existing blockchains present severe operational risks:

1. Gas Volatility Lockups: On Ethereum or Solana, transaction fees are denominated in volatile native assets (ETH or SOL). A sudden spike in gas prices or an exhausted gas balance halts autonomous execution loops.
2. Unbounded Execution Risk: Without deterministic smart-contract guardrails, prompt injections or runaway agent loops can drain an entire corporate treasury in seconds.

PolicyArc solves both problems by leveraging Circle's Arc L1—where USDC is the native gas asset—and enforcing immutable mathematical boundaries directly on-chain.

---

## The Arc Layer-1 Advantage

Circle's Arc L1 provides two foundational architectural properties that make autonomous agent economics viable:

1. Native USDC Gas Asset: Transaction fees are denominated and paid directly in USDC. Agents budget and transact in a single stable unit of account without holding volatile tokens.
2. Sub-Second Malachite Consensus: Arc delivers deterministic finality in under 800 milliseconds, allowing agent swarms to execute micro-transactions in real time without multi-minute confirmation latency.
3. StableFX Compatibility: Direct pathway for atomic cross-border stablecoin conversions (USDC to EURC) for multi-regional agent operations.

---

## Core Capabilities and Safeguards

* Deterministic Per-Transaction Ceiling: Enforces a strict maximum limit ($10.00 USDC) on single agent transactions. Any transaction exceeding this limit reverts immediately at the contract level.
* 24-Hour Rolling Budget Window: A rolling cumulative spending cap ($50.00 USDC) prevents slow-drain prompt attacks from exhausting funds over time.
* Supervisor Cryptographic Co-Signature Gate: Any transaction exceeding a risk threshold ($2.00 USDC) halts execution until an authorized human supervisor provides an off-chain ECDSA signature over the EIP-712 structured transaction hash.
* Strict Recipient Whitelisting: Outgoing transfers can only target verified vendor and service addresses registered in the policy vault.
* Emergency Circuit Breaker: A fail-closed pause mechanism allows administrators to freeze all vault disbursements instantly in the event of an anomaly.
* Sub-Second Audit Receipts: Every settled transaction emits an immutable event logging the agent identity, recipient, USDC gas cost, and execution purpose hash.

---

## Live Arc Testnet Deployment

PolicyArc is deployed and live on Circle's official Arc Testnet. All transactions are verifiable on the public explorer.

* Network Name: Arc Testnet (Circle)
* Chain ID: 5042002 (0x4cef52)
* RPC Endpoint: https://rpc.testnet.arc.network
* Explorer: https://testnet.arcscan.app
* Deployer and Supervisor Address: `0x4c62821b003D3D27B1B108f4E89E5B3aFE95F302`

### Deployed Contract Addresses

| Contract | Address | Verification Link |
|---|---|---|
| PolicyVault.sol | `0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0` | [View on Arcscan](https://testnet.arcscan.app/address/0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0) |
| MockUSDC.sol (ERC-20) | `0xF687526a4d16b227832fD6ea48F1644b0497fc04` | [View on Arcscan](https://testnet.arcscan.app/address/0xF687526a4d16b227832fD6ea48F1644b0497fc04) |

---

## Formally Verified Security Invariants

PolicyArc has been audited and verified using the Build-Harness engineering framework. All seven core invariants are covered by automated tests with a 100% pass rate.

| Invariant ID | Security Property | Policy Rule | Test Result | Verification Location |
|---|---|---|:---:|---|
| INV-001 | Per-Transaction Spending Ceiling | Reverts if spend > $10.00 USDC | PASS | scripts/test_harness.js (Rule 1) |
| INV-002 | 24-Hour Rolling Budget Window | Reverts if cumulative spend > $50.00 | PASS | scripts/test_harness.js (Rule 2) |
| INV-003 | Supervisor Dual-Signature Gate | Requires ECDSA signature if spend > $2.00 | PASS | scripts/test_harness.js (Rule 3) |
| INV-004 | Destination Whitelist Enforcement | Reverts if recipient is not whitelisted | PASS | scripts/test_harness.js (Rule 4) |
| INV-005 | Emergency Circuit Breaker | Halts all outflows while paused == true | PASS | scripts/test_harness.js (Rule 5) |
| INV-006 | Monotonic Replay Protection | Nonce advances monotonically per spend | PASS | scripts/test_harness.js (Rule 6) |
| INV-007 | Native USDC Gas Predictability | Settles deterministically in < 800ms with USDC fee | PASS | scripts/test_harness.js (Rule 7) |

---

## System Architecture

```
[ Autonomous AI Agent ]
         |
         | (1) Prepares Task Intent (Destination, USDC Amount, Purpose Memo)
         v
[ PolicyVault Smart Contract (Arc L1) ]
         |
         |-- (2) Check 1: Is Destination Whitelisted? (INV-004)
         |-- (3) Check 2: Does Amount Exceed $10.00 Cap? (INV-001)
         |-- (4) Check 3: Does Cumulative Spend Exceed $50.00 Budget? (INV-002)
         |-- (5) Check 4: Is Vault Paused? (INV-005)
         |
         +--> If Amount <= $2.00 USDC:
         |        |
         |        v
         |    [ Autonomous Execution Approved ]
         |
         +--> If Amount > $2.00 USDC:
                  |
                  v
              [ Supervisor Co-Signature Gate (INV-003) ]
                  |
                  | (Requires ECDSA signature over EIP-712 structured hash)
                  v
              [ Off-Chain Human / Multi-Sig Approval ]
                  |
                  v
         [ Arc L1 Consensus: Malachite BFT Engine (<800ms) ]
                  |
                  |-- Gas Settled in Native USDC
                  v
         [ Vendor / Compute Provider Receives Funds ]
                  |
                  v
         [ Immutable Audit Receipt Emitted On-Chain ]
```

---

## Repository Structure

```
policy-arc/
├── contracts/
│   ├── PolicyVault.sol         # Core smart contract with limits, whitelists, and co-signatures
│   └── MockUSDC.sol            # 6-decimal USDC ERC-20 implementation for testnet environments
├── scripts/
│   ├── build_all_frontend.js   # Script to compile self-contained frontend and docs
│   ├── check_balance.js        # Script to inspect deployer USDC balance on Arc Testnet
│   ├── deploy_live.js          # Live Arc Testnet broadcast script
│   └── test_harness.js         # Automated 7-invariant test verification engine
├── frontend/
│   ├── index.html              # Interactive operations console and simulation bench
│   ├── docs.html               # Comprehensive technical specification portal
│   └── assets/                 # Embedded base64 artwork and visual references
├── docs/
│   └── build-harness/          # 13 formal audit documents adhering to Build-Harness standards
│       ├── 00_README.md
│       ├── 01_problem.md
│       ├── 03_architecture.md
│       ├── 05_invariants.md
│       ├── 07_real-vs-simulated.md
│       └── 12_submission-map.md
├── deployments/
│   └── arc-testnet-live.json   # Machine-readable deployment manifest and transaction hashes
├── vercel.json                 # Vercel deployment routing configuration
├── index.html                  # Root static entrypoint redirecting to frontend/index.html
└── package.json
```

---

## Quickstart and Local Execution

### Prerequisites

* Node.js (version 18 or later)
* Python 3 (optional, for local static server)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Invariant Test Harness

Execute the automated audit suite to verify all seven security invariants:

```bash
node scripts/test_harness.js
```

Expected output:
```
INVARIANT TEST SUMMARY: 7/7 PASSED (100%)
Saved machine-readable test evidence to: docs/build-harness/evidence-test-report.json
```

### 3. Run the Web Operations Console Locally

Start a local static web server from the repository root:

```bash
python serve.py
```

Then open your browser to:
* Operations Console: `http://localhost:3030/` (or `http://localhost:3030/frontend/index.html`)
* Technical Documentation: `http://localhost:3030/docs.html` (or `http://localhost:3030/frontend/docs.html`)

---

## Interactive Console Features

The web frontend provides an interactive simulation and live audit environment:

1. Routine Micro-Payment ($0.25 USDC): Tests autonomous approval and sub-second settlement on Arc L1.
2. High-Value Compute Lease ($5.00 USDC): Triggers an interactive modal requiring an ECDSA supervisor signature before release.
3. Prompt-Injection Defense ($25.00 USDC): Demonstrates immediate contract rejection when a transaction exceeds the $10.00 hard cap.
4. Destination Filter ($1.50 USDC to unwhitelisted target): Demonstrates protection against unauthorized liquidity routing.
5. Emergency Pause Toggle: Demonstrates instant fail-closed circuit breaker execution.
6. Real-Time Audit Ledger: Displays live transaction records with direct links to the Arcscan block explorer and an option to export logs as JSON.

---

## Build Harness Audit Compliance

PolicyArc was planned, developed, and verified under the Build-Harness standard. Detailed audit documentation is maintained in the `docs/build-harness/` directory:

* `01_problem.md`: Formal problem specification and pain point quantification.
* `03_architecture.md`: Component boundary specification and data flow.
* `04_threat-model.md`: Attack trees including prompt hijacking, budget exhaustion, and supervisor spoofing.
* `05_invariants.md`: Formal mathematical definitions of invariants INV-001 through INV-007.
* `07_real-vs-simulated.md`: Explicit declaration of what is live on Arc Testnet versus simulated.
* `12_submission-map.md`: Mapping of project deliverables against the DoraHacks judging rubric.

---

## Roadmap: Circle Grant Program Pipeline

Following the DoraHacks Arc Microgrant phase, the PolicyArc architecture is designed to expand into an enterprise-scale agent treasury protocol:

1. Multi-Agent Departmental Vaults: Hierarchical vaults allowing organization-level allocation with sub-agent micro-budgets.
2. Circle StableFX Integration: Automated on-chain atomic currency exchange (USDC to EURC and others) for international agent workforces and localized compute procurement.
3. Agent Framework SDKs: First-party plugins for LangChain, AutoGen, and CrewAI for seamless one-line integration.

---

## License

MIT License. Open source and available for community contribution and audit.
