// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {ISplitMain} from "./interfaces/ISplitMain.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

interface IXStrategyFactory {
    function updateCreatorReputation(address creator, bool success, uint256 totalContributions) external;
}

interface IAggregatorV3 {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
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
    using SafeCast for uint256;

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
    uint32 public constant CREATOR_FEE_BPS = 500;      // 5%
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

    // Price feed for slippage validation
    address public priceFeed; // Optional price feed for validation

    // Operator balance tracking to avoid reentrancy issues
    mapping(address => uint256) public operatorBalances;

    // Cached split arrays to avoid duplicate building
    address[] public cachedSplitAccounts;
    uint32[] public cachedSplitAllocations;
    bool public splitArraysCached;

    Milestone[] public milestones;
    mapping(address => ContributorInfo) public contributors;
    address[] public contributorList;

    using EnumerableSet for EnumerableSet.AddressSet;

    // Track addresses with pending contributions to enable batch refunds
    EnumerableSet.AddressSet private _pendingContributors;

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
    event TokensReceived(address indexed operator, uint256 amount);
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
    error NoSplitCreated();
    error EmergencyWithdrawalNotAllowed();
    error InvalidOperator();

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

    address public immutable ethUsdPriceFeed;

    constructor(
        address _strategyCreator,
        address _designatedCreator,
        address _token,
        uint256 _targetAmount,
        uint256 _deadline,
        uint32[] memory _milestoneUnlockBps,
        address _splitMain,
        address _operator,
        address _priceFeed,
        address _ethUsdPriceFeed
    ) {
        if (_deadline <= block.timestamp) revert DeadlinePassed();
        if (_token == address(0)) revert InvalidAmount();
        if (_operator == address(0)) revert InvalidAmount();
        if (_designatedCreator == address(0)) revert NotDesignatedCreator();

        // Validate price feeds if provided
        if (_priceFeed != address(0)) {
            // Check if price feed is a valid Chainlink AggregatorV3 contract
            try IAggregatorV3(_priceFeed).latestRoundData() returns (
                uint80, int256 price, uint256, uint256, uint80
            ) {
                require(price > 0, "Invalid price feed");
            } catch {
                revert InvalidAmount(); // Revert if price feed is invalid
            }
        }

        if (_ethUsdPriceFeed != address(0)) {
            // Check if ETH price feed is a valid Chainlink AggregatorV3 contract
            try IAggregatorV3(_ethUsdPriceFeed).latestRoundData() returns (
                uint80, int256 price, uint256, uint256, uint80
            ) {
                require(price > 0, "Invalid ETH price feed");
            } catch {
                revert InvalidAmount(); // Revert if ETH price feed is invalid
            }
        }

        factory = msg.sender;
        strategyCreator = _strategyCreator;
        designatedCreator = _designatedCreator;
        token = IERC20(_token);
        targetAmount = _targetAmount;
        deadline = _deadline;
        splitMain = ISplitMain(_splitMain);
        operator = _operator;
        priceFeed = _priceFeed; // Optional price feed for validation
        ethUsdPriceFeed = _ethUsdPriceFeed; // Optional ETH/USD price feed

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

        // Refund any pending contributions in batches to prevent DOS
        _refundAllPendingBatched();

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

        // Add to pending contributors set if not already there
        if (!_pendingContributors.contains(msg.sender)) {
            _pendingContributors.add(msg.sender);
        }

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
        if (minExpected == 0) revert InvalidAmount();
        if (tokensReceived < minExpected) revert SlippageExceeded();

        // Validate against price feed to prevent operator front-running or receiving poor rates
        uint256 expectedTokens = _getExpectedTokensFromPriceFeed(ethAmount);
        if (expectedTokens > 0) {
            // Calculate minimum allowed tokens based on configured slippage tolerance
            uint256 minAllowedTokens = (expectedTokens * (10000 - SLIPPAGE_BPS)) / 10000;

            // Use the stricter of: minExpected OR price feed validation
            uint256 strictMinimum = minExpected > minAllowedTokens ? minExpected : minAllowedTokens;

            if (tokensReceived < strictMinimum) {
                revert SlippageExceeded(); // Operator received too few tokens for the ETH
            }
        } else {
            // No price feed available - enforce max slippage based on minExpected
            if (tokensReceived < minExpected) {
                revert SlippageExceeded();
            }
        }

        pendingContributions[contributor] -= ethAmount;

        // Add to contributor list if new
        if (contributors[contributor].ethContributed == 0) {
            contributorList.push(contributor);
        }

        contributors[contributor].ethContributed += ethAmount;
        contributors[contributor].tokensOwed += tokensReceived;
        totalContributed += ethAmount;
        totalTokensHeld += tokensReceived;

        // Add to operator balance instead of direct transfer to avoid reentrancy
        operatorBalances[msg.sender] += ethAmount;

        // If this was the last pending contribution from this contributor, remove from pending set
        if (pendingContributions[contributor] == 0 && _pendingContributors.contains(contributor)) {
            _pendingContributors.remove(contributor);
        }

        emit ContributionConfirmed(contributor, ethAmount, tokensReceived);
    }

    /**
     * @notice Internal function to get expected token amount based on price feed
     * @param ethAmount Amount of ETH to convert
     * @return expectedTokens Expected amount of tokens based on market price
     */
    function _getExpectedTokensFromPriceFeed(uint256 ethAmount) internal view returns (uint256 expectedTokens) {
        if (priceFeed == address(0) || ethUsdPriceFeed == address(0)) {
            return 0; // No price feeds, can't validate
        }

        try IAggregatorV3(priceFeed).latestRoundData() returns (
            uint80 roundId,
            int256 tokenPriceInt,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
            // Check if price feed is stale (older than 1 hour)
            if (block.timestamp - updatedAt > 1 hours) {
                return 0; // Price feed is stale
            }

            try IAggregatorV3(ethUsdPriceFeed).latestRoundData() returns (
                uint80 ethRoundId,
                int256 ethPriceInt,
                uint256 ethStartedAt,
                uint256 ethUpdatedAt,
                uint80 ethAnsweredInRound
            ) {
                // Check if ETH price feed is stale (older than 1 hour)
                if (block.timestamp - ethUpdatedAt > 1 hours) {
                    return 0; // ETH price feed is stale
                }

                if (tokenPriceInt <= 0 || ethPriceInt <= 0) {
                    return 0; // Invalid prices
                }

                uint256 tokenPrice = uint256(tokenPriceInt); // Token price in USD
                uint256 ethPrice = uint256(ethPriceInt); // ETH price in USD

                // Get decimals for proper calculation
                uint8 tokenDecimals = IAggregatorV3(priceFeed).decimals();
                uint8 ethDecimals = IAggregatorV3(ethUsdPriceFeed).decimals();

                // Calculate expected tokens: (ethAmount * ethPrice / 10^ethDecimals) / (tokenPrice / 10^tokenDecimals)
                // Simplified: (ethAmount * ethPrice * 10^tokenDecimals) / (tokenPrice * 10^ethDecimals)
                expectedTokens = (ethAmount * ethPrice * (10 ** tokenDecimals)) / (tokenPrice * (10 ** ethDecimals));

                // Adjust for token decimals (assuming token has 18 decimals, adjust if different)
                uint8 tokenContractDecimals = IERC20Metadata(address(token)).decimals();
                if (tokenContractDecimals < 18) {
                    expectedTokens = expectedTokens / (10 ** (18 - tokenContractDecimals));
                } else if (tokenContractDecimals > 18) {
                    expectedTokens = expectedTokens * (10 ** (tokenContractDecimals - 18));
                }
            } catch {
                return 0; // If ETH price feed call fails, can't validate
            }
        } catch {
            return 0; // If token price feed call fails, can't validate
        }
    }


    /**
     * @notice Receive tokens from operator after swap
     * @param amount Amount of tokens being deposited
     */
    function receiveTokens(uint256 amount) external onlyOperator {
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit TokensReceived(msg.sender, amount);
    }

    /**
     * @notice Refund pending contribution if not confirmed within timeout
     */
    function refundPendingContribution() external nonReentrant {
        uint256 pending = pendingContributions[msg.sender];
        if (pending == 0) revert NoPendingContribution();
        
        // Can only refund after timeout OR if strategy is not active/pending creator
        bool canRefund = (status != Status.ACTIVE && status != Status.PENDING_CREATOR) || 
            (block.timestamp >= pendingTimestamp[msg.sender] + PENDING_CONTRIBUTION_TIMEOUT);

        if (!canRefund) {
            revert PendingContributionTimeout();
        }

        pendingContributions[msg.sender] = 0;
        pendingTimestamp[msg.sender] = 0;

        // Remove from pending contributors set if needed
        if (_pendingContributors.contains(msg.sender)) {
            _pendingContributors.remove(msg.sender);
        }

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
        if (status != Status.ACTIVE) revert InvalidStatus(); // Check for UNWINDING status as well
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
        // Ensure split is created before completing
        _createSplit();
        
        // If split creation failed (splitAddress still 0), don't transfer tokens to 0x0
        if (splitAddress == address(0) && totalTokensHeld > 0) {
            // If we can't create a split, leave tokens in contract and allow factory to rescue
            status = success ? Status.COMPLETED_SUCCESS : Status.COMPLETED_FAILURE;
            emit StrategyCompleted(success);
            return;
        }
        
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
                require(splitAddress != address(0), "No split created");
                uint256 creatorFee = (totalTokensHeld * CREATOR_FEE_BPS) / 10000;
                if (creatorFee > 0) {
                    token.safeTransfer(designatedCreator, creatorFee);
                }
                token.safeTransfer(splitAddress, totalTokensHeld - creatorFee);
            }
        } else {
            // Slash 50% of stake, distribute to contributors
            uint256 toContributors = creatorStake / 2;
            uint256 toBurn = creatorStake - toContributors;

            // Transfer tokens to split for refund distribution
            if (totalTokensHeld > 0) {
                if (splitAddress == address(0)) revert NoSplitCreated();
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

        // Create immutable split - this will revert if split creation fails
        splitAddress = splitMain.createSplit(
            accounts,
            percentAllocations,
            0, // No distributor fee
            address(0) // Immutable
        );

        // Verify that split address is valid
        require(splitAddress != address(0), "Split creation failed");
        require(splitAddress != address(this), "Invalid split address");

        // Cache the split arrays for future use
        cachedSplitAccounts = accounts;
        cachedSplitAllocations = percentAllocations;
        splitArraysCached = true;

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
            // Calculate allocation with overflow protection
            uint256 rawAllocation = (contributors[contributorList[i]].ethContributed * 1e6);
            // Check for potential overflow before division
            require(rawAllocation / 1e6 == contributors[contributorList[i]].ethContributed, "Overflow in allocation calc");
            uint256 allocation = rawAllocation / totalContributed;
            require(allocation <= type(uint32).max, "Allocation exceeds uint32 max");
            percentAllocations[i] = SafeCast.toUint32(allocation);
            totalAllocated += SafeCast.toUint32(allocation);
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

        // Sort by address (insertion sort - more efficient than bubble)
        for (uint256 i = 1; i < length; i++) {
            address keyAddr = accounts[i];
            uint32 keyAlloc = percentAllocations[i];
            uint256 j = i;
            while (j > 0 && accounts[j - 1] > keyAddr) {
                accounts[j] = accounts[j - 1];
                percentAllocations[j] = percentAllocations[j - 1];
                j--;
            }
            accounts[j] = keyAddr;
            percentAllocations[j] = keyAlloc;
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

        // Use cached split arrays if available, otherwise build them
        address[] memory accounts;
        uint32[] memory percentAllocations;
        
        if (splitArraysCached) {
            accounts = cachedSplitAccounts;
            percentAllocations = cachedSplitAllocations;
        } else {
            (accounts, percentAllocations) = _buildSortedSplitArrays();
            // Cache them for next time
            cachedSplitAccounts = accounts;
            cachedSplitAllocations = percentAllocations;
            splitArraysCached = true;
        }

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

    /**
     * @notice Allows operator to withdraw their accumulated balance
     */
    function withdrawOperatorBalance() external nonReentrant {
        require(msg.sender == operator, "Only operator can withdraw");
        uint256 amount = operatorBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");

        operatorBalances[msg.sender] = 0;

        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent, "Withdrawal failed");
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

    /**
     * @notice Rescue stuck tokens (factory only)
     */
    function rescueTokens(address _token, uint256 amount) external onlyFactory {
        if (status == Status.ACTIVE && block.timestamp < deadline + 30 days) revert EmergencyWithdrawalNotAllowed();
        IERC20(_token).safeTransfer(factory, amount);
    }

    /**
     * @notice Rescue stuck ETH (factory only)
     */
    function rescueETH(uint256 amount) external onlyFactory {
        if (status == Status.ACTIVE && block.timestamp < deadline + 30 days) revert EmergencyWithdrawalNotAllowed();
        (bool sent,) = factory.call{value: amount}("");
        if (!sent) revert InvalidAmount();
    }

    // ============== BATCH REFUND FUNCTION ==============

    /**
     * @notice Refund pending contributions in batches (callable by anyone)
     * @dev Public function to enable permissionless refund processing after strategy fails
     * @param startIndex Starting index in pending contributors set
     * @param batchSize Maximum number of refunds to process
     */
    function refundPendingBatch(uint256 startIndex, uint256 batchSize) external onlyFactory {
        require(status != Status.ACTIVE && status != Status.PENDING_CREATOR, "Strategy still active");
        _processBatchRefunds(startIndex, batchSize);
    }

    /**
     * @notice Internal function to process batch refunds
     * @param startIndex Starting index in pending contributors set
     * @param batchSize Maximum number of refunds to process
     */
    function _processBatchRefunds(uint256 startIndex, uint256 batchSize) internal {
        uint256 setLength = _pendingContributors.length();
        if (startIndex >= setLength) {
            return; // Nothing to process
        }

        uint256 endIndex = startIndex + batchSize;
        if (endIndex > setLength) {
            endIndex = setLength;
        }

        uint256 processed = 0;

        // Process from the start index
        // We need to be careful because removing elements changes indices
        // So we'll always process from the startIndex position
        while (processed < batchSize && startIndex < _pendingContributors.length()) {
            address contributor = _pendingContributors.at(startIndex);
            uint256 pending = pendingContributions[contributor];
            if (pending > 0) {
                pendingContributions[contributor] = 0;

                // Remove from pending set
                _pendingContributors.remove(contributor);

                (bool sent,) = contributor.call{value: pending}("");
                if (sent) {
                    emit ContributionRefunded(contributor, pending);
                }
                processed++;
                // Don't increment startIndex since we removed an element and the next element is now at the same index
            } else {
                // If no pending contribution, move to next
                startIndex++;
            }
        }
    }

    /**
     * @notice Internal helper to refund all pending contributions in batches
     */
    function _refundAllPendingBatched() internal {
        // Process first batch to kick off refunds
        if (_pendingContributors.length() > 0) {
            _processBatchRefunds(0, 10);
        }
    }

    // ============== RECEIVE ==============

    receive() external payable {
        // Accept ETH for stake bonus distribution
    }
}
