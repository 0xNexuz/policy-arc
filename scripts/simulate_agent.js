const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { PolicyArcClient } = require("../sdk/PolicyArcClient");

async function main() {
  console.log("\n============================================================");
  console.log("       🤖 POLICYARC: AUTONOMOUS AGENT SIMULATION RUNNER     ");
  console.log("       Simulated Arc L1 • Malachite Engine • USDC Gas       ");
  console.log("============================================================\n");

  const deploymentPath = path.join(__dirname, "../deployments/arc-testnet.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment.json not found! Run 'npx hardhat run scripts/deploy.js' first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const signers = await ethers.getSigners();
  const [owner, agent, supervisor, serviceProviderA, serviceProviderB, rogueTarget] = signers;

  const client = new PolicyArcClient({
    vaultAddress: deployment.contracts.PolicyVault.address,
    usdcAddress: deployment.contracts.MockUSDC.address,
    signer: agent
  });

  // 1. Initial State Inspection
  console.log("📊 [STEP 1] Agent Policy Status on Arc:");
  const status = await client.getPolicyStatus();
  console.log(`   - Authorized        : ${status.isAuthorized ? "✅ Yes" : "❌ No"}`);
  console.log(`   - 24h Daily Limit   : $${status.dailyLimitUSDC.toFixed(2)} USDC`);
  console.log(`   - Per-Tx Limit      : $${status.perTxLimitUSDC.toFixed(2)} USDC`);
  console.log(`   - Approval Gate     : > $${status.approvalThresholdUSDC.toFixed(2)} USDC`);
  console.log(`   - Spent Today       : $${status.spentTodayUSDC.toFixed(2)} USDC`);
  console.log(`   - Remaining Budget  : $${status.remainingTodayUSDC.toFixed(2)} USDC`);

  // ------------------------------------------------------------
  // Scenario 1: Autonomous Micro-Payment (< Threshold)
  // ------------------------------------------------------------
  console.log("\n------------------------------------------------------------");
  console.log("🧪 [SCENARIO 1] Autonomous Routine Micro-Payment");
  console.log("   Task: Agent queries DeepSearch Academic API for market data");
  console.log("   Cost: 0.25 USDC (below $2.00 threshold)");
  console.log("------------------------------------------------------------");

  try {
    const result1 = await client.executeSpend({
      recipient: serviceProviderA.address,
      amountUSDC: 0.25,
      purpose: "DeepSearch API: Academic Literature Semantic Query",
      taskPayload: { query: "stablecoin settlement velocity", limit: 50 }
    });

    console.log("   ✅ SUCCESS: Micro-payment settled instantaneously on Arc!");
    console.log(`   - Tx Hash         : ${result1.txHash}`);
    console.log(`   - Block Number    : ${result1.blockNumber}`);
    console.log(`   - Amount Settled  : $${result1.amountUSDC} USDC`);
    console.log(`   - Gas Fee (USDC)  : $${result1.gasUsedUSDC} USDC (Native Gas)`);
    console.log(`   - Spend Nonce     : #${result1.spendNonce}`);
    console.log(`   - Receipt Hash    : ${result1.receiptVerificationHash}`);
  } catch (err) {
    console.error("   ❌ Failed:", err.message);
  }

  // ------------------------------------------------------------
  // Scenario 2: High-Value Task with Supervisor Sign-off
  // ------------------------------------------------------------
  console.log("\n------------------------------------------------------------");
  console.log("🧪 [SCENARIO 2] High-Value Spend Exceeding Approval Threshold");
  console.log("   Task: Agent allocates GPU Compute Cluster for model fine-tuning");
  console.log("   Cost: 5.00 USDC (exceeds $2.00 supervisor threshold)");
  console.log("------------------------------------------------------------");

  try {
    const taskPayload = { model: "llama-3-8b-lora", epochs: 3, dataset: "arc-finance" };
    const taskHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(taskPayload)));
    const amountUSDC = 5.0;
    const amountUnits = BigInt(amountUSDC * 1e6);

    console.log("   ⚠️ Preflight Check: Spend exceeds $2.00 threshold. Requesting Supervisor approval...");

    // Supervisor constructs authorization signature
    const vault = new ethers.Contract(
      deployment.contracts.PolicyVault.address,
      ["function spendNonce() external view returns (uint256)"],
      supervisor
    );
    const nonce = await vault.spendNonce();
    const network = await ethers.provider.getNetwork();

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "address", "uint256", "bytes32", "uint256", "uint256"],
      [
        deployment.contracts.PolicyVault.address,
        agent.address,
        serviceProviderB.address,
        amountUnits,
        taskHash,
        nonce,
        network.chainId
      ]
    );

    const supervisorSig = await supervisor.signMessage(ethers.getBytes(messageHash));
    console.log("   ✍️  Supervisor cryptographically co-signed authorization!");

    const result2 = await client.executeSpend({
      recipient: serviceProviderB.address,
      amountUSDC,
      purpose: "GPU Compute Lease: LLaMA-3 LoRA Fine-Tuning",
      taskPayload,
      supervisorSig
    });

    console.log("   ✅ SUCCESS: High-value spend verified and settled on Arc!");
    console.log(`   - Tx Hash         : ${result2.txHash}`);
    console.log(`   - Amount Settled  : $${result2.amountUSDC} USDC`);
    console.log(`   - Gas Fee (USDC)  : $${result2.gasUsedUSDC} USDC`);
    console.log(`   - Spend Nonce     : #${result2.spendNonce}`);
    console.log(`   - Receipt Hash    : ${result2.receiptVerificationHash}`);
  } catch (err) {
    console.error("   ❌ Failed:", err.message);
  }

  // ------------------------------------------------------------
  // Scenario 3: Malicious Injection / Budget Overflow Rejection
  // ------------------------------------------------------------
  console.log("\n------------------------------------------------------------");
  console.log("🧪 [SCENARIO 3] Rogue / Prompt Injection Defense");
  console.log("   Task: Simulated prompt injection instructs agent to drain 100 USDC");
  console.log("   Expected: Instant deterministic policy rejection (Fail-Closed)");
  console.log("------------------------------------------------------------");

  try {
    await client.executeSpend({
      recipient: rogueTarget.address,
      amountUSDC: 100.0,
      purpose: "Malicious Prompt Injection Drain Attempt",
      taskPayload: { injected: true }
    });
    console.error("   ❌ ERROR: Transaction should have been blocked!");
  } catch (err) {
    console.log("   🛡️  DEFENSE ACTIVATED: Spend blocked by deterministic policy!");
    console.log(`   - Reason: ${err.message}`);
    console.log("   - Vault Assets: 100% Protected (Zero leakage)");
  }

  // Final Balance Verification
  const finalStatus = await client.getPolicyStatus();
  console.log("\n============================================================");
  console.log("📈 [SUMMARY] Final Policy State:");
  console.log(`   - Total Spent Today : $${finalStatus.spentTodayUSDC.toFixed(2)} USDC`);
  console.log(`   - Remaining Budget  : $${finalStatus.remainingTodayUSDC.toFixed(2)} USDC`);
  console.log("   - All transactions denominated and paid in native USDC");
  console.log("============================================================\n");
}

main().catch((err) => {
  console.error("Simulation runner error:", err);
  process.exitCode = 1;
});
