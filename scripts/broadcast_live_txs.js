require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("------------------------------------------------------------");
  console.log("BROADCASTING FRESH LIVE TRANSACTIONS ON ARC TESTNET");
  console.log("------------------------------------------------------------");

  const rpcUrl = process.env.ARC_TESTNET_RPC || process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
  const chainId = 5042002;
  const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Missing PRIVATE_KEY in .env");
  }

  const formattedKey = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
  const fetchReq = new ethers.FetchRequest(rpcUrl);
  fetchReq.timeout = 45000;

  const network = { chainId, name: "Arc Testnet" };
  const provider = new ethers.JsonRpcProvider(fetchReq, network, { staticNetwork: true, batchMaxCount: 1 });
  const wallet = new ethers.Wallet(formattedKey, provider);

  console.log("Broadcaster Wallet:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Arc Native USDC Gas Balance:", ethers.formatUnits(balance, 18), "USDC");

  const manifestPath = path.join(__dirname, "../deployments/arc-testnet-live.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const vaultAddress = manifest.contracts.PolicyVault;
  const mockUsdcAddress = manifest.contracts.MockUSDC;

  console.log("PolicyVault Address:", vaultAddress);
  console.log("MockUSDC Address:", mockUsdcAddress);

  // Contract ABIs
  const vaultAbi = [
    "function owner() view returns (address)",
    "function supervisor() view returns (address)",
    "function setRecipientWhitelist(address recipient, bool allowed) external",
    "function setAgentPolicy(address agent, bool isAuthorized, uint256 dailyLimit, uint256 perTxLimit, uint256 approvalThreshold, bool whitelistOnly) external",
    "function executeSpend(address recipient, uint256 amount, string calldata purpose, bytes32 taskHash, bytes calldata supervisorSig) external returns (bytes32)",
    "function spendNonce() view returns (uint256)",
    "function paused() view returns (bool)"
  ];

  const usdcAbi = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)"
  ];

  const vault = new ethers.Contract(vaultAddress, vaultAbi, wallet);
  const usdc = new ethers.Contract(mockUsdcAddress, usdcAbi, wallet);

  // Check vault USDC balance
  let vaultBal = await usdc.balanceOf(vaultAddress);
  console.log("Vault MockUSDC Balance:", ethers.formatUnits(vaultBal, 6), "USDC");

  if (vaultBal < ethers.parseUnits("50", 6)) {
    console.log("Minting 1,000 MockUSDC to PolicyVault...");
    const mintTx = await usdc.mint(vaultAddress, ethers.parseUnits("1000", 6));
    console.log("Mint Tx submitted:", mintTx.hash);
    await mintTx.wait();
    console.log("Mint confirmed!");
  }

  const targetVendor = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  // Ensure whitelist
  console.log("1. Ensuring recipient whitelist on-chain for:", targetVendor);
  const wlTx = await vault.setRecipientWhitelist(targetVendor, true);
  console.log("Whitelist Tx Hash:", wlTx.hash);
  const wlReceipt = await wlTx.wait();
  console.log("Confirmed in Block:", wlReceipt.blockNumber);

  // Ensure agent policy (Daily: $50, PerTx: $10, Threshold: $2, Whitelist: true)
  console.log("2. Setting Agent Policy on-chain...");
  const polTx = await vault.setAgentPolicy(
    wallet.address,
    true,
    ethers.parseUnits("50", 6),
    ethers.parseUnits("10", 6),
    ethers.parseUnits("2", 6),
    true
  );
  console.log("Policy Set Tx Hash:", polTx.hash);
  const polReceipt = await polTx.wait();
  console.log("Confirmed in Block:", polReceipt.blockNumber);

  // Execute Live Tx 1: Autonomous Micro-Payment ($0.25 USDC)
  console.log("3. Executing Live Autonomous Micro-Payment ($0.25 USDC)...");
  const taskHash1 = ethers.keccak256(ethers.toUtf8Bytes("task_deepsearch_academic_api_" + Date.now()));
  const spend1Tx = await vault.executeSpend(
    targetVendor,
    ethers.parseUnits("0.25", 6),
    "DeepSearch Academic API Research Vector Query",
    taskHash1,
    "0x"
  );
  console.log("Autonomous Spend Tx Hash:", spend1Tx.hash);
  const spend1Receipt = await spend1Tx.wait();
  console.log("Confirmed in Block:", spend1Receipt.blockNumber, "Gas Used:", spend1Receipt.gasUsed.toString());

  // Execute Live Tx 2: Supervisor Co-Signed Payment ($3.50 USDC)
  console.log("4. Executing Live Supervisor Co-Signed Payment ($3.50 USDC)...");
  const taskHash2 = ethers.keccak256(ethers.toUtf8Bytes("task_gpu_h100_cluster_lease_" + Date.now()));
  const currentNonce = await vault.spendNonce();
  const amount2 = ethers.parseUnits("3.50", 6);

  // Create EIP-712 / Eth Signed Message hash
  const packedMessage = ethers.solidityPackedKeccak256(
    ["address", "address", "address", "uint256", "bytes32", "uint256", "uint256"],
    [vaultAddress, wallet.address, targetVendor, amount2, taskHash2, currentNonce, chainId]
  );
  const supervisorSignature = await wallet.signMessage(ethers.getBytes(packedMessage));

  const spend2Tx = await vault.executeSpend(
    targetVendor,
    amount2,
    "H100 GPU Cluster On-Demand Micro-Lease",
    taskHash2,
    supervisorSignature
  );
  console.log("Supervisor Co-Signed Spend Tx Hash:", spend2Tx.hash);
  const spend2Receipt = await spend2Tx.wait();
  console.log("Confirmed in Block:", spend2Receipt.blockNumber);

  const freshLiveTxs = {
    generatedAt: new Date().toISOString(),
    network: "Arc Testnet (Circle)",
    chainId,
    contracts: {
      PolicyVault: vaultAddress,
      MockUSDC: mockUsdcAddress
    },
    liveTransactions: [
      {
        id: "TX-LIVE-001",
        type: "AUTONOMOUS",
        purpose: "DeepSearch Academic API Research Vector Query",
        amount: "-$0.25 USDC",
        amountNum: 0.25,
        target: targetVendor,
        txHash: spend1Tx.hash,
        blockNumber: spend1Receipt.blockNumber,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split("T")[0],
        rule: "INV-001 (AUTONOMOUS_APPROVED)",
        explorerUrl: `https://testnet.arcscan.app/tx/${spend1Tx.hash}`
      },
      {
        id: "TX-LIVE-002",
        type: "CO-SIGNED",
        purpose: "H100 GPU Cluster On-Demand Micro-Lease",
        amount: "-$3.50 USDC",
        amountNum: 3.50,
        target: targetVendor,
        txHash: spend2Tx.hash,
        blockNumber: spend2Receipt.blockNumber,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split("T")[0],
        rule: "INV-003 (SUPERVISOR_ECDSA_VERIFIED)",
        explorerUrl: `https://testnet.arcscan.app/tx/${spend2Tx.hash}`
      },
      {
        id: "TX-LIVE-003",
        type: "POLICY_GATE",
        purpose: "Agent Policy Window Synchronized ($50.00 Daily / $10.00 Per-Tx)",
        amount: "0.00 USDC",
        amountNum: 0.00,
        target: wallet.address,
        txHash: polTx.hash,
        blockNumber: polReceipt.blockNumber,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split("T")[0],
        rule: "INV-002 (POLICY_CONFIG)",
        explorerUrl: `https://testnet.arcscan.app/tx/${polTx.hash}`
      },
      {
        id: "TX-LIVE-004",
        type: "SECURITY",
        purpose: "Destination Vendor Whitelist Authorized",
        amount: "0.00 USDC",
        amountNum: 0.00,
        target: targetVendor,
        txHash: wlTx.hash,
        blockNumber: wlReceipt.blockNumber,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split("T")[0],
        rule: "INV-004 (WHITELIST_REGISTERED)",
        explorerUrl: `https://testnet.arcscan.app/tx/${wlTx.hash}`
      }
    ]
  };

  const outputPath = path.join(__dirname, "../deployments/fresh-live-txs.json");
  fs.writeFileSync(outputPath, JSON.stringify(freshLiveTxs, null, 2), "utf8");
  console.log("\n✅ Successfully broadcasted fresh live transactions to Arc Testnet!");
  console.log("Saved live manifest to:", outputPath);
}

main().catch(err => {
  console.error("Broadcast failed:", err);
  process.exit(1);
});
