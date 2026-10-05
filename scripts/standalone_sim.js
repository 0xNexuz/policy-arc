const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * ◬ PolicyArc: Standalone Arc Simulated Testnet & Agent Workflow Runner
 * 
 * Simulates Arc's unique blockchain primitives:
 * 1. USDC Native Gas (Transaction fees denominated in USDC, not ETH)
 * 2. Malachite Consensus Engine (Sub-second deterministic finality)
 * 3. Deterministic Policy Enforcement (Fail-closed protection)
 * 4. Human Supervisor Cryptographic Co-Signatures
 */

class ArcPolicyVaultSimulator {
  constructor() {
    this.network = {
      name: "Arc Simulated L1 (Circle)",
      chainId: 77777,
      consensusEngine: "Malachite BFT",
      finalityTime: "680ms (Deterministic)",
      nativeGasToken: "USDC"
    };

    this.contracts = {
      MockUSDC: "0x3841c7b89fE92B19e2c60811e58284566F6A3e21",
      PolicyVault: "0x892aF06D339678eF46C38A1aB3e0984180A2b27F"
    };

    this.roles = {
      owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      supervisor: "0x5de4111afa1a4b94908f83103eb2f958080a1564f830aab45a2cda1107813601",
      agent: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      serviceProviderA: "0xdf57089feb34744236b64b4b755767c75683a524f28522ee647e44e0ce3e248e", // DeepSearch API
      serviceProviderB: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",                         // GPU Compute
      untrustedTarget: "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E"
    };

    this.state = {
      vaultBalance: 1000.00,
      spentToday: 0.00,
      dailyLimit: 50.00,
      perTxLimit: 10.00,
      approvalThreshold: 2.00,
      whitelistOnly: true,
      spendNonce: 0,
      paused: false
    };

    this.whitelist = new Set([
      this.roles.serviceProviderA.toLowerCase(),
      this.roles.serviceProviderB.toLowerCase()
    ]);
  }

  calculateArcGasFee(opWeight = 1) {
    // Arc native gas calculation: ~0.000120 USDC per standard settlement
    return (0.000120 * opWeight).toFixed(6);
  }

  executeSpend({ agent, recipient, amountUSDC, purpose, taskPayload, supervisorSignature }) {
    if (this.state.paused) {
      throw new Error("CIRCUIT_BREAKER_ACTIVE: Vault is paused by emergency circuit breaker");
    }

    if (agent.toLowerCase() !== this.roles.agent.toLowerCase()) {
      throw new Error("UNAUTHORIZED_AGENT: Caller is not authorized on PolicyVault");
    }

    if (this.state.whitelistOnly && !this.whitelist.has(recipient.toLowerCase())) {
      throw new Error(`WHITELIST_VIOLATION: Recipient ${recipient} is not verified on Arc whitelist`);
    }

    if (amountUSDC > this.state.perTxLimit) {
      throw new Error(`PER_TX_LIMIT_EXCEEDED: Requested $${amountUSDC} USDC exceeds single cap of $${this.state.perTxLimit} USDC`);
    }

    if (this.state.spentToday + amountUSDC > this.state.dailyLimit) {
      throw new Error(`DAILY_BUDGET_EXCEEDED: Requested $${amountUSDC} USDC exceeds remaining 24h budget of $${(this.state.dailyLimit - this.state.spentToday).toFixed(2)} USDC`);
    }

    // Supervisor signature required if amount > threshold
    if (amountUSDC > this.state.approvalThreshold) {
      if (!supervisorSignature || !supervisorSignature.valid) {
        return {
          status: "REQUIRES_SUPERVISOR_APPROVAL",
          threshold: this.state.approvalThreshold,
          message: `Spend amount ($${amountUSDC} USDC) exceeds $${this.state.approvalThreshold} threshold. Awaiting human supervisor co-signature.`
        };
      }
    }

    // Deduct and commit
    this.state.spentToday += amountUSDC;
    this.state.vaultBalance -= amountUSDC;
    this.state.spendNonce++;

    const txHash = "0x" + crypto.randomBytes(32).toString("hex");
    const taskHash = crypto.createHash("sha256").update(JSON.stringify(taskPayload || {})).digest("hex");
    const gasFee = this.calculateArcGasFee(amountUSDC > this.state.approvalThreshold ? 1.25 : 1.0);

    const receipt = {
      status: "SETTLED_ON_ARC",
      network: this.network.name,
      consensusEngine: this.network.consensusEngine,
      finality: this.network.finalityTime,
      spendNonce: this.state.spendNonce,
      txHash,
      agent,
      recipient,
      amountSettledUSDC: amountUSDC.toFixed(2),
      gasFeeUSDC: `${gasFee} USDC (Native Gas Asset)`,
      purpose,
      taskHash: "0x" + taskHash,
      timestamp: new Date().toISOString(),
      receiptVerificationHash: "0x" + crypto.createHash("sha256").update(`${this.state.spendNonce}:${agent}:${recipient}:${amountUSDC}:${taskHash}`).digest("hex")
    };

    return receipt;
  }
}

async function runDemonstration() {
  console.log("================================================================================");
  console.log("            ◬ POLICYARC: AUTONOMOUS AGENT ECONOMIC SAFETY LAYER                ");
  console.log("             Simulated Arc L1 • Malachite Consensus • Native USDC Gas           ");
  console.log("================================================================================\n");

  const sim = new ArcPolicyVaultSimulator();

  console.log("📋 [INITIAL CONFIGURATION]");
  console.log(`   - Vault Treasury Balance : $${sim.state.vaultBalance.toFixed(2)} USDC`);
  console.log(`   - 24h Daily Spend Budget : $${sim.state.dailyLimit.toFixed(2)} USDC`);
  console.log(`   - Per-Tx Policy Cap      : $${sim.state.perTxLimit.toFixed(2)} USDC`);
  console.log(`   - Supervisor Gate        : > $${sim.state.approvalThreshold.toFixed(2)} USDC requires human co-signature`);
  console.log(`   - Whitelist Enforcement  : Active (${sim.whitelist.size} verified service providers)`);
  console.log(`   - Arc Native Gas Asset   : USDC (Zero volatile tokens required)\n`);

  // -------------------------------------------------------------------------
  // SCENARIO 1: Routine Autonomous Micro-Payment (< Threshold)
  // -------------------------------------------------------------------------
  console.log("--------------------------------------------------------------------------------");
  console.log("🧪 [SCENARIO 1] Autonomous Routine Micro-Payment");
  console.log("   Task    : Agent queries DeepSearch API for academic literature on stablecoins");
  console.log("   Cost    : $0.25 USDC (below $2.00 supervisor threshold)");
  console.log("--------------------------------------------------------------------------------");

  const result1 = sim.executeSpend({
    agent: sim.roles.agent,
    recipient: sim.roles.serviceProviderA,
    amountUSDC: 0.25,
    purpose: "DeepSearch Academic Literature Batch Query",
    taskPayload: { query: "stablecoin settlement velocity", max_results: 25 }
  });

  console.log("   ✅ SUCCESS: Settled instantaneously via Malachite Consensus!");
  console.log(`   - Tx Hash         : ${result1.txHash}`);
  console.log(`   - Finality        : ${result1.finality}`);
  console.log(`   - Amount Settled  : $${result1.amountSettledUSDC} USDC`);
  console.log(`   - Gas Fee         : ${result1.gasFeeUSDC}`);
  console.log(`   - Spend Nonce     : #${result1.spendNonce}`);
  console.log(`   - Receipt Hash    : ${result1.receiptVerificationHash}`);
  console.log(`   - Vault Balance   : $${sim.state.vaultBalance.toFixed(2)} USDC`);
  console.log(`   - Remaining Budget: $${(sim.state.dailyLimit - sim.state.spentToday).toFixed(2)} USDC\n`);

  // -------------------------------------------------------------------------
  // SCENARIO 2: High-Value Task Exceeding Threshold (Human Approval Gate)
  // -------------------------------------------------------------------------
  console.log("--------------------------------------------------------------------------------");
  console.log("🧪 [SCENARIO 2] High-Value Task with Supervisor Co-Signature");
  console.log("   Task    : Agent attempts to allocate GPU cluster for LLaMA-3 model fine-tuning");
  console.log("   Cost    : $5.00 USDC (Exceeds $2.00 threshold)");
  console.log("--------------------------------------------------------------------------------");

  // Step 2a: Agent pre-flight
  const preflight = sim.executeSpend({
    agent: sim.roles.agent,
    recipient: sim.roles.serviceProviderB,
    amountUSDC: 5.00,
    purpose: "GPU Compute Lease: LLaMA-3 LoRA Fine-Tuning"
  });

  if (preflight.status === "REQUIRES_SUPERVISOR_APPROVAL") {
    console.log("   ⚠️  PRE-FLIGHT GATE: Amount exceeds $2.00 threshold.");
    console.log(`   - Notice          : ${preflight.message}`);
    console.log("   - Human Action    : Supervisor reviews purpose and generates ECDSA signature...");
    
    // Simulate Supervisor approving
    const supervisorSig = {
      valid: true,
      signer: sim.roles.supervisor,
      sig: "0x4b7f9a88c2d1e0f3...MOCK_SUPERVISOR_ECDSA_SIG...99a0"
    };
    console.log("   ✍️  SUPERVISOR SIGNATURE VERIFIED: Co-signature attached.");

    const result2 = sim.executeSpend({
      agent: sim.roles.agent,
      recipient: sim.roles.serviceProviderB,
      amountUSDC: 5.00,
      purpose: "GPU Compute Lease: LLaMA-3 LoRA Fine-Tuning [Supervisor Signed]",
      taskPayload: { model: "llama-3-8b", epochs: 3, dataset: "arc-finance" },
      supervisorSignature: supervisorSig
    });

    console.log("   ✅ SUCCESS: High-value spend authorized & executed on Arc!");
    console.log(`   - Tx Hash         : ${result2.txHash}`);
    console.log(`   - Amount Settled  : $${result2.amountSettledUSDC} USDC`);
    console.log(`   - Gas Fee         : ${result2.gasFeeUSDC}`);
    console.log(`   - Spend Nonce     : #${result2.spendNonce}`);
    console.log(`   - Receipt Hash    : ${result2.receiptVerificationHash}`);
    console.log(`   - Remaining Budget: $${(sim.state.dailyLimit - sim.state.spentToday).toFixed(2)} USDC\n`);
  }

  // -------------------------------------------------------------------------
  // SCENARIO 3: Rogue Prompt Injection Defense (Fail-Closed)
  // -------------------------------------------------------------------------
  console.log("--------------------------------------------------------------------------------");
  console.log("🧪 [SCENARIO 3] Rogue Prompt Injection & Treasury Drain Defense");
  console.log("   Task    : Malicious injection attempts to siphon $100 USDC to unauthorized wallet");
  console.log("   Expected: Instant deterministic smart contract rejection (Fail-Closed)");
  console.log("--------------------------------------------------------------------------------");

  try {
    sim.executeSpend({
      agent: sim.roles.agent,
      recipient: sim.roles.untrustedTarget,
      amountUSDC: 100.00,
      purpose: "Prompt injection unauthorized transfer",
      taskPayload: { injected: true }
    });
    console.error("   ❌ ERROR: Spend should have been rejected!");
  } catch (err) {
    console.log("   🛡️  POLICY ENGINE BLOCKED ATTACK:");
    console.log(`   - Rejection Cause : ${err.message}`);
    console.log("   - Attack Outcome  : 0 USDC transferred. Vault 100% intact.");
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 [EXECUTION AUDIT SUMMARY]");
  console.log(`   - Total Processed Spends : ${sim.state.spendNonce} successful transactions`);
  console.log(`   - Total Spent Today      : $${sim.state.spentToday.toFixed(2)} USDC`);
  console.log(`   - Vault Treasury Reserve : $${sim.state.vaultBalance.toFixed(2)} USDC`);
  console.log("   - Native Gas Asset       : 100% USDC (Zero volatile token dependency)");
  console.log("   - Verification Standard  : Arc Malachite Deterministic Receipts");
  console.log("================================================================================\n");
}

if (require.main === module) {
  runDemonstration();
}

module.exports = { ArcPolicyVaultSimulator, runDemonstration };
