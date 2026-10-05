require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      gasPrice: 1000000000, // 1 gwei
    },
    arcSimulated: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: [
        // Standard test private keys for local node
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Owner / Deployer
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Agent
        "0x5de4111afa1a4b94908f83103eb2f958080a1564f830aab45a2cda1107813601", // Supervisor
        "0xdf57089feb34744236b64b4b755767c75683a524f28522ee647e44e0ce3e248e", // Service Provider A (API)
        "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544"  // Service Provider B
      ]
    },
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC || "https://testnet-rpc.arc.circle.com",
      chainId: 5042002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
