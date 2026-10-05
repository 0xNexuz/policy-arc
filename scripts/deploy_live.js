require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================================");
  console.log("     ◬ PolicyArc: Arc Testnet Live Deployment (Circle L1)         ");
  console.log("==================================================================\n");

  const rpcUrl = process.env.ARC_TESTNET_RPC || "https://rpc.testnet.arc.network";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.log("⚠️ No PRIVATE_KEY configured in .env!");
    return;
  }

  // Ensure artifacts exist
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const usdcArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, "MockUSDC.json"), "utf8"));
  const vaultArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, "PolicyVault.json"), "utf8"));

  const fetchReq = new ethers.FetchRequest(rpcUrl);
  fetchReq.timeout = 45000; // 45 seconds

  const provider = new ethers.JsonRpcProvider(
    fetchReq,
    { chainId: 5042002, name: "Arc Testnet" },
    { staticNetwork: true, batchMaxCount: 1 }
  );

  const formattedKey = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
  const wallet = new ethers.Wallet(formattedKey, provider);

  console.log(`Connecting to Arc Testnet via: ${rpcUrl}`);
  console.log(`Deployer Address : ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer Balance : ${ethers.formatUnits(balance, 18)} USDC (Native Gas)`);

  if (balance === 0n) {
    console.log("\n⚠️  Wallet balance is 0 USDC! Awaiting faucet funding.\n");
    return;
  }

  const ONE_USDC = 1000000n; // 6 decimals for token logic

  // 1. Deploy MockUSDC
  console.log("\n1. Broadcasting MockUSDC contract to Arc Testnet...");
  const usdcFactory = new ethers.ContractFactory(usdcArtifact.abi, usdcArtifact.bytecode, wallet);
  const mockUSDC = await usdcFactory.deploy(100000n * ONE_USDC);
  console.log(`   ⏳ Transaction submitted: ${mockUSDC.deploymentTransaction().hash}`);
  console.log(`   Waiting for Malachite sub-second confirmation...`);
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log(`   ✅ MockUSDC Deployed: ${usdcAddress}`);
  console.log(`   Explorer Link: https://testnet.arcscan.app/address/${usdcAddress}`);

  // 2. Deploy PolicyVault
  console.log("\n2. Broadcasting PolicyVault contract to Arc Testnet...");
  const vaultFactory = new ethers.ContractFactory(vaultArtifact.abi, vaultArtifact.bytecode, wallet);
  const policyVault = await vaultFactory.deploy(usdcAddress, wallet.address);
  console.log(`   ⏳ Transaction submitted: ${policyVault.deploymentTransaction().hash}`);
  console.log(`   Waiting for Malachite sub-second confirmation...`);
  await policyVault.waitForDeployment();
  const vaultAddress = await policyVault.getAddress();
  console.log(`   ✅ PolicyVault Deployed: ${vaultAddress}`);
  console.log(`   Explorer Link: https://testnet.arcscan.app/address/${vaultAddress}`);

  // 3. Fund Vault with initial 100 USDC token
  console.log("\n3. Depositing 100 USDC into PolicyVault...");
  const fundTx = await mockUSDC.transfer(vaultAddress, 100n * ONE_USDC);
  console.log(`   ⏳ Funding Tx submitted: ${fundTx.hash}`);
  await fundTx.wait();
  console.log("   ✅ Vault Funded with 100 USDC");

  // 4. Configure Agent Policy
  console.log("\n4. Setting initial agent policy on PolicyVault...");
  const setPolicyTx = await policyVault.setAgentPolicy(
    wallet.address,      // Self-authorized for initial testing
    true,                // isAuthorized
    50n * ONE_USDC,      // dailyLimit: $50.00
    10n * ONE_USDC,      // perTxLimit: $10.00
    2n * ONE_USDC,       // approvalThreshold: $2.00
    false                // whitelistOnly (open for initial test)
  );
  console.log(`   ⏳ Policy Tx submitted: ${setPolicyTx.hash}`);
  await setPolicyTx.wait();
  console.log("   ✅ Agent Policy configured successfully");

  // 5. Save Live Deployment Info
  const deploymentInfo = {
    network: "Arc Testnet (Circle)",
    chainId: 5042002,
    rpcUrl,
    explorer: "https://testnet.arcscan.app/",
    deployer: wallet.address,
    contracts: {
      MockUSDC: usdcAddress,
      PolicyVault: vaultAddress
    },
    transactions: {
      deployMockUSDC: mockUSDC.deploymentTransaction().hash,
      deployPolicyVault: policyVault.deploymentTransaction().hash,
      fundVault: fundTx.hash,
      setPolicy: setPolicyTx.hash
    },
    deployedAt: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "arc-testnet-live.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n==================================================================");
  console.log("   🎉 LIVE DEPLOYMENT COMPLETE ON ARC TESTNET!");
  console.log(`   PolicyVault : https://testnet.arcscan.app/address/${vaultAddress}`);
  console.log(`   MockUSDC    : https://testnet.arcscan.app/address/${usdcAddress}`);
  console.log(`   Saved Manifest: deployments/arc-testnet-live.json`);
  console.log("==================================================================\n");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exitCode = 1;
});
