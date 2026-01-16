// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {XStrategy} from "./XStrategy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title XStrategyFactory
 * @notice Factory for deploying XStrategy contracts with reputation tracking
 * @dev Manages protocol configuration, operator controls, and on-chain reputation
 */
contract XStrategyFactory is Ownable, Pausable {
    
    // ============== TYPES ==============

    struct CreatorStats {
        uint256 strategiesCreated;
        uint256 strategiesSucceeded;
        uint256 strategiesFailed;
        uint256 totalContributionsReceived;
        uint256 lastActiveTimestamp;
    }

    struct ContributorStats {
        uint256 strategiesBacked;
        uint256 successfulBacks;
        uint256 totalContributed;
        uint256 earlyParticipations; // Backed in first 25% of funding
    }

    // ============== STATE ==============

    address public immutable splitMain;
    address public protocolFeeRecipient;
    address public defaultOperator;
    
    uint256 public protocolFeeBps = 200; // 2%
    uint256 public minCreatorStake = 0.1 ether;

    address[] public allStrategies;
    mapping(address => address[]) public creatorStrategies;
    mapping(address => bool) public isStrategy;
    mapping(address => bool) public isOperator;

    // Reputation tracking
    mapping(address => CreatorStats) public creatorReputation;
    mapping(address => ContributorStats) public contributorReputation;

    // ============== EVENTS ==============

    event StrategyCreated(
        address indexed strategy,
        address indexed strategyCreator,
        address indexed designatedCreator,
        address token,
        uint256 targetAmount,
        uint256 deadline
    );
    
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event DefaultOperatorUpdated(address indexed oldOperator, address indexed newOperator);
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event MinCreatorStakeUpdated(uint256 oldStake, uint256 newStake);
    event CreatorReputationUpdated(address indexed creator, bool success, uint256 contributions);
    event ContributorReputationUpdated(address indexed contributor, bool success, uint256 amount, bool wasEarly);
    event StrategyPaused(address indexed strategy);
    event StrategyUnpaused(address indexed strategy);

    // ============== ERRORS ==============

    error InvalidOperator();
    error InvalidFeeRecipient();
    error FeeTooHigh();
    error NotAStrategy();

    // ============== CONSTRUCTOR ==============

    constructor(
        address _splitMain,
        address _protocolFeeRecipient,
        address _defaultOperator
    ) Ownable(msg.sender) {
        require(_splitMain != address(0), "Invalid splitMain");
        require(_protocolFeeRecipient != address(0), "Invalid fee recipient");
        require(_defaultOperator != address(0), "Invalid operator");

        splitMain = _splitMain;
        protocolFeeRecipient = _protocolFeeRecipient;
        defaultOperator = _defaultOperator;
        isOperator[_defaultOperator] = true;
    }

    // ============== STRATEGY CREATION ==============

    /**
     * @notice Create a new strategy
     * @param token Token address for the strategy
     * @param designatedCreator The creator who will be backed (must opt-in)
     * @param targetAmount Target funding amount in ETH
     * @param deadline Unix timestamp for strategy deadline
     * @param milestoneUnlockBps Array of basis points for each milestone (must sum to 10000)
     * @return strategy Address of the deployed strategy
     */
    function createStrategy(
        address token,
        address designatedCreator,
        uint256 targetAmount,
        uint256 deadline,
        uint32[] calldata milestoneUnlockBps,
        address priceFeed,
        address ethUsdPriceFeed
    ) external whenNotPaused returns (address strategy) {
        require(token != address(0), "Invalid token");
        require(designatedCreator != address(0), "Invalid creator");
        require(targetAmount > 0, "Invalid target");
        require(deadline > block.timestamp, "Invalid deadline");
        require(milestoneUnlockBps.length > 0, "No milestones");

        // Verify milestones sum to 100%
        uint32 totalBps = 0;
        for (uint256 i = 0; i < milestoneUnlockBps.length; i++) {
            totalBps += milestoneUnlockBps[i];
        }
        require(totalBps == 10000, "Milestones must sum to 100%");

        XStrategy newStrategy = new XStrategy(
            msg.sender,           // strategyCreator
            designatedCreator,    // creator to back
            token,
            targetAmount,
            deadline,
            milestoneUnlockBps,
            splitMain,
            defaultOperator,
            priceFeed,
            ethUsdPriceFeed
        );

        strategy = address(newStrategy);
        allStrategies.push(strategy);
        creatorStrategies[designatedCreator].push(strategy);
        isStrategy[strategy] = true;

        // Update creator stats
        creatorReputation[designatedCreator].strategiesCreated++;
        creatorReputation[designatedCreator].lastActiveTimestamp = block.timestamp;

        emit StrategyCreated(
            strategy,
            msg.sender,
            designatedCreator,
            token,
            targetAmount,
            deadline
        );
    }

    // ============== REPUTATION UPDATES ==============

    /**
     * @notice Update creator reputation when strategy completes
     * @dev Only callable by strategy contracts
     */
    function updateCreatorReputation(
        address creator,
        bool success,
        uint256 totalContributions
    ) external {
        if (!isStrategy[msg.sender]) revert NotAStrategy();

        creatorReputation[creator].lastActiveTimestamp = block.timestamp;
        creatorReputation[creator].totalContributionsReceived += totalContributions;
        
        if (success) {
            creatorReputation[creator].strategiesSucceeded++;
        } else {
            creatorReputation[creator].strategiesFailed++;
        }

        emit CreatorReputationUpdated(creator, success, totalContributions);
    }

    /**
     * @notice Update contributor reputation when strategy completes
     * @dev Only callable by strategy contracts
     */
    function updateContributorReputation(
        address contributor,
        bool success,
        uint256 amount,
        bool wasEarly
    ) external {
        if (!isStrategy[msg.sender]) revert NotAStrategy();

        contributorReputation[contributor].strategiesBacked++;
        contributorReputation[contributor].totalContributed += amount;
        
        if (success) {
            contributorReputation[contributor].successfulBacks++;
        }
        
        if (wasEarly) {
            contributorReputation[contributor].earlyParticipations++;
        }

        emit ContributorReputationUpdated(contributor, success, amount, wasEarly);
    }

    // ============== REPUTATION VIEWS ==============

    /**
     * @notice Get creator execution score (0-100)
     */
    function getCreatorScore(address creator) external view returns (uint256 score) {
        CreatorStats memory stats = creatorReputation[creator];
        
        if (stats.strategiesCreated == 0) return 50; // Default score for new creators
        
        uint256 total = stats.strategiesSucceeded + stats.strategiesFailed;
        if (total == 0) return 50;
        
        // Base score from success rate (0-70)
        uint256 baseScore = (stats.strategiesSucceeded * 70) / total;
        
        // Bonus for volume (0-20)
        uint256 volumeBonus = stats.totalContributionsReceived >= 100 ether ? 20 :
            (stats.totalContributionsReceived * 20) / 100 ether;
        
        // Recency bonus (0-10) - active in last 30 days
        uint256 recencyBonus = 0;
        if (block.timestamp - stats.lastActiveTimestamp < 30 days) {
            recencyBonus = 10;
        }
        
        score = baseScore + volumeBonus + recencyBonus;
        if (score > 100) score = 100;
    }

    /**
     * @notice Get contributor accuracy score (0-100)
     */
    function getContributorScore(address contributor) external view returns (uint256 score) {
        ContributorStats memory stats = contributorReputation[contributor];
        
        if (stats.strategiesBacked == 0) return 50; // Default
        
        // Base score from success rate (0-60)
        uint256 baseScore = (stats.successfulBacks * 60) / stats.strategiesBacked;
        
        // Early participation bonus (0-25)
        uint256 earlyBonus = (stats.earlyParticipations * 25) / stats.strategiesBacked;
        
        // Volume bonus (0-15)
        uint256 volumeBonus = stats.totalContributed >= 10 ether ? 15 :
            (stats.totalContributed * 15) / 10 ether;
        
        score = baseScore + earlyBonus + volumeBonus;
        if (score > 100) score = 100;
    }

    /**
     * @notice Get required stake based on creator reputation
     */
    function getRequiredStake(address creator) external view returns (uint256) {
        CreatorStats memory stats = creatorReputation[creator];
        
        // New creators need higher stake
        if (stats.strategiesCreated == 0) {
            return minCreatorStake * 2;
        }
        
        // Failed creators need higher stake
        if (stats.strategiesFailed > stats.strategiesSucceeded) {
            return minCreatorStake * 3;
        }
        
        // Successful creators can use lower stake
        if (stats.strategiesSucceeded >= 3 && stats.strategiesFailed == 0) {
            return minCreatorStake / 2;
        }
        
        return minCreatorStake;
    }

    // ============== OPERATOR MANAGEMENT ==============

    function addOperator(address operator) external onlyOwner {
        if (operator == address(0)) revert InvalidOperator();
        isOperator[operator] = true;
        emit OperatorAdded(operator);
    }

    function removeOperator(address operator) external onlyOwner {
        isOperator[operator] = false;
        emit OperatorRemoved(operator);
    }

    function setDefaultOperator(address newOperator) external onlyOwner {
        if (newOperator == address(0)) revert InvalidOperator();
        address oldOperator = defaultOperator;
        defaultOperator = newOperator;
        isOperator[newOperator] = true;
        emit DefaultOperatorUpdated(oldOperator, newOperator);
    }

    // ============== PROTOCOL CONFIG ==============

    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 1000) revert FeeTooHigh(); // Max 10%
        uint256 oldFee = protocolFeeBps;
        protocolFeeBps = newFeeBps;
        emit ProtocolFeeUpdated(oldFee, newFeeBps);
    }

    function setProtocolFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidFeeRecipient();
        protocolFeeRecipient = newRecipient;
    }

    function setMinCreatorStake(uint256 newMinStake) external onlyOwner {
        uint256 oldStake = minCreatorStake;
        minCreatorStake = newMinStake;
        emit MinCreatorStakeUpdated(oldStake, newMinStake);
    }

    // ============== EMERGENCY CONTROLS ==============

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function pauseStrategy(address strategy) external onlyOwner {
        if (!isStrategy[strategy]) revert NotAStrategy();
        XStrategy(payable(strategy)).pause();
        emit StrategyPaused(strategy);
    }

    function unpauseStrategy(address strategy) external onlyOwner {
        if (!isStrategy[strategy]) revert NotAStrategy();
        XStrategy(payable(strategy)).unpause();
        emit StrategyUnpaused(strategy);
    }

    function updateStrategyOperator(address strategy, address newOperator) external onlyOwner {
        if (!isStrategy[strategy]) revert NotAStrategy();
        if (newOperator == address(0)) revert InvalidOperator();
        XStrategy(payable(strategy)).setOperator(newOperator);
    }

    // ============== VIEWS ==============

    function getStrategiesCount() external view returns (uint256) {
        return allStrategies.length;
    }

    function getCreatorStrategies(address creator) external view returns (address[] memory) {
        return creatorStrategies[creator];
    }

    function getAllStrategies() external view returns (address[] memory) {
        return allStrategies;
    }

    function getStrategiesPaginated(uint256 offset, uint256 limit) external view returns (address[] memory) {
        if (offset >= allStrategies.length) {
            return new address[](0);
        }
        
        uint256 end = offset + limit;
        if (end > allStrategies.length) {
            end = allStrategies.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allStrategies[i];
        }
        return result;
    }
}
