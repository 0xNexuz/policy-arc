# 08. Test Plan & Verification Strategy

## Test Philosophy
The testing strategy follows the Build Harness core principle:
> *Do not ship a claim. Ship the mechanism, the invariant, the attack/failure case, the test, and the evidence.*

## Test Suites

### 1. Invariant Test Harness (`scripts/test_harness.js`)
* **Objective:** Ensure all 7 formal invariants hold under adversarial conditions.
* **Execution:** `node scripts/test_harness.js`
* **Coverage:**
  * `INV-001`: Per-Tx limit overflow test.
  * `INV-002`: Daily rolling budget overflow test.
  * `INV-003`: Supervisor co-signature requirement test.
  * `INV-004`: Recipient whitelist rejection test.
  * `INV-005`: Emergency pause circuit breaker freeze test.
  * `INV-006`: Monotonic nonce replay defense test.
  * `INV-007`: Arc native USDC gas denomination test.
* **Result:** 7/7 PASSED (100%).

### 2. Autonomous Agent Scenario Runner (`scripts/standalone_sim.js`)
* **Objective:** Validate end-to-end user workflows matching the demo plan.
* **Execution:** `npm run sim`
* **Scenarios Tested:**
  * Routine micro-payment ($0.25 USDC) with instant settlement.
  * High-value spend ($5.00 USDC) with supervisor signature co-signing.
  * Prompt-injection drain attempt ($100.00 USDC) with deterministic fail-closed protection.

### 3. Web Dashboard End-to-End Verification
* **Objective:** Ensure UI elements, scenario dispatchers, approval drawers, and receipts update dynamically.
* **Execution:** Tested live on `http://localhost:3000`.
