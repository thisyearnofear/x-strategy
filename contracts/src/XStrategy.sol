// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ISplitMain} from "./interfaces/ISplitMain.sol";

interface IXStrategyFactory {
    function updateCreatorReputation(address creator, bool success, uint256 totalContributions) external;
}

/**
 * @title XStrategy
 * @notice Outcome-backed capital coordination with automated downside protection
 * @dev Uses 0xSplits for distribution, operator pattern for intent-based swaps
 * 
 * Key Features:
 * - Intent-based token buying (off-chain via 0x API)
 * - Operator pattern for swap execution
 * - Creator opt-in with stake
 * - Milestone-based token unlocking
 * - Automated unwind on failure
 * - Signal stream staking hooks
 * - 0xSplits for trustless distribution
 */
contract XStrategy is ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============== TYPES ==============

    enum Status {
        PENDING_CREATOR,    // Waiting for creator opt-in
        ACTIVE,             // Accepting contributions
        COMPLETED_SUCCESS,  // All milestones completed
        COMPLETED_FAILURE,  // Failed, stake slashed
        UNWINDING          // Cooldown before refund
    }

    enum CreatorStatus {
        PENDING,
        OPTED_IN,
        REJECTED
    }

    struct Milestone {
        bytes32 proofHash;
        uint32 unlockBps;    // basis points (10000 = 100%)
        bool completed;
    }

    struct ContributorInfo {
        uint256 ethContributed;
        uint256 tokensOwed;
        bool hasWithdrawn;
    }

    // ============== IMMUTABLES ==============

    address public immutable factory;
    address public immutable strategyCreator;     // Who created the strategy
    address public immutable designatedCreator;   // The creator being backed (can opt-in)
    IERC20 public immutable token;
    uint256 public immutable targetAmount;
    uint256 public immutable deadline;
    ISplitMain public immutable splitMain;

    // ============== CONSTANTS ==============

    uint32 public constant PROTOCOL_FEE_BPS = 200;     // 2%
    uint32 public constant SLIPPAGE_BPS = 500;         // 5%
    uint32 public constant COOLDOWN = 24 hours;
    uint256 public constant MIN_CONTRIBUTION = 0.001 ether;
    uint256 public constant MAX_CONTRIBUTORS = 100;    // Gas limit for splits
    uint256 public constant MIN_CREATOR_STAKE = 0.1 ether;
    uint256 public constant PENDING_CONTRIBUTION_TIMEOUT = 1 hours;

    // ============== STATE ==============

    Status public status;
    CreatorStatus public creatorStatus;
    uint256 public creatorStake;
    uint256 public totalContributed;
    uint256 public totalTokensHeld;
    address public splitAddress;
    address public operator;  // Backend wallet that executes swaps

    Milestone[] public milestones;
    mapping(address => ContributorInfo) public contributors;
    address[] public contributorList;

    // Pending contributions (before swap confirmation)
    mapping(address => uint256) public pendingContributions;
    mapping(address => uint256) public pendingTimestamp;

    // Signal stream staking
    mapping(address => uint256) public stakedTokens;
    mapping(address => uint256) public stakeTimestamp;

    uint256 public unwindInitiatedAt;

    // ============== EVENTS ==============

    event ContributionPending(address indexed contributor, uint256 amount);
    event ContributionConfirmed(address indexed contributor, uint256 ethAmount, uint256 tokensReceived);
    event ContributionRefunded(address indexed contributor, uint256 amount);
    event CreatorOptedIn(address indexed creator, uint256 stakeAmount);
    event CreatorRejected(address indexed creator);
    event MilestoneCompleted(uint256 indexed milestoneId, bytes32 proofHash);
    event StrategyCompleted(bool success);
    event UnwindInitiated(uint256 timestamp);
    event SplitCreated(address splitAddress);
    event TokensStaked(address indexed contributor, uint256 amount);
    event TokensUnstaked(address indexed contributor, uint256 amount);
    event OperatorUpdated(address indexed oldOperator, address indexed newOperator);

    // ============== ERRORS ==============

    error NotActive();
    error DeadlinePassed();
    error OnlyCreator();
    error OnlyOperator();
    error OnlyFactory();
    error InvalidMilestone();
    error AlreadyCompleted();
    error CooldownActive();
    error InvalidStatus();
    error BelowMinimum();
    error MaxContributorsReached();
    error NoPendingContribution();
    error PendingContributionTimeout();
    error InvalidAmount();
    error SlippageExceeded();
    error NotContributor();
    error AlreadyWithdrawn();
    error NoTokensToWithdraw();
    error CreatorAlreadyResponded();
    error NotDesignatedCreator();
    error InsufficientStake();

    // ============== MODIFIERS ==============

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }

    modifier onlyOperator() {
        if (msg.sender != operator) revert OnlyOperator();
        _;
    }

    modifier onlyDesignatedCreator() {
        if (msg.sender != designatedCreator) revert NotDesignatedCreator();
        _;
    }

    // ============== CONSTRUCTOR ==============

    constructor(
        address _strategyCreator,
        address _designatedCreator,
        address _token,
        uint256 _targetAmount,
        uint256 _deadline,
        uint32[] memory _milestoneUnlockBps,
        address _splitMain,
        address _operator
    ) {
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_token != address(0), "Invalid token");
        require(_operator != address(0), "Invalid operator");
        require(_designatedCreator != address(0), "Invalid creator");

        factory = msg.sender;
        strategyCreator = _strategyCreator;
        designatedCreator = _designatedCreator;
        token = IERC20(_token);
        targetAmount = _targetAmount;
        deadline = _deadline;
        splitMain = ISplitMain(_splitMain);
        operator = _operator;
        
        // Start in pending state - waiting for creator opt-in
        status = Status.PENDING_CREATOR;
        creatorStatus = CreatorStatus.PENDING;

        // Initialize milestones
        uint32 totalBps = 0;
        for (uint256 i = 0; i < _milestoneUnlockBps.length; i++) {
            milestones.push(Milestone({
                proofHash: bytes32(0),
                unlockBps: _milestoneUnlockBps[i],
                completed: false
            }));
            totalBps += _milestoneUnlockBps[i];
        }
        require(totalBps == 10000, "Milestones must sum to 100%");
    }

    // ============== CREATOR OPT-IN ==============

    /**
     * @notice Creator opts into the strategy by posting stake
     * @dev Must be called by designated creator with minimum stake
     */
    function optIn() external payable nonReentrant onlyDesignatedCreator {
        if (creatorStatus != CreatorStatus.PENDING) revert CreatorAlreadyResponded();
        if (msg.value < MIN_CREATOR_STAKE) revert InsufficientStake();

        creatorStatus = CreatorStatus.OPTED_IN;
        creatorStake = msg.value;
        status = Status.ACTIVE;

        emit CreatorOptedIn(msg.sender, msg.value);
    }

    /**
     * @notice Creator rejects the strategy
     */
    function rejectStrategy() external onlyDesignatedCreator {
        if (creatorStatus != CreatorStatus.PENDING) revert CreatorAlreadyResponded();

        creatorStatus = CreatorStatus.REJECTED;
        status = Status.COMPLETED_FAILURE;

        // Refund any pending contributions
        _refundAllPending();

        emit CreatorRejected(msg.sender);
    }

    // ============== CONTRIBUTION ==============

    /**
     * @notice Contribute ETH to the strategy (pending until swap confirmed)
     * @dev Creates pending contribution, operator must confirm via confirmSwap
     */
    function contribute() external payable nonReentrant whenNotPaused {
        if (status != Status.ACTIVE) revert NotActive();
        if (block.timestamp >= deadline) revert DeadlinePassed();
        if (msg.value < MIN_CONTRIBUTION) revert BelowMinimum();
        
        // Check max contributors (only if new contributor)
        if (contributors[msg.sender].ethContributed == 0 && 
            pendingContributions[msg.sender] == 0 &&
            contributorList.length >= MAX_CONTRIBUTORS) {
            revert MaxContributorsReached();
        }

        pendingContributions[msg.sender] += msg.value;
        pendingTimestamp[msg.sender] = block.timestamp;

        emit ContributionPending(msg.sender, msg.value);
    }

    /**
     * @notice Operator confirms swap was executed
     * @param contributor Address of the contributor
     * @param ethAmount Amount of ETH used in swap
     * @param tokensReceived Amount of tokens received from swap
     * @param minExpected Minimum expected tokens (slippage protection)
     */
    function confirmSwap(
        address contributor,
        uint256 ethAmount,
        uint256 tokensReceived,
        uint256 minExpected
    ) external nonReentrant onlyOperator {
        if (status != Status.ACTIVE) revert NotActive();
        if (pendingContributions[contributor] < ethAmount) revert InvalidAmount();
        if (tokensReceived < minExpected) revert SlippageExceeded();

        pendingContributions[contributor] -= ethAmount;

        // Add to contributor list if new
        if (contributors[contributor].ethContributed == 0) {
            contributorList.push(contributor);
        }

        contributors[contributor].ethContributed += ethAmount;
        contributors[contributor].tokensOwed += tokensReceived;
        totalContributed += ethAmount;
        totalTokensHeld += tokensReceived;

        // Refund ETH to operator (who paid for the swap)
        (bool sent,) = msg.sender.call{value: ethAmount}("");
        require(sent, "Operator payment failed");

        emit ContributionConfirmed(contributor, ethAmount, tokensReceived);
    }

    /**
     * @notice Receive tokens from operator after swap
     * @param amount Amount of tokens being deposited
     */
    function receiveTokens(uint256 amount) external onlyOperator {
        token.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Refund pending contribution if not confirmed within timeout
     */
    function refundPendingContribution() external nonReentrant {
        uint256 pending = pendingContributions[msg.sender];
        if (pending == 0) revert NoPendingContribution();
        
        // Can only refund after timeout OR if strategy is not active
        if (status == Status.ACTIVE && 
            block.timestamp < pendingTimestamp[msg.sender] + PENDING_CONTRIBUTION_TIMEOUT) {
            revert PendingContributionTimeout();
        }

        pendingContributions[msg.sender] = 0;
        pendingTimestamp[msg.sender] = 0;

        (bool sent,) = msg.sender.call{value: pending}("");
        require(sent, "Refund failed");

        emit ContributionRefunded(msg.sender, pending);
    }

    // ============== MILESTONES ==============

    /**
     * @notice Complete a milestone with proof
     * @param milestoneId Index of milestone to complete
     * @param proofHash IPFS hash or transaction hash as proof
     */
    function completeMilestone(uint256 milestoneId, bytes32 proofHash) external onlyDesignatedCreator {
        if (status != Status.ACTIVE) revert NotActive();
        if (milestoneId >= milestones.length) revert InvalidMilestone();
        if (milestones[milestoneId].completed) revert AlreadyCompleted();

        milestones[milestoneId].completed = true;
        milestones[milestoneId].proofHash = proofHash;

        emit MilestoneCompleted(milestoneId, proofHash);

        // Check if all complete
        if (_allMilestonesComplete()) {
            _completeStrategy(true);
        }
    }

    function _allMilestonesComplete() internal view returns (bool) {
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].completed) return false;
        }
        return true;
    }

    // ============== COMPLETION ==============

    function _completeStrategy(bool success) internal {
        _createSplit();
        _completeStrategyInternal(success);
    }

    function _completeStrategyInternal(bool success) internal {
        status = success ? Status.COMPLETED_SUCCESS : Status.COMPLETED_FAILURE;

        if (success) {
            // Return stake to creator
            uint256 totalReturn = creatorStake;
            
            if (totalReturn > 0) {
                (bool sent,) = designatedCreator.call{value: totalReturn}("");
                require(sent, "Stake return failed");
            }

            // Transfer tokens to split for distribution
            if (totalTokensHeld > 0) {
                token.safeTransfer(splitAddress, totalTokensHeld);
            }
        } else {
            // Slash 50% of stake, distribute to contributors
            uint256 toContributors = creatorStake / 2;
            uint256 toBurn = creatorStake - toContributors;

            // Transfer tokens to split for refund distribution
            if (totalTokensHeld > 0) {
                token.safeTransfer(splitAddress, totalTokensHeld);
            }

            // Send slashed stake to split
            if (toContributors > 0 && splitAddress != address(0)) {
                (bool sent,) = splitAddress.call{value: toContributors}("");
                require(sent, "Stake distribution failed");
            }

            // Burn remainder
            if (toBurn > 0) {
                (bool sent,) = address(0xdead).call{value: toBurn}("");
                // Don't require - dead address might reject
            }
        }

        // Update Creator Reputation
        IXStrategyFactory(factory).updateCreatorReputation(
            designatedCreator, 
            success, 
            totalContributed
        );

        emit StrategyCompleted(success);
    }

    function _createSplit() internal {
        if (contributorList.length == 0) {
            // No contributors, no split needed
            return;
        }

        // Build arrays and sort by address (0xSplits requirement)
        (address[] memory accounts, uint32[] memory percentAllocations) = _buildSortedSplitArrays();

        // Create immutable split
        splitAddress = splitMain.createSplit(
            accounts,
            percentAllocations,
            0, // No distributor fee
            address(0) // Immutable
        );

        emit SplitCreated(splitAddress);
    }

    function _buildSortedSplitArrays() internal view returns (address[] memory, uint32[] memory) {
        uint256 length = contributorList.length;
        address[] memory accounts = new address[](length);
        uint32[] memory percentAllocations = new uint32[](length);
        uint32 totalAllocated = 0;

        // Copy and calculate allocations
        for (uint256 i = 0; i < length; i++) {
            accounts[i] = contributorList[i];
            uint32 allocation = uint32(
                (contributors[contributorList[i]].ethContributed * 1e6) / totalContributed
            );
            percentAllocations[i] = allocation;
            totalAllocated += allocation;
        }

        // Add rounding remainder to largest contributor
        if (totalAllocated < 1e6 && length > 0) {
            uint256 largestIndex = 0;
            uint256 largestContribution = 0;
            for (uint256 i = 0; i < length; i++) {
                if (contributors[accounts[i]].ethContributed > largestContribution) {
                    largestContribution = contributors[accounts[i]].ethContributed;
                    largestIndex = i;
                }
            }
            percentAllocations[largestIndex] += uint32(1e6 - totalAllocated);
        }

        // Sort by address (bubble sort - ok for small arrays)
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (accounts[j] > accounts[j + 1]) {
                    // Swap accounts
                    address tempAddr = accounts[j];
                    accounts[j] = accounts[j + 1];
                    accounts[j + 1] = tempAddr;
                    // Swap allocations
                    uint32 tempAlloc = percentAllocations[j];
                    percentAllocations[j] = percentAllocations[j + 1];
                    percentAllocations[j + 1] = tempAlloc;
                }
            }
        }

        return (accounts, percentAllocations);
    }

    // ============== AUTO-UNWIND ==============

    /**
     * @notice Initiate unwind after deadline if milestones incomplete
     */
    function initiateUnwind() external {
        require(block.timestamp >= deadline, "Deadline not reached");
        if (status != Status.ACTIVE) revert InvalidStatus();
        require(!_allMilestonesComplete(), "Strategy succeeded");

        status = Status.UNWINDING;
        unwindInitiatedAt = block.timestamp;

        emit UnwindInitiated(block.timestamp);
    }

    /**
     * @notice Execute unwind after cooldown period
     */
    function executeUnwind() external nonReentrant {
        if (status != Status.UNWINDING) revert InvalidStatus();
        if (block.timestamp < unwindInitiatedAt + COOLDOWN) revert CooldownActive();

        // Create split first
        _createSplit();

        // Transfer tokens to split
        if (totalTokensHeld > 0 && splitAddress != address(0)) {
            token.safeTransfer(splitAddress, totalTokensHeld);
        }

        // Complete without creating split again
        _completeStrategyInternal(false);
    }

    // ============== SIGNAL STREAM STAKING ==============

    /**
     * @notice Stake tokens to access signal streams
     * @param amount Amount of tokens to stake
     */
    function stakeForSignals(uint256 amount) external nonReentrant {
        if (status != Status.COMPLETED_SUCCESS) revert InvalidStatus();
        if (contributors[msg.sender].ethContributed == 0) revert NotContributor();

        token.safeTransferFrom(msg.sender, address(this), amount);
        stakedTokens[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;

        emit TokensStaked(msg.sender, amount);
    }

    /**
     * @notice Unstake tokens from signal streams
     * @param amount Amount to unstake
     */
    function unstakeTokens(uint256 amount) external nonReentrant {
        require(stakedTokens[msg.sender] >= amount, "Insufficient staked");

        stakedTokens[msg.sender] -= amount;
        token.safeTransfer(msg.sender, amount);

        emit TokensUnstaked(msg.sender, amount);
    }

    /**
     * @notice Check signal access tier for a contributor
     * @return hasAccess Whether contributor has signal access
     * @return tier Access tier (0=none, 1=basic, 2=standard, 3=premium)
     */
    function getSignalAccess(address contributor) external view returns (bool hasAccess, uint256 tier) {
        if (stakedTokens[contributor] == 0) return (false, 0);

        uint256 stakeDuration = block.timestamp - stakeTimestamp[contributor];
        uint256 stakeAmount = stakedTokens[contributor];

        // Tier based on stake amount and duration
        if (stakeAmount >= 10000e18 && stakeDuration >= 30 days) {
            return (true, 3); // Premium
        } else if (stakeAmount >= 1000e18 && stakeDuration >= 7 days) {
            return (true, 2); // Standard
        } else if (stakeAmount >= 100e18) {
            return (true, 1); // Basic
        }
        return (false, 0);
    }

    // ============== DISTRIBUTION ==============

    /**
     * @notice Trigger distribution via 0xSplit
     */
    function distribute() external {
        require(splitAddress != address(0), "No split created");
        require(
            status == Status.COMPLETED_SUCCESS || status == Status.COMPLETED_FAILURE,
            "Not completed"
        );

        // Get list of accounts for distribution
        (address[] memory accounts, uint32[] memory percentAllocations) = _buildSortedSplitArrays();

        // Distribute via 0xSplits
        splitMain.distributeERC20(
            splitAddress,
            token,
            accounts,
            percentAllocations,
            0, // No distributor fee
            address(0)
        );
    }

    // ============== ADMIN ==============

    /**
     * @notice Update operator address (factory only)
     */
    function setOperator(address newOperator) external onlyFactory {
        require(newOperator != address(0), "Invalid operator");
        address oldOperator = operator;
        operator = newOperator;
        emit OperatorUpdated(oldOperator, newOperator);
    }

    /**
     * @notice Pause strategy (factory only, emergency)
     */
    function pause() external onlyFactory {
        _pause();
    }

    /**
     * @notice Unpause strategy (factory only)
     */
    function unpause() external onlyFactory {
        _unpause();
    }

    // ============== INTERNAL HELPERS ==============

    function _refundAllPending() internal {
        for (uint256 i = 0; i < contributorList.length; i++) {
            address contributor = contributorList[i];
            uint256 pending = pendingContributions[contributor];
            if (pending > 0) {
                pendingContributions[contributor] = 0;
                (bool sent,) = contributor.call{value: pending}("");
                if (sent) {
                    emit ContributionRefunded(contributor, pending);
                }
            }
        }
    }

    // ============== VIEWS ==============

    function getContributors() external view returns (address[] memory) {
        return contributorList;
    }

    function getMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    function getProgress() external view returns (uint256 completed, uint256 total) {
        total = milestones.length;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].completed) completed++;
        }
    }

    function getFundingProgress() external view returns (uint256 current, uint256 target, uint256 percentage) {
        current = totalContributed;
        target = targetAmount;
        percentage = target > 0 ? (current * 100) / target : 0;
    }

    function getContributorInfo(address contributor) external view returns (
        uint256 ethContributed,
        uint256 tokensOwed,
        uint256 pendingAmount,
        bool hasWithdrawn
    ) {
        ContributorInfo memory info = contributors[contributor];
        return (
            info.ethContributed,
            info.tokensOwed,
            pendingContributions[contributor],
            info.hasWithdrawn
        );
    }

    function getStrategyInfo() external view returns (
        Status currentStatus,
        CreatorStatus currentCreatorStatus,
        uint256 currentCreatorStake,
        uint256 currentTotalContributed,
        uint256 currentTotalTokens,
        uint256 contributorCount,
        uint256 timeRemaining
    ) {
        return (
            status,
            creatorStatus,
            creatorStake,
            totalContributed,
            totalTokensHeld,
            contributorList.length,
            block.timestamp >= deadline ? 0 : deadline - block.timestamp
        );
    }

    // ============== RECEIVE ==============

    receive() external payable {
        // Accept ETH for stake bonus distribution
    }
}
