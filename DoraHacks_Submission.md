# PolicyArc: DoraHacks Arc Microgrants Submission Kit

## 1. Project Overview & Meta
* **Project Name:** PolicyArc
* **Tagline:** Deterministic policy control and zero-volatility USDC settlement for autonomous AI agents on Arc.
* **Target Track:** Arc Microgrants ($500 USDC Grant + Circle Grant Program Pipeline)
* **Categories:** AI Agents, Stablecoin Infrastructure, Developer Tooling, Payments & Settlement
* **GitHub Repository:** `https://github.com/your-org/policy-arc`
* **Live Demo URL:** `http://localhost:3000` (or deployed dashboard URL)
* **Contract Deployments (Arc Testnet — Chain ID: 5042002):**
  * `PolicyVault.sol`: [`0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0`](https://testnet.arcscan.app/address/0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0)
  * `MockUSDC.sol`: [`0xF687526a4d16b227832fD6ea48F1644b0497fc04`](https://testnet.arcscan.app/address/0xF687526a4d16b227832fD6ea48F1644b0497fc04)
  * Deployment Transaction: [`0x149ee252d57568e75253c100e19eef80264a572f7288153dc590d96202a8e52f`](https://testnet.arcscan.app/tx/0x149ee252d57568e75253c100e19eef80264a572f7288153dc590d96202a8e52f)

---

## 2. Official DoraHacks 2–3 Paragraph Summary

### Paragraph 1: The Problem & Opportunity
Autonomous AI agents are transitioning from conversational interfaces into economic actors capable of purchasing compute, leasing models, querying proprietary APIs, and coordinating multi-agent workflows. However, deploying agents on traditional blockchains introduces critical friction: fluctuating gas prices require agents to constantly balance and hedge volatile gas tokens (such as ETH or SOL). A sudden spike in gas fees or an exhausted gas balance halts autonomous pipelines. Furthermore, without deterministic smart-contract guardrails, prompt injections or runaway loops can easily drain an agent's entire treasury in minutes.

### Paragraph 2: What PolicyArc Does & Why Arc is Load-Bearing
PolicyArc is an enterprise-grade policy control plane and micro-settlement rail purpose-built for autonomous AI agents on Arc. By leveraging Arc’s revolutionary architecture—where **USDC serves as the native gas asset** alongside sub-second deterministic finality—PolicyArc enables AI agents to budget, spend, and receive micro-payments denominated strictly in US dollars. Our smart contract (`PolicyVault.sol`) and TypeScript client enforce hard daily spending caps, per-transaction limits, and recipient whitelisting. If an autonomous agent attempts a transaction exceeding human-defined risk thresholds, PolicyArc pauses execution and requires an off-chain cryptographic supervisor co-signature before funds move.

### Paragraph 3: Impact & The Path Forward to Circle Grants
PolicyArc transforms stablecoins from static reserves into programmable, safe operating currency for the AI economy. With every transaction generating an on-chain, verifiable execution receipt with gas fees accounted in fractions of a cent of USDC, enterprises can deploy autonomous agents with total fiscal certainty. Our roadmap includes integrating Circle’s native **StableFX** engine for seamless cross-border multi-currency agent payroll (e.g. auto-converting to EURC for European compute clusters) and expanding from single-agent vaults to multi-agent departmental budgets, directly preparing PolicyArc for scale under the Circle Grant Program.

---

## 3. Key Arc Features Leveraged
1. **USDC as Native Gas Asset:** Eliminates the "two-token hurdle." Autonomous agents never need to hold volatile crypto just to pay execution fees.
2. **Sub-Second Deterministic Finality (Malachite Engine):** Agents operate in real-time execution loops without stalling for multi-block confirmations.
3. **EVM Compatibility:** Seamless integration with standard tooling (Solidity, Foundry, Hardhat) and smart contract security standards.
4. **StableFX Readiness:** Atomic multi-stablecoin settlement for international agent-to-agent transactions.

---

## 4. Pitch Deck Outline (5 Slides)

* **Slide 1: Title & The Vision:** PolicyArc — The Economic Safety Layer for Autonomous Agents on Arc.
* **Slide 2: The Agent Gas & Budget Crisis:** Why AI agents fail on volatile gas chains; the risk of unbounded autonomous wallets.
* **Slide 3: The Architecture:** Deterministic PolicyVault + Human Supervisor Co-Signatures + Arc USDC Native Gas.
* **Slide 4: Live Demo Proof:** Walkthrough of $0.25 routine micro-spend, $5.00 supervisor-approved GPU lease, and $100.00 prompt injection defense with sub-second receipts.
* **Slide 5: Team & Circle Grant Roadmap:** Transitioning from Microgrant to full Circle Grant: Multi-agent organizational pools, StableFX automated currency routing, and AI framework plugins (LangChain, AutoGen).
