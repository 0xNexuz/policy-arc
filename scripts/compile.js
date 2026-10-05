const fs = require("fs");
const path = require("path");
const solc = require("solc");

function findImports(importPath) {
  return { error: "File not found" };
}

function compileContracts() {
  console.log("Compiling PolicyArc contracts with solc...");

  const contractsDir = path.join(__dirname, "../contracts");
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");

  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const mockUSDCSrc = fs.readFileSync(path.join(contractsDir, "MockUSDC.sol"), "utf8");
  const policyVaultSrc = fs.readFileSync(path.join(contractsDir, "PolicyVault.sol"), "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "MockUSDC.sol": { content: mockUSDCSrc },
      "PolicyVault.sol": { content: policyVaultSrc }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"]
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const error of output.errors) {
      if (error.severity === "error") {
        console.error("Compilation error:", error.formattedMessage);
        hasError = true;
      } else {
        console.warn("Compilation warning:", error.formattedMessage);
      }
    }
    if (hasError) {
      throw new Error("Contract compilation failed");
    }
  }

  // Save artifacts
  const mockUSDCArtifact = {
    contractName: "MockUSDC",
    abi: output.contracts["MockUSDC.sol"]["MockUSDC"].abi,
    bytecode: output.contracts["MockUSDC.sol"]["MockUSDC"].evm.bytecode.object
  };
  fs.writeFileSync(
    path.join(artifactsDir, "MockUSDC.json"),
    JSON.stringify(mockUSDCArtifact, null, 2)
  );

  const policyVaultArtifact = {
    contractName: "PolicyVault",
    abi: output.contracts["PolicyVault.sol"]["PolicyVault"].abi,
    bytecode: output.contracts["PolicyVault.sol"]["PolicyVault"].evm.bytecode.object
  };
  fs.writeFileSync(
    path.join(artifactsDir, "PolicyVault.json"),
    JSON.stringify(policyVaultArtifact, null, 2)
  );

  console.log("✅ Successfully compiled contracts! Artifacts saved to artifacts/contracts/");
}

if (require.main === module) {
  compileContracts();
}

module.exports = { compileContracts };
