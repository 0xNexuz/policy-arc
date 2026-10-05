const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

function setupDeployerWallet() {
  const envPath = path.join(__dirname, "../.env");
  let existingContent = "";
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, "utf8");
  }

  // Check if private key already exists
  const hasKey = existingContent.split("\n").some(line => line.startsWith("PRIVATE_KEY=") && line.trim().length > 30 && !line.includes("your_funded_testnet"));

  let wallet;
  if (hasKey) {
    const line = existingContent.split("\n").find(l => l.startsWith("PRIVATE_KEY="));
    const pk = line.split("=")[1].trim();
    const formatted = pk.startsWith("0x") ? pk : "0x" + pk;
    wallet = new ethers.Wallet(formatted);
    console.log("Existing dedicated deployer wallet found in .env!\n");
  } else {
    // Generate fresh dedicated testnet wallet
    wallet = ethers.Wallet.createRandom();
    const envLines = [
      "# Arc Testnet Configuration (Circle L1)",
      "ARC_TESTNET_RPC=https://testnet-rpc.arc.circle.com",
      `PRIVATE_KEY=${wallet.privateKey}`,
      ""
    ];
    fs.writeFileSync(envPath, envLines.join("\n"));
    console.log("✅ Generated a fresh dedicated testnet deployer wallet and securely saved private key to local .env\n");
  }

  console.log("==================================================================");
  console.log("             ◬ POLICYARC: DEDICATED DEPLOYER ADDRESS              ");
  console.log("==================================================================");
  console.log(`Public Address to Fund: ${wallet.address}`);
  console.log("==================================================================\n");
  console.log("Where to fund:");
  console.log("1. Open the Circle Testnet Faucet: https://faucet.circle.com/");
  console.log("2. Select Network: 'Arc Testnet'");
  console.log(`3. Paste Address : ${wallet.address}`);
  console.log("4. Request 10 USDC\n");
  console.log("Once funded, tell me or run 'npm run deploy:live' to broadcast the contracts!");
}

setupDeployerWallet();
