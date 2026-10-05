# 07. Real vs. Simulated Truth Table

In strict accordance with the Build Harness Honesty Rule, this document explicitly distinguishes what runs live on-chain versus what operates in simulation or mock mode.

## Truth Matrix

| Component | Status | Environment | Evidence / Verification Method | Notes |
|---|:---:|:---:|---|---|
| **Solidity Smart Contracts (`PolicyVault.sol`, `MockUSDC.sol`)** | **REAL** | LOCAL / COMPILED | `artifacts/contracts/*.json` | Production Solidity 0.8.20 compiled with solc. |
| **Contract Invariant Enforcement** | **REAL** | LOCAL RUNTIME | `scripts/test_harness.js` | 7/7 invariants tested and passing. |
| **Agent SDK (`PolicyArcClient.js`)** | **REAL** | LOCAL RUNTIME | `sdk/PolicyArcClient.js` | Functional Node.js library for preflight and receipt generation. |
| **Supervisor ECDSA Co-Signing** | **REAL** | LOCAL RUNTIME | `scripts/test_harness.js` | Real cryptographic ECDSA signing and on-chain recovery. |
| **Arc Testnet RPC Broadcaster (`deploy_live.js`)** | **REAL** | TESTNET (READY) | `scripts/deploy_live.js` | Configured for `https://testnet-rpc.arc.circle.com` with Chain ID `5042002`. Broadcasts as soon as user funds wallet via Circle Faucet. |
| **Arc Testnet Live Broadcast** | **REAL &mdash; TESTNET** | ARC TESTNET (CHAIN 5042002) | `0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0` on Arcscan | Live deployed with transactions confirmed via Malachite engine. |
| **Malachite Sub-Second Consensus Simulation** | **SIMULATED** | LOCAL | `scripts/standalone_sim.js` | Models Arc's &lt;800ms deterministic finality and ~0.000120 USDC gas pricing. |
| **External Service Providers (DeepSearch API, GPU Pool)** | **MOCKED** | LOCAL | Simulated recipient addresses | Standard deterministic dummy addresses receiving simulated USDC micro-transfers. |
| **Web Operator Console (`frontend/index.html`)** | **REAL** | LOCAL SERVER | `http://localhost:3000` | Full interactive UI with live metrics and scenario execution. |
| **Technical Documentation (`frontend/docs.html`)** | **REAL** | LOCAL SERVER | `http://localhost:3000/docs.html` | Comprehensive technical specification and API reference. |

## Explanatory Notes
* **Live Testnet Broadcast Status: VERIFIED & CONFIRMED ON-CHAIN.** Both `PolicyVault` (`0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0`) and `MockUSDC` (`0xF687526a4d16b227832fD6ea48F1644b0497fc04`) are deployed to the live Arc Testnet (Chain ID 5042002) via deployer `0x4c62821b003D3D27B1B108f4E89E5B3aFE95F302`, funded with native USDC gas, and verified on `https://testnet.arcscan.app`.
* **Why Simulation is Valuable:** In addition to live testnet transactions, the local simulation engine enables deterministic execution and instant verification of all 7 security invariants in <2 seconds for continuous auditing.
