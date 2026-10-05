const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("   PolicyArc: Deploying to Arc Simulated Testnet ");
  console.log("   Gas Token: Native USDC (Circle L1 Standard)   ");
  console.log("=================================================");

  const [owner, agent, supervisor, serviceProviderA, serviceProviderB] = await ethers.getSigners();
  const ONE_USDC = 1000000n; // 6 decimals

  console.log(`Deployer / Owner : ${owner.address}`);
  console.log(`Supervisor       : ${supervisor.address}`);
  console.log(`Autonomous Agent : ${agent.address}`);
  console.log(`Service Provider : ${serviceProviderA.address}`);

  // 1. Deploy MockUSDC
  console.log("\n1. Deploying MockUSDC (6 decimals)...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(100000n * ONE_USDC); // 100,000 USDC initial supply
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log(`   MockUSDC deployed at: ${usdcAddress}`);

  // 2. Deploy PolicyVault
  console.log("\n2. Deploying PolicyVault...");
  const PolicyVault = await ethers.getContractFactory("PolicyVault");
  const policyVault = await PolicyVault.deploy(usdcAddress, supervisor.address);
  await policyVault.waitForDeployment();
  const vaultAddress = await policyVault.getAddress();
  console.log(`   PolicyVault deployed at: ${vaultAddress}`);

  // 3. Fund PolicyVault with 1,000 USDC
  console.log("\n3. Funding PolicyVault with 1,000 USDC...");
  await mockUSDC.transfer(vaultAddress, 1000n * ONE_USDC);
  const vaultBal = await policyVault.vaultBalance();
  console.log(`   PolicyVault USDC balance: ${(Number(vaultBal) / 1e6).toFixed(2)} USDC`);

  // 4. Fund Agent with 50 USDC for local gas/testing
  console.log("\n4. Funding Agent wallet with 50 USDC...");
  await mockUSDC.transfer(agent.address, 50n * ONE_USDC);

  // 5. Configure Agent Policy
  console.log("\n5. Configuring Deterministic Policy for Agent...");
  const dailyLimit = 50n * ONE_USDC;       // $50.00 / 24h
  const perTxLimit = 10n * ONE_USDC;       // $10.00 max single spend
  const approvalThreshold = 2n * ONE_USDC; // $2.00 requires supervisor signature
  const whitelistOnly = true;

  await policyVault.setAgentPolicy(
    agent.address,
    true,
    dailyLimit,
    perTxLimit,
    approvalThreshold,
    whitelistOnly
  );
  console.log(`   Agent authorized with limits:`);
  console.log(`   - 24h Daily Limit       : ${(Number(dailyLimit) / 1e6).toFixed(2)} USDC`);
  console.log(`   - Per-Tx Limit          : ${(Number(perTxLimit) / 1e6).toFixed(2)} USDC`);
  console.log(`   - Supervisor Threshold  : ${(Number(approvalThreshold) / 1e6).toFixed(2)} USDC`);
  console.log(`   - Whitelist Enforcement : ${whitelistOnly}`);

  // 6. Whitelist Service Providers
  console.log("\n6. Whitelisting Verified Service Providers...");
  await policyVault.setRecipientWhitelist(serviceProviderA.address, true);
  await policyVault.setRecipientWhitelist(serviceProviderB.address, true);
  console.log(`   - DeepSearch AI API      : ${serviceProviderA.address} (Whitelisted)`);
  console.log(`   - GPU Compute Cluster    : ${serviceProviderB.address} (Whitelisted)`);

  // 7. Export Deployment Metadata
  const network = await ethers.provider.getNetwork();
  const deploymentData = {
    network: {
      name: "Arc Simulated Testnet",
      chainId: Number(network.chainId),
      rpcUrl: "http://127.0.0.1:8545",
      consensusEngine: "Malachite (Sub-second Finality)",
      nativeGasAsset: "USDC"
    },
    contracts: {
      MockUSDC: {
        address: usdcAddress,
        decimals: 6,
        symbol: "USDC"
      },
      PolicyVault: {
        address: vaultAddress,
        owner: owner.address,
        supervisor: supervisor.address
      }
    },
    roles: {
      owner: owner.address,
      supervisor: supervisor.address,
      agent: agent.address,
      serviceProviderA: serviceProviderA.address,
      serviceProviderB: serviceProviderB.address
    },
    policy: {
      dailyLimitUSDC: Number(dailyLimit) / 1e6,
      perTxLimitUSDC: Number(perTxLimit) / 1e6,
      approvalThresholdUSDC: Number(approvalThreshold) / 1e6,
      whitelistOnly
    },
    deployedAt: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "arc-testnet.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log(`\nDeployment metadata exported to: deployments/arc-testnet.json`);
  console.log("=================================================");
  console.log("   PolicyArc Deployment Complete & Operational!  ");
  console.log("=================================================\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
