require("dotenv").config();
const { ethers } = require("ethers");

async function checkBalance() {
  const rpcUrl = process.env.ARC_TESTNET_RPC || "https://rpc.testnet.arc.network";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.log("No private key found in .env");
    return;
  }

  const formattedKey = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
  
  const fetchReq = new ethers.FetchRequest(rpcUrl);
  fetchReq.timeout = 30000; // 30 second timeout for reliable network connection
  
  const provider = new ethers.JsonRpcProvider(
    fetchReq, 
    { chainId: 5042002, name: "Arc Testnet" }, 
    { staticNetwork: true, batchMaxCount: 1 }
  );
  
  const wallet = new ethers.Wallet(formattedKey, provider);

  console.log(`Checking balance on Arc Testnet for: ${wallet.address}...`);
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log(`Current Balance: ${ethers.formatUnits(balance, 18)} USDC (Native Gas)`);
    if (balance > 0n) {
      console.log("✅ Wallet is funded! Ready to broadcast contracts.");
    } else {
      console.log("⏳ Balance is 0 USDC.");
    }
  } catch (err) {
    console.log(`RPC query notice: ${err.message}`);
  }
}

checkBalance();
