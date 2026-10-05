const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolicyArc: Enterprise PolicyVault on Arc", function () {
  let mockUSDC, policyVault;
  let owner, agent, supervisor, serviceProvider, rogueTarget;
  const ONE_USDC = 1000000n; // 6 decimals

  beforeEach(async function () {
    [owner, agent, supervisor, serviceProvider, rogueTarget] = await ethers.getSigners();

    // 1. Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy(100000n * ONE_USDC);
    await mockUSDC.waitForDeployment();

    // 2. Deploy PolicyVault
    const PolicyVault = await ethers.getContractFactory("PolicyVault");
    policyVault = await PolicyVault.deploy(await mockUSDC.getAddress(), supervisor.address);
    await policyVault.waitForDeployment();

    // 3. Fund PolicyVault with 1,000 USDC
    await mockUSDC.transfer(await policyVault.getAddress(), 1000n * ONE_USDC);

    // 4. Configure Agent Policy:
    // Daily Limit: 50 USDC
    // Per-Tx Limit: 10 USDC
    // Approval Threshold: 2 USDC (transactions > 2 USDC require supervisor signature)
    // Whitelist Only: true
    await policyVault.setAgentPolicy(
      agent.address,
      true,                // isAuthorized
      50n * ONE_USDC,      // dailyLimit
      10n * ONE_USDC,      // perTxLimit
      2n * ONE_USDC,       // approvalThreshold
      true                 // whitelistOnly
    );

    // 5. Whitelist Service Provider
    await policyVault.setRecipientWhitelist(serviceProvider.address, true);
  });

  describe("Deployment & Vault Initialization", function () {
    it("should initialize with correct USDC balance and supervisor", async function () {
      expect(await policyVault.vaultBalance()).to.equal(1000n * ONE_USDC);
      expect(await policyVault.supervisor()).to.equal(supervisor.address);
      expect(await policyVault.owner()).to.equal(owner.address);
    });

    it("should report accurate agent policy metrics", async function () {
      const policy = await policyVault.getAgentPolicy(agent.address);
      expect(policy.isAuthorized).to.be.true;
      expect(policy.dailyLimit).to.equal(50n * ONE_USDC);
      expect(policy.perTxLimit).to.equal(10n * ONE_USDC);
      expect(policy.approvalThreshold).to.equal(2n * ONE_USDC);
      expect(policy.spentToday).to.equal(0n);
      expect(policy.remainingToday).to.equal(50n * ONE_USDC);
    });
  });

  describe("Scenario 1: Routine Micro-Spend (< Approval Threshold)", function () {
    it("should permit agent to spend 0.25 USDC without human intervention", async function () {
      const spendAmount = 250000n; // 0.25 USDC
      const purpose = "Research API: Semantic Scholar batch query";
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes("task_query_101"));

      const initialProviderBalance = await mockUSDC.balanceOf(serviceProvider.address);

      // Execute from agent signer with empty supervisor signature
      const tx = await policyVault.connect(agent).executeSpend(
        serviceProvider.address,
        spendAmount,
        purpose,
        taskHash,
        "0x"
      );

      await expect(tx)
        .to.emit(policyVault, "PolicySpendExecuted")
        .withArgs(1n, agent.address, serviceProvider.address, spendAmount, purpose, taskHash, (val) => val > 0);

      const finalProviderBalance = await mockUSDC.balanceOf(serviceProvider.address);
      expect(finalProviderBalance - initialProviderBalance).to.equal(spendAmount);

      const policy = await policyVault.getAgentPolicy(agent.address);
      expect(policy.spentToday).to.equal(spendAmount);
      expect(policy.remainingToday).to.equal(50n * ONE_USDC - spendAmount);
    });
  });

  describe("Scenario 2: Spend Exceeding Per-Tx Policy Limit", function () {
    it("should revert if single spend exceeds perTxLimit (10 USDC)", async function () {
      const spendAmount = 15n * ONE_USDC; // 15 USDC > 10 USDC perTxLimit
      const purpose = "Unauthorized Large Compute Lease";
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes("task_oversize"));

      await expect(
        policyVault.connect(agent).executeSpend(
          serviceProvider.address,
          spendAmount,
          purpose,
          taskHash,
          "0x"
        )
      ).to.be.revertedWith("Amount exceeds single per-tx policy limit");
    });
  });

  describe("Scenario 3: Non-Whitelisted Recipient Rejection", function () {
    it("should revert if agent attempts to send to an unauthorized recipient", async function () {
      const spendAmount = 500000n; // 0.50 USDC
      const purpose = "Transfer to unverified address";
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes("task_untrusted"));

      await expect(
        policyVault.connect(agent).executeSpend(
          rogueTarget.address, // Not whitelisted
          spendAmount,
          purpose,
          taskHash,
          "0x"
        )
      ).to.be.revertedWith("Recipient not whitelisted");
    });
  });

  describe("Scenario 4: High-Value Spend with Supervisor Co-Signature", function () {
    it("should revert if spend > 2 USDC has no supervisor signature", async function () {
      const spendAmount = 5n * ONE_USDC; // 5 USDC (within 10 USDC per-tx limit, but > 2 USDC threshold)
      const purpose = "Fine-tuning compute allocation";
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes("task_compute_02"));

      await expect(
        policyVault.connect(agent).executeSpend(
          serviceProvider.address,
          spendAmount,
          purpose,
          taskHash,
          "0x"
        )
      ).to.be.revertedWith("Valid supervisor signature required for amount > threshold");
    });

    it("should succeed when supervisor cryptographically co-signs the spend", async function () {
      const spendAmount = 5n * ONE_USDC;
      const purpose = "Authorized Fine-tuning compute allocation";
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes("task_compute_02"));
      const nonce = await policyVault.spendNonce();
      const chainId = (await ethers.provider.getNetwork()).chainId;

      // Construct the supervisor approval digest matching contract
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "address", "address", "uint256", "bytes32", "uint256", "uint256"],
        [
          await policyVault.getAddress(),
          agent.address,
          serviceProvider.address,
          spendAmount,
          taskHash,
          nonce,
          chainId
        ]
      );

      // Sign with supervisor key
      const signature = await supervisor.signMessage(ethers.getBytes(messageHash));

      // Execute spend with signature
      const tx = await policyVault.connect(agent).executeSpend(
        serviceProvider.address,
        spendAmount,
        purpose,
        taskHash,
        signature
      );

      await expect(tx).to.emit(policyVault, "PolicySpendExecuted");
      expect(await mockUSDC.balanceOf(serviceProvider.address)).to.equal(spendAmount);
    });
  });

  describe("Scenario 5: Asynchronous Request & Approval Flow", function () {
    it("should allow agent to queue a request and supervisor to approve it", async function () {
      const spendAmount = 8n * ONE_USDC;
      const purpose = "Dataset Purchase: ArXiv BioMed Index";
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes("dataset_purchase"));

      // 1. Agent submits request
      const reqTx = await policyVault.connect(agent).requestSpendApproval(
        serviceProvider.address,
        spendAmount,
        purpose,
        taskHash
      );

      await expect(reqTx)
        .to.emit(policyVault, "SpendApprovalRequested")
        .withArgs(1n, agent.address, serviceProvider.address, spendAmount, purpose, taskHash);

      // 2. Supervisor approves the request
      const approveTx = await policyVault.connect(supervisor).approvePendingSpend(1n);

      await expect(approveTx).to.emit(policyVault, "RequestApproved").withArgs(1n, supervisor.address);
      await expect(approveTx).to.emit(policyVault, "PolicySpendExecuted");

      expect(await mockUSDC.balanceOf(serviceProvider.address)).to.equal(spendAmount);
    });
  });

  describe("Scenario 6: Emergency Circuit Breaker", function () {
    it("should freeze all agent operations when paused by owner", async function () {
      await policyVault.connect(owner).setEmergencyPause(true);

      const spendAmount = 100000n; // 0.10 USDC
      const purpose = "Urgent ping";
      const taskHash = ethers.keccak256(ethers.toUtf8Bytes("ping"));

      await expect(
        policyVault.connect(agent).executeSpend(
          serviceProvider.address,
          spendAmount,
          purpose,
          taskHash,
          "0x"
        )
      ).to.be.revertedWith("Vault is paused by emergency circuit breaker");

      // Unpause
      await policyVault.connect(owner).setEmergencyPause(false);
      await expect(
        policyVault.connect(agent).executeSpend(
          serviceProvider.address,
          spendAmount,
          purpose,
          taskHash,
          "0x"
        )
      ).to.emit(policyVault, "PolicySpendExecuted");
    });
  });
});
