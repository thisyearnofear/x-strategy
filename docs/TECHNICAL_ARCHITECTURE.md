# Technical Architecture

## 🏗️ System Architecture

### Core Contract Design

The X-Strategy protocol consists of two primary smart contracts built with minimal custom logic leveraging audited primitives:

#### XStrategyFactory.sol
**Purpose**: Strategy deployment and protocol management
- Deploys new XStrategy contracts
- Maintains creator and contributor reputation tracking
- Manages authorized operators for off-chain swaps
- Emergency controls for pausing strategies

**Key Features**:
```solidity
mapping(address => CreatorStats) public creatorReputation;
mapping(address => ContributorStats) public contributorReputation;

function createStrategy(...) returns (address);
function addOperator(address operator);
function pauseStrategy(address strategy);
```

#### XStrategy.sol
**Purpose**: Individual strategy execution with escrow and milestone management
- Escrows creator stake (refundable on success, slashed on failure)
- Manages ETH contributions and token purchases
- Tracks milestone completion with proof submission
- Implements auto-unwind with 24-hour cooldown
- Uses 0xSplits for gas-efficient token distribution

**Security Features**:
- ReentrancyGuard on all value transfers
- Immutable critical parameters (creator, token, deadline)
- Two-step contribution process for swap protection
- Slippage tolerance enforcement
- Creator opt-in requirement

## 🔄 Contribution Flow

The protocol uses an **Operator-Based Intent** pattern for secure token acquisition:

### 1. User Contribution
```
User → contribute{value: ETH}() → Contract holds ETH
                              → Emits ContributionPending event
```

### 2. Backend Operator Execution
```javascript
// Backend service detects ContributionPending
const quote = await get0xQuote({
  buyToken: STRATEGY_TOKEN,
  sellToken: "ETH",
  sellAmount: amount
});

// Operator executes swap using own capital
await operatorWallet.sendTransaction(quote);

// Deposit tokens and confirm
await tokenContract.approve(strategyAddress, tokensBought);
await strategyContract.confirmSwap(
  contributor,
  amount,
  tokensBought,
  minExpected
);
```

### 3. Settlement
- Contract credits user with token contribution
- Contract refunds ETH to operator
- Result: Strategy holds tokens, user gets credit, operator is capital-neutral

## 🎯 Milestone System

### Creator Workflow
1. **Opt-In**: Creator stakes ETH and accepts strategy responsibility
2. **Milestone Creation**: Define measurable outcomes with deadlines
3. **Progress Submission**: Submit proof hashes for milestone completion
4. **Verification**: Community or automated verification (future)

### Outcomes
**Success Path**:
- Creator receives stake back plus 10% bonus
- Contributors receive unlocked tokens via 0xSplits
- Creator reputation increases

**Failure Path**:
- Creator stake slashed (50% burned, 50% to contributors)
- Auto-unwind initiated with 24-hour cooldown
- Tokens sold and proceeds distributed to contributors

## 🔧 Backend Operator Service

### Architecture
Node.js/TypeScript microservice with three core components:

#### Chain Service
Monitors blockchain for events and manages transaction execution:
- Watches `ContributionPending` events
- Coordinates swap → approve → deposit → confirm flow
- Handles transaction retries and error recovery

#### Swap Service  
Integrates with 0x API for optimal token pricing:
- Fetches quotes for ETH → Token conversions
- Enforces slippage protection (default 5%)
- Handles multiple DEX routing

#### Watcher Service
Discovers and monitors active strategies:
- Scans factory for new deployments
- Tracks strategy status changes
- Manages operator wallet funding

### Security Considerations
- Private key management for operator wallet
- Transaction signing isolation
- Rate limiting for API calls
- Gas price monitoring and optimization

## 📊 Token Economics

### Capital Flow
1. **Contribution**: ETH → Operator buys Tokens → Strategy holds Tokens
2. **Success**: Tokens distributed to contributors + creator bonus
3. **Failure**: Tokens sold, proceeds + slashed stake → contributors

### Fees
- Protocol fee on successful distributions (configurable)
- Gas fees covered by contributors
- Operator covers initial swap capital (refunded immediately)

## 🔗 Integration Points

### 0xSplits
Battle-tested distribution system for:
- Creator rewards
- Contributor refunds
- Stake slashing distribution
- Gas-efficient batch payments

### 0x API
Professional-grade swap infrastructure:
- MEV protection
- Best price aggregation
- Multiple DEX routing
- Slippage protection

### Zora Protocol (Planned)
Integration for native token creation:
- Automatic Zora coin deployment
- Built-in community features
- Native NFT gating

## 🛡️ Security Model

### Contract Security
- **Minimal Surface**: ~270 lines of custom logic vs 1000+ in traditional approaches
- **Audited Primitives**: Leverages 0xSplits and OpenZeppelin security
- **Immutability**: Critical parameters cannot be changed after deployment
- **Reentrancy Protection**: Applied to all external calls

### Operational Security
- **Operator Isolation**: Backend service runs separately from frontend
- **Event-Driven**: No polling, only reacts to blockchain events
- **Atomic Operations**: Swap and confirmation happen in single transaction
- **Timeout Handling**: Automatic cleanup of stuck operations

## 📈 Scalability Considerations

### Current Design
- Each strategy is independent contract
- Linear scaling with number of strategies
- Gas-efficient operations (< 100k gas for most operations)

### Future Optimizations
- Batch processing for multiple contributions
- Layer 2 migration for reduced costs
- Automated market maker integration
- Cross-chain strategy deployment