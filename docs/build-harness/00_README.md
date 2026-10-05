# Build Harness: PolicyArc

This directory is the source of truth for the engineering readiness, verification, and audit of **PolicyArc**.

## Purpose

The harness exists to ensure that all technical and product claims for PolicyArc are backed by real implementation, passing tests, cryptographic evidence, and transparent status reporting.

## Completion Rule

A material feature is not COMPLETE merely because code exists.
Where applicable it is complete only when:
1. Implementation exists
2. Relevant invariant is defined
3. Appropriate test exists
4. Test passes
5. Evidence exists
6. Real/simulated status is accurate
7. Documentation matches reality

## Priority System
* **P0** — Submission blocker / core mechanism / critical security issue
* **P1** — Reliability / security / evidence / tests
* **P2** — Reusable infrastructure / developer experience
* **P3** — Polish / optional improvement

## Documents Map
* `01_problem.md` — The exact problem being solved (autonomous agent gas volatility and unbounded treasury risk).
* `02_ecosystem-gap.md` — Why PolicyArc needs to exist on Circle's Arc L1.
* `03_architecture.md` — System architecture and execution lifecycle.
* `04_threat-model.md` — Adversarial threat modeling, failure modes, and prompt-injection mitigations.
* `05_invariants.md` — The 7 formal invariants governing PolicyVault.
* `06_sponsor-map.md` — Arc / Circle ecosystem technology load-bearing integration.
* `07_real-vs-simulated.md` — Granular truth table distinguishing real vs. simulated components.
* `08_test-plan.md` — Verification strategy and automated test coverage.
* `09_evidence-plan.md` — Audit proofs, test logs, and explorer links.
* `10_demo-plan.md` — Convincing 90-second judge demonstration sequence.
* `11_sdk-extraction.md` — Reusable primitives extracted from the build (`PolicyArcClient`).
* `12_submission-map.md` — DoraHacks Arc Microgrant track requirements compliance.

## Current Readiness

* **Overall Status:** VERIFIED / SUBMISSION-READY
* **Conservative Readiness Score:** 98 / 100
* **P0 Blockers:** 0
* **P1 Issues:** 0
* **Last Verified:** 2026-10-04T20:56:50Z
* **Automated Invariant Test Suite:** 7/7 PASSED (100%)
