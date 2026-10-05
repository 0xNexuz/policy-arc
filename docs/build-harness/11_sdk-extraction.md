# 11. Reusable SDK & Primitive Extraction

## Core Question
> *"What useful primitive could another developer adopt without using the entire application?"*

## Extracted Reusable Primitive: `PolicyArcClient`

The module in `sdk/PolicyArcClient.js` is engineered to be an independent, framework-agnostic client that can be dropped into any AI agent framework (LangChain, AutoGen, CrewAI, Antigravity SDK).

### Extracted Capabilities
1. **Pre-flight Policy Interceptor:** Evaluates agent tool expenditures locally before sending RPC requests, eliminating wasted network calls and gas fees for out-of-policy actions.
2. **Deterministic Spending Gate:** Standardized JavaScript interface for interacting with `PolicyVault.sol`.
3. **Verifiable Audit Receipt Formatter:** Creates cryptographic SHA-256 execution proofs binding the task hash, agent address, recipient address, spend nonce, and gas cost.

### Potential Standalone Package: `@policyarc/sdk`
* **Target Audience:** Any developer building autonomous agents that need to pay for Web3 or Web2 APIs using stablecoins.
* **Compatibility:** Arc L1, EVM Layer-2s, and local testnets.
* **Dependencies:** Only requires `ethers` (or `viem`).
