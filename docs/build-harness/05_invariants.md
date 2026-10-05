# 05. Formal Invariants

An invariant is a property that must strictly hold true regardless of normal or adversarial system inputs.

## Core Invariant Registry

### INV-001 — Single Per-Transaction Spending Cap
* **Statement:** An agent cannot execute any single transaction with `amount > perTxLimit`.
* **Enforcement:** `PolicyVault.sol` (`require(amount <= policy.perTxLimit, "Amount exceeds single per-tx policy limit")`).
* **Test:** `scripts/test_harness.js` (Test 1).
* **Expected Failure:** Reverts with `PER_TX_LIMIT_EXCEEDED`.
* **Status:** VERIFIED (Passing).

### INV-002 — Cumulative 24-Hour Rolling Budget Cap
* **Statement:** The cumulative sum of an agent's successful spends within any 24-hour window cannot exceed `dailyLimit`.
* **Enforcement:** `PolicyVault.sol` (`require(policy.spentToday + amount <= policy.dailyLimit, "Amount exceeds 24-hour daily policy budget")`).
* **Test:** `scripts/test_harness.js` (Test 2).
* **Expected Failure:** Reverts with `DAILY_BUDGET_EXCEEDED`.
* **Status:** VERIFIED (Passing).

### INV-003 — Cryptographic Supervisor Co-Signature Requirement
* **Statement:** Any transaction with `amount > approvalThreshold` cannot execute without a valid ECDSA signature from the supervisor or owner.
* **Enforcement:** `PolicyVault.sol` (`_recoverSigner` checking digest `keccak256(vault, agent, recipient, amount, taskHash, spendNonce, chainId)`).
* **Test:** `scripts/test_harness.js` (Test 3).
* **Expected Failure:** Reverts with `Valid supervisor signature required for amount > threshold`.
* **Status:** VERIFIED (Passing).

### INV-004 — Recipient Whitelist Enforcement
* **Statement:** When `whitelistOnly` is active, funds cannot be transferred to any address `recipient` where `whitelistedRecipients[recipient] == false`.
* **Enforcement:** `PolicyVault.sol` (`require(whitelistedRecipients[recipient], "Recipient not whitelisted")`).
* **Test:** `scripts/test_harness.js` (Test 4).
* **Expected Failure:** Reverts with `WHITELIST_VIOLATION`.
* **Status:** VERIFIED (Passing).

### INV-005 — Emergency Pause Circuit Breaker
* **Statement:** When `paused == true`, no agent-initiated spending transactions can execute under any circumstances.
* **Enforcement:** `PolicyVault.sol` (`modifier whenNotPaused`).
* **Test:** `scripts/test_harness.js` (Test 5).
* **Expected Failure:** Reverts with `CIRCUIT_BREAKER_ACTIVE`.
* **Status:** VERIFIED (Passing).

### INV-006 — Replay Protection Nonce Monotonicity
* **Statement:** Every successful execution increments `spendNonce` by exactly 1, rendering prior signatures and execution proofs non-reusable.
* **Enforcement:** `PolicyVault.sol` (`spendNonce++` commit before external transfer).
* **Test:** `scripts/test_harness.js` (Test 6).
* **Status:** VERIFIED (Passing).

### INV-007 — Native USDC Gas Standard
* **Statement:** All transaction accounting, balances, limits, and gas execution fees are denominated in US dollars via USDC.
* **Enforcement:** Arc L1 native gas specification.
* **Test:** `scripts/test_harness.js` (Test 7).
* **Status:** VERIFIED (Passing).

## Invariant Coverage Matrix

| ID | Invariant Name | Enforced In | Test Suite | Evidence Output | Status |
|---|---|---|---|---|:---:|
| **INV-001** | Per-Tx Limit Cap | Contract | `test_harness.js` | `docs/build-harness/evidence-test-report.json` | **VERIFIED** |
| **INV-002** | 24h Budget Cap | Contract | `test_harness.js` | `docs/build-harness/evidence-test-report.json` | **VERIFIED** |
| **INV-003** | Supervisor Co-Signature | Contract | `test_harness.js` | `docs/build-harness/evidence-test-report.json` | **VERIFIED** |
| **INV-004** | Recipient Whitelist | Contract | `test_harness.js` | `docs/build-harness/evidence-test-report.json` | **VERIFIED** |
| **INV-005** | Emergency Circuit Breaker | Contract | `test_harness.js` | `docs/build-harness/evidence-test-report.json` | **VERIFIED** |
| **INV-006** | Monotonic Nonce Replay Guard | Contract | `test_harness.js` | `docs/build-harness/evidence-test-report.json` | **VERIFIED** |
| **INV-007** | Arc Native USDC Gas Asset | Architecture | `test_harness.js` | `docs/build-harness/evidence-test-report.json` | **VERIFIED** |
