# 01. The Problem

## Problem Statement

Autonomous software agents (LLM swarms, LangChain, AutoGen, CrewAI) are evolving from text assistants into economic actors that need to pay for compute, acquire API keys, lease inference nodes, and settle machine-to-machine subcontracts.

However, giving autonomous agents access to on-chain capital currently suffers from two fatal problems:

1. **The Volatile Gas Trap:** Traditional blockchains (Ethereum, Solana, Polygon) require paying gas in volatile tokens (ETH, SOL, POL). Autonomous agents cannot budget reliably when transaction fees fluctuate unpredictably or when secondary token balances run dry. A sudden gas spike halts entire agent pipelines.
2. **The Unbounded Treasury Drain:** If an autonomous agent's private key is given direct wallet access, prompt injection attacks or software runaway loops can drain the entire treasury in seconds.

## Target User

* **Primary:** Developers building autonomous AI agents and multi-agent coordination pipelines.
* **Secondary:** Enterprises and DAO operations deploying automated bots with dedicated spending allowances.

## Current Workarounds & Why They Fail

* **Pre-funded EOA Wallets:** Developers fund an agent's private key with a small amount of ETH and USDC.
  * *Failure Mode:* Agent runs out of ETH for gas while holding plenty of USDC, freezing tasks; or prompt injection drains the entire balance.
* **Centralized Web2 API Cards (Stripe/Brex):** Virtual debit cards issued to agents.
  * *Failure Mode:* High interchange fees, multi-day international settlement, inability to execute micro-transactions (&lt;$0.10), and lack of cryptographic verifiable execution receipts.

## Measurable Improvement

* **100% Dollar-Denominated Operations:** 0 volatile gas tokens held or tracked.
* **Zero Treasury Drains:** Hard deterministic spending caps enforce fail-closed safety.
* **Sub-Second Micro-Settlement:** Arc's Malachite consensus settles payments in &lt;800ms.
