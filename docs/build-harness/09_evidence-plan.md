# 09. Evidence Plan

This document catalogs verifiable evidence proving the technical claims of PolicyArc.

## Artifact Evidence Inventory

| Claim | Evidence File / Proof | Verification Method |
|---|---|---|
| **Live Arc Testnet Contracts** | `PolicyVault`: `0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0`<br>`MockUSDC`: `0xF687526a4d16b227832fD6ea48F1644b0497fc04` | Verified on [Arcscan](https://testnet.arcscan.app/address/0xb9176558920B53e9542AD75eDC9Bfa68de3A89C0) |
| **All Invariants Enforced** | `docs/build-harness/evidence-test-report.json` | Run `node scripts/test_harness.js` |
| **Micro-Settlement Verified** | Terminal execution log / Receipt Hash | Run `npm run sim` (returns valid receipt) |
| **Prompt Injection Prevented** | Rejection logs with fail-closed state | Run Scenario 3 in CLI or on `http://localhost:3000` |
| **Interactive Console Functional** | Live HTTP server on port 3000 | Open `http://localhost:3000` |
| **Technical Documentation Complete** | Live documentation page | Open `http://localhost:3000/docs.html` |
| **Arc Testnet Parameters Grounded** | `hardhat.config.js` and `deploy_live.js` | Verified against official Circle Arc Testnet specs |

## Reproducible Command Proof

```bash
# Verify all invariants in one step:
node scripts/test_harness.js

# Output:
# [✅ PASS] INV-001: Per-Tx Limit Enforcement
# [✅ PASS] INV-002: Cumulative Daily Budget Cap
# [✅ PASS] INV-003: Supervisor Co-Signature Requirement
# [✅ PASS] INV-004: Recipient Whitelist Enforcement
# [✅ PASS] INV-005: Emergency Pause Circuit Breaker
# [✅ PASS] INV-006: Replay Protection Nonce Monotonicity
# [✅ PASS] INV-007: Arc Native USDC Gas Standard
# 📊 INVARIANT TEST SUMMARY: 7/7 PASSED (100%)
```
