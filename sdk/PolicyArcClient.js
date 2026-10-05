const { ethers } = require("ethers");

/**
 * @class PolicyArcClient
 * @notice Client SDK for Autonomous AI Agents to interact with PolicyVault on Arc.
 * Enables zero-volatility spending, deterministic policy checks, and verifiable receipts.
 */
class PolicyArcClient {
  constructor({ vaultAddress, usdcAddress, signer, provider }) {
    this.vaultAddress = vaultAddress;
    this.usdcAddress = usdcAddress;
    this.signer = signer;
    this.provider = provider || signer.provider;

    const vaultAbi = [
      "function executeSpend(address recipient, uint256 amount, string calldata purpose, bytes32 taskHash, bytes calldata supervisorSig) external returns (bytes32)",
      "function requestSpendApproval(address recipient, uint256 amount, string calldata purpose, bytes32 taskHash) external returns (uint256)",
      "function approvePendingSpend(uint256 requestId) external",
      "function rejectPendingSpend(uint256 requestId) external",
      "function setEmergencyPause(bool paused) external",
      "function getAgentPolicy(address agent) external view returns (bool isAuthorized, uint256 dailyLimit, uint256 perTxLimit, uint256 approvalThreshold, bool whitelistOnly, uint256 spentToday, uint256 remainingToday)",
      "function whitelistedRecipients(address recipient) external view returns (bool)",
      "function vaultBalance() external view returns (uint256)",
      "function paused() external view returns (bool)",
      "function spendNonce() external view returns (uint256)",
      "event PolicySpendExecuted(uint256 indexed nonce, address indexed agent, address indexed recipient, uint256 amount, string purpose, bytes32 taskHash, uint256 timestamp)",
      "event SpendApprovalRequested(uint256 indexed requestId, address indexed agent, address indexed recipient, uint256 amount, string purpose, bytes32 taskHash)"
    ];

    const usdcAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
      "function faucet(address to, uint256 amount) external"
    ];

    this.vault = new ethers.Contract(vaultAddress, vaultAbi, signer);
    this.usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
  }

  /**
   * Fetches current live policy and spend metrics for the agent
   */
  async getPolicyStatus(agentAddress) {
    const targetAgent = agentAddress || (await this.signer.getAddress());
    const raw = await this.vault.getAgentPolicy(targetAgent);
    return {
      isAuthorized: raw[0],
      dailyLimitUSDC: Number(raw[1]) / 1e6,
      perTxLimitUSDC: Number(raw[2]) / 1e6,
      approvalThresholdUSDC: Number(raw[3]) / 1e6,
      whitelistOnly: raw[4],
      spentTodayUSDC: Number(raw[5]) / 1e6,
      remainingTodayUSDC: Number(raw[6]) / 1e6,
    };
  }

  /**
   * Pre-flight local deterministic validation before touching the network
   */
  async evaluateSpendPolicy(recipient, amountUSDC) {
    const agentAddr = await this.signer.getAddress();
    const policy = await this.getPolicyStatus(agentAddr);

    if (!policy.isAuthorized) {
      return { allowed: false, reason: "Agent address is not authorized on PolicyVault" };
    }
    if (policy.whitelistOnly) {
      const isWhitelisted = await this.vault.whitelistedRecipients(recipient);
      if (!isWhitelisted) {
        return { allowed: false, reason: `Recipient ${recipient} is not on the verified whitelist` };
      }
    }
    if (amountUSDC > policy.perTxLimitUSDC) {
      return {
        allowed: false,
        reason: `Amount (${amountUSDC} USDC) exceeds single per-tx limit of ${policy.perTxLimitUSDC} USDC`
      };
    }
    if (amountUSDC > policy.remainingTodayUSDC) {
      return {
        allowed: false,
        reason: `Amount (${amountUSDC} USDC) exceeds remaining 24h budget of ${policy.remainingTodayUSDC} USDC`
      };
    }

    const requiresApproval = amountUSDC > policy.approvalThresholdUSDC;
    return {
      allowed: true,
      requiresSupervisorApproval: requiresApproval,
      thresholdUSDC: policy.approvalThresholdUSDC
    };
  }

  /**
   * Executes spend directly if within policy limits
   */
  async executeSpend({ recipient, amountUSDC, purpose, taskPayload, supervisorSig = "0x" }) {
    const preflight = await this.evaluateSpendPolicy(recipient, amountUSDC);
    if (!preflight.allowed) {
      throw new Error(`Policy Violation: ${preflight.reason}`);
    }

    const amountUnits = BigInt(Math.round(amountUSDC * 1e6));
    const taskHash = ethers.keccak256(
      ethers.toUtf8Bytes(typeof taskPayload === "string" ? taskPayload : JSON.stringify(taskPayload || {}))
    );

    const tx = await this.vault.executeSpend(recipient, amountUnits, purpose, taskHash, supervisorSig);
    const receipt = await tx.wait();

    // Parse receipt event
    let spendNonce = null;
    let timestamp = null;
    for (const log of receipt.logs) {
      try {
        const parsed = this.vault.interface.parseLog(log);
        if (parsed.name === "PolicySpendExecuted") {
          spendNonce = parsed.args.nonce.toString();
          timestamp = Number(parsed.args.timestamp);
          break;
        }
      } catch (e) {
        // Not a vault event
      }
    }

    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      spendNonce,
      timestamp,
      amountUSDC,
      purpose,
      recipient,
      gasUsedUSDC: (Number(receipt.gasUsed) * 0.000001).toFixed(6), // Arc USDC gas equivalent
      receiptVerificationHash: ethers.keccak256(
        ethers.solidityPacked(
          ["uint256", "address", "address", "uint256", "bytes32"],
          [spendNonce || 0, await this.signer.getAddress(), recipient, amountUnits, taskHash]
        )
      )
    };
  }

  /**
   * Queues an approval request for asynchronous supervisor sign-off
   */
  async requestApproval({ recipient, amountUSDC, purpose, taskPayload }) {
    const amountUnits = BigInt(Math.round(amountUSDC * 1e6));
    const taskHash = ethers.keccak256(
      ethers.toUtf8Bytes(typeof taskPayload === "string" ? taskPayload : JSON.stringify(taskPayload || {}))
    );

    const tx = await this.vault.requestSpendApproval(recipient, amountUnits, purpose, taskHash);
    const receipt = await tx.wait();

    let requestId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = this.vault.interface.parseLog(log);
        if (parsed.name === "SpendApprovalRequested") {
          requestId = parsed.args.requestId.toString();
          break;
        }
      } catch (e) {}
    }

    return {
      success: true,
      requestId,
      txHash: tx.hash,
      status: "PENDING_SUPERVISOR_APPROVAL"
    };
  }
}

module.exports = { PolicyArcClient };
