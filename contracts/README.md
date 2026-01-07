# X-Strategy Contracts

Minimal, secure smart contracts for outcome-backed capital coordination.

## Architecture

### Leveraged Audited Primitives

1. **0xSplits** - Token distribution
   - Battle-tested, gas-efficient
   - Immutable splits for trustless distribution
   - No custom distribution logic needed

2. **OpenZeppelin** - Security primitives
   - ReentrancyGuard
   - SafeERC20
   - Standard interfaces

3. **Intent-based Token Buying** (Off-chain)
   - Use 0x API or Cowswap for actual token purchases
   - Contracts only handle escrow + distribution
   - Avoids complex DEX integration in contracts

## Contracts

### `XStrategy.sol` (Core)
- Escrows creator stake
- Tracks contributions
- Manages milestone completion
- Creates 0xSplit for distribution
- Handles auto-unwind logic

**Key Design Decisions:**
- No on-chain token swapping (use intents)
- 0xSplits handles all distribution
- Minimal state, maximum security

### `XStrategyFactory.sol`
- Deploys new strategies
- Tracks all strategies
- Minimal logic

## Setup

```bash
cd contracts

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts
forge install 0xSplits/splits-contracts

# Build
forge build

# Test
forge test -vvv

# Deploy to Base Sepolia
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

## Environment Variables

```bash
# .env
PRIVATE_KEY=your_private_key
PROTOCOL_FEE_RECIPIENT=0x...
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_api_key
```

## Flow

### 1. Create Strategy
```solidity
factory.createStrategy{value: stake}(
    tokenAddress,
    targetAmount,
    deadline,
    [3333, 3333, 3334] // milestone unlock %
)
```

### 2. Contribute
```solidity
strategy.contribute{value: amount}()
// Off-chain: Use 0x API to buy tokens, send to strategy
```

### 3. Complete Milestones
```solidity
strategy.completeMilestone(0, proofHash)
```

### 4. Distribute (Success)
```solidity
strategy.distribute() // Uses 0xSplits
```

### 5. Unwind (Failure)
```solidity
strategy.initiateUnwind()
// Wait 24h cooldown
strategy.executeUnwind()
strategy.distribute() // Refund via 0xSplits
```

## Security Features

✅ **ReentrancyGuard** - All value transfers protected  
✅ **0xSplits** - Audited distribution logic  
✅ **Immutable parameters** - Creator, token, deadline can't change  
✅ **Cooldown period** - 24h before unwind execution  
✅ **No custom DEX logic** - Use battle-tested intent protocols  

## Gas Optimization

- Minimal storage slots
- 0xSplits handles distribution (no loops)
- Intent-based buying (off-chain)

## Deployment Addresses

### Base Sepolia (Testnet)
- SplitMain: `0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE`
- XStrategyFactory: TBD

### Base Mainnet
- SplitMain: `0x2ed6c4B5dA6378c7897AC67Ba9e43102Feb694EE`
- XStrategyFactory: TBD

## Next Steps

1. ✅ Deploy to Base Sepolia
2. ✅ Test with real tokens
3. ✅ Integrate 0x API for token buying
4. ✅ Build frontend integration
5. ✅ Audit (if needed)
6. ✅ Deploy to Base mainnet
