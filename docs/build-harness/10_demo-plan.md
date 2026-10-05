# 10. Demo Plan (90-Second Judge Flow)

## Target Audience
Hackathon judges evaluating the **Arc Microgrants** track on DoraHacks (Circle ecosystem).

## The 90-Second Walkthrough Sequence

```
[00:00 - 00:20] ──> The Hook & Problem (Arc Gas Advantage)
[00:20 - 00:40] ──> Demo Action 1: Routine Micro-Spend ($0.25 USDC)
[00:40 - 01:05] ──> Demo Action 2: High-Value Spend ($5.00 USDC) & Supervisor Co-Signature
[01:05 - 01:20] ──> Demo Action 3: Rogue Prompt Injection Defense ($100 USDC Blocked)
[01:20 - 01:30] ──> The Vision & Circle Grant Pipeline
```

### Detailed Script

1. **The Hook (0:00 - 0:20):**
   * *"AI agents have wallets, but traditional blockchains force them to hold volatile gas tokens, breaking autonomous budgets. Arc solves this by making USDC the native gas asset. PolicyArc builds the missing operating layer on top."*
2. **Action 1 — Routine Micro-Spend (0:20 - 0:40):**
   * Click **1. ROUTINE_MICRO_PAYMENT** ($0.25 USDC).
   * Point out: Instant settlement (&lt;800ms) powered by Malachite BFT. Gas fee is 0.000120 USDC (denominated strictly in US dollars).
3. **Action 2 — High-Value Spend with Supervisor Gate (0:40 - 1:05):**
   * Click **2. HIGH_VALUE_SUPERVISOR_GATE** ($5.00 USDC).
   * Show: The preflight gate halts the spend because it exceeds the $2.00 threshold. The supervisor drawer opens. Click **CO-SIGN WITH SUPERVISOR KEY**. The spend settles on-chain with verifiable ECDSA proof.
4. **Action 3 — Prompt Injection Defense (1:05 - 1:20):**
   * Click **3. ROGUE_INJECTION_DEFENSE** ($100.00 USDC drain attempt).
   * Show: Instant fail-closed contract block. Treasury balance remains 100% intact.
5. **The Close (1:20 - 1:30):**
   * *"With PolicyArc, enterprises can safely deploy autonomous AI swarms on Circle rails. This microgrant establishes our direct foundation for the Circle Grant Program."*
