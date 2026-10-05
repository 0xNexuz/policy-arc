// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title PolicyVault
 * @notice Enterprise-grade deterministic spending vault for autonomous AI agents on Arc.
 * Enforces per-transaction limits, daily budgets, whitelisting, and human approval thresholds.
 * All balances, budgets, limits, and gas accounting are denominated strictly in USDC (6 decimals).
 */
contract PolicyVault {
    address public owner;
    address public supervisor;
    IERC20 public immutable usdc;

    bool public paused;
    uint256 public spendNonce;
    uint256 public requestCounter;

    struct AgentPolicy {
        bool isAuthorized;
        uint256 dailyLimit;         // Maximum USDC spend per 24h (6 decimals)
        uint256 perTxLimit;         // Maximum single spend without rejection
        uint256 approvalThreshold;  // Amounts above this require human supervisor signature/approval
        bool whitelistOnly;         // If true, only whitelisted recipients are allowed
        uint256 spentToday;         // Accumulated spend in current 24h window
        uint256 lastResetTimestamp; // Last time spentToday was reset
    }

    struct PendingRequest {
        uint256 id;
        address agent;
        address recipient;
        uint256 amount;
        string purpose;
        bytes32 taskHash;
        uint256 timestamp;
        bool executed;
        bool rejected;
    }

    mapping(address => AgentPolicy) public agentPolicies;
    mapping(address => bool) public whitelistedRecipients;
    mapping(uint256 => PendingRequest) public pendingRequests;

    // Events
    event PolicyUpdated(address indexed agent, uint256 dailyLimit, uint256 perTxLimit, uint256 approvalThreshold, bool whitelistOnly);
    event RecipientWhitelisted(address indexed recipient, bool allowed);
    event PolicySpendExecuted(
        uint256 indexed nonce,
        address indexed agent,
        address indexed recipient,
        uint256 amount,
        string purpose,
        bytes32 taskHash,
        uint256 timestamp
    );
    event SpendApprovalRequested(
        uint256 indexed requestId,
        address indexed agent,
        address indexed recipient,
        uint256 amount,
        string purpose,
        bytes32 taskHash
    );
    event RequestApproved(uint256 indexed requestId, address indexed supervisor);
    event RequestRejected(uint256 indexed requestId, address indexed supervisor);
    event EmergencyPauseToggled(bool isPaused);
    event SupervisorUpdated(address indexed previousSupervisor, address indexed newSupervisor);
    event VaultFunded(address indexed funder, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner permitted");
        _;
    }

    modifier onlySupervisorOrOwner() {
        require(msg.sender == supervisor || msg.sender == owner, "Only supervisor or owner permitted");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Vault is paused by emergency circuit breaker");
        _;
    }

    constructor(address _usdcToken, address _supervisor) {
        require(_usdcToken != address(0), "Invalid USDC address");
        owner = msg.sender;
        supervisor = _supervisor == address(0) ? msg.sender : _supervisor;
        usdc = IERC20(_usdcToken);
    }

    function setSupervisor(address _newSupervisor) external onlyOwner {
        require(_newSupervisor != address(0), "Invalid supervisor");
        emit SupervisorUpdated(supervisor, _newSupervisor);
        supervisor = _newSupervisor;
    }

    function setEmergencyPause(bool _paused) external onlyOwner {
        paused = _paused;
        emit EmergencyPauseToggled(_paused);
    }

    function setRecipientWhitelist(address recipient, bool allowed) external onlyOwner {
        whitelistedRecipients[recipient] = allowed;
        emit RecipientWhitelisted(recipient, allowed);
    }

    function setAgentPolicy(
        address agent,
        bool isAuthorized,
        uint256 dailyLimit,
        uint256 perTxLimit,
        uint256 approvalThreshold,
        bool whitelistOnly
    ) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        require(approvalThreshold <= perTxLimit, "Threshold must be <= perTxLimit");

        AgentPolicy storage p = agentPolicies[agent];
        p.isAuthorized = isAuthorized;
        p.dailyLimit = dailyLimit;
        p.perTxLimit = perTxLimit;
        p.approvalThreshold = approvalThreshold;
        p.whitelistOnly = whitelistOnly;
        if (p.lastResetTimestamp == 0) {
            p.lastResetTimestamp = block.timestamp;
        }

        emit PolicyUpdated(agent, dailyLimit, perTxLimit, approvalThreshold, whitelistOnly);
    }

    /**
     * @notice Checks and refreshes 24-hour rolling window for an agent
     */
    function _refreshDailyLimit(AgentPolicy storage policy) internal {
        if (block.timestamp >= policy.lastResetTimestamp + 1 days) {
            policy.spentToday = 0;
            policy.lastResetTimestamp = block.timestamp;
        }
    }

    /**
     * @notice Direct execution by an authorized agent within policy bounds.
     * If the amount exceeds approvalThreshold, an off-chain supervisor signature is required.
     */
    function executeSpend(
        address recipient,
        uint256 amount,
        string calldata purpose,
        bytes32 taskHash,
        bytes calldata supervisorSig
    ) external whenNotPaused returns (bytes32 receiptHash) {
        address agent = msg.sender;
        AgentPolicy storage policy = agentPolicies[agent];

        require(policy.isAuthorized, "Agent is not authorized");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than zero");

        if (policy.whitelistOnly) {
            require(whitelistedRecipients[recipient], "Recipient not whitelisted");
        }

        require(amount <= policy.perTxLimit, "Amount exceeds single per-tx policy limit");

        _refreshDailyLimit(policy);
        require(policy.spentToday + amount <= policy.dailyLimit, "Amount exceeds 24-hour daily policy budget");

        // Check if supervisor co-signature is required
        if (amount > policy.approvalThreshold) {
            require(supervisorSig.length == 65, "Valid supervisor signature required for amount > threshold");
            bytes32 messageHash = keccak256(
                abi.encodePacked(address(this), agent, recipient, amount, taskHash, spendNonce, block.chainid)
            );
            bytes32 ethSignedMessageHash = keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
            );
            address recoveredSigner = _recoverSigner(ethSignedMessageHash, supervisorSig);
            require(recoveredSigner == supervisor || recoveredSigner == owner, "Invalid supervisor signature");
        }

        // Commit spend
        policy.spentToday += amount;
        spendNonce++;

        require(usdc.transfer(recipient, amount), "USDC transfer failed");

        emit PolicySpendExecuted(spendNonce, agent, recipient, amount, purpose, taskHash, block.timestamp);

        receiptHash = keccak256(
            abi.encodePacked(spendNonce, agent, recipient, amount, taskHash, block.timestamp)
        );
        return receiptHash;
    }

    /**
     * @notice Allows an agent to queue a request for manual human approval when exceeding thresholds
     */
    function requestSpendApproval(
        address recipient,
        uint256 amount,
        string calldata purpose,
        bytes32 taskHash
    ) external whenNotPaused returns (uint256 requestId) {
        address agent = msg.sender;
        AgentPolicy storage policy = agentPolicies[agent];
        require(policy.isAuthorized, "Agent is not authorized");

        requestCounter++;
        requestId = requestCounter;

        pendingRequests[requestId] = PendingRequest({
            id: requestId,
            agent: agent,
            recipient: recipient,
            amount: amount,
            purpose: purpose,
            taskHash: taskHash,
            timestamp: block.timestamp,
            executed: false,
            rejected: false
        });

        emit SpendApprovalRequested(requestId, agent, recipient, amount, purpose, taskHash);
        return requestId;
    }

    /**
     * @notice Supervisor or Owner approves and executes a queued pending spend request
     */
    function approvePendingSpend(uint256 requestId) external onlySupervisorOrOwner whenNotPaused {
        PendingRequest storage req = pendingRequests[requestId];
        require(req.id != 0, "Request does not exist");
        require(!req.executed, "Request already executed");
        require(!req.rejected, "Request was rejected");

        req.executed = true;
        spendNonce++;

        AgentPolicy storage policy = agentPolicies[req.agent];
        _refreshDailyLimit(policy);
        policy.spentToday += req.amount;

        require(usdc.transfer(req.recipient, req.amount), "USDC transfer failed");

        emit RequestApproved(requestId, msg.sender);
        emit PolicySpendExecuted(spendNonce, req.agent, req.recipient, req.amount, req.purpose, req.taskHash, block.timestamp);
    }

    /**
     * @notice Supervisor or Owner rejects a pending spend request
     */
    function rejectPendingSpend(uint256 requestId) external onlySupervisorOrOwner {
        PendingRequest storage req = pendingRequests[requestId];
        require(req.id != 0, "Request does not exist");
        require(!req.executed, "Request already executed");
        require(!req.rejected, "Request already rejected");

        req.rejected = true;
        emit RequestRejected(requestId, msg.sender);
    }

    /**
     * @notice Deposit USDC into the vault to fund agent activity
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Deposit failed");
        emit VaultFunded(msg.sender, amount);
    }

    /**
     * @notice Emergency withdrawal by owner
     */
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid withdrawal address");
        require(usdc.transfer(to, amount), "Withdrawal failed");
        emit FundsWithdrawn(to, amount);
    }

    /**
     * @notice View function for agent policy status
     */
    function getAgentPolicy(address agent) external view returns (
        bool isAuthorized,
        uint256 dailyLimit,
        uint256 perTxLimit,
        uint256 approvalThreshold,
        bool whitelistOnly,
        uint256 spentToday,
        uint256 remainingToday
    ) {
        AgentPolicy memory p = agentPolicies[agent];
        uint256 currentSpent = p.spentToday;
        if (block.timestamp >= p.lastResetTimestamp + 1 days) {
            currentSpent = 0;
        }
        uint256 remaining = p.dailyLimit > currentSpent ? p.dailyLimit - currentSpent : 0;
        return (
            p.isAuthorized,
            p.dailyLimit,
            p.perTxLimit,
            p.approvalThreshold,
            p.whitelistOnly,
            currentSpent,
            remaining
        );
    }

    function vaultBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    // ECDSA recovery helper
    function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_sig);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
