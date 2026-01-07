# Development Guide

## 🎯 Coordination-Focused Development

This guide provides comprehensive workflows for building and extending the X-Strategy coordination protocol. Whether you're developing smart contracts, frontend interfaces, or backend services, this documentation will help you contribute to transforming tokens into effective coordination instruments.

## 🚀 Quick Start

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd x-strategy

# Install dependencies
npm install

# Setup contracts environment
cd contracts
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge install
forge build
```

### Configuration Files

Create `.env` files in respective directories:

**Root `.env`:**
```env
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532
```

**Contracts `.env`:**
```env
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

**Operator `.env`:**
```env
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=operator_wallet_private_key
FACTORY_ADDRESS=deployed_factory_address
ZERO_EX_API_KEY=your_0x_api_key
```

## 🧪 Testing

### Smart Contract Testing
```bash
cd contracts

# Run all tests
forge test -vvv

# Run specific test
forge test --match-test testCreateStrategy -vvv

# Generate gas report
forge test --gas-report

# Check coverage
forge coverage
```

### Frontend Testing
```bash
# Unit tests
npm run test

# Component stories
npm run storybook

# End-to-end tests
npm run test:e2e
```

## 🔧 Development Workflows

### Smart Contract Development

#### Adding New Features
1. Create new contract in `contracts/src/`
2. Add corresponding test file in `contracts/test/`
3. Update deployment script in `contracts/script/`
4. Run full test suite
5. Document changes in technical architecture

#### Deployment Process
```bash
# Testnet deployment
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url base_sepolia \
  --broadcast \
  --verify

# Mainnet deployment (requires additional confirmation)
forge script script/Deploy.s.sol \
  --rpc-url base_mainnet \
  --broadcast \
  --verify
```

### Frontend Development

#### Component Structure for Coordination Interfaces
```
components/
├── strategy/          # Strategy coordination components
├── gallery/           # 3D visualization of coordination networks
├── builder/           # Strategy creation coordination UI
└── shared/            # Reusable coordination-focused components
```

#### Coordination Hooks
```typescript
// Reading strategy coordination data
const { data: strategyInfo } = useStrategyData(address);

// Participating in coordination
const { contribute, isLoading } = useContribute(address);

// Creator commitment to coordination
const { optIn, isSuccess } = useOptIn(address);
```

#### 3D Coordination Gallery Integration
```typescript
import { StrategyGallery } from '@/components/gallery/StrategyGallery';

// Visualizing coordination networks
<StrategyGallery 
  strategies={strategyData}
  onSelect={handleStrategySelect}
/>
```

### Backend Operator Development

#### Local Development
```bash
cd operator
npm run dev

# With debugging
npm run dev:debug
```

#### Monitoring Tools
```bash
# View operator logs
npm run logs

# Check strategy status
npm run inspect:strategies

# Monitor transactions
npm run monitor:transactions
```

## 🔄 Coordination Integration Patterns

### Frontend ↔ Smart Contract Coordination

#### Reading Coordination Data
```typescript
import { useReadContract } from 'wagmi';
import { XStrategyABI } from '@/contracts/abis';

const { data: status } = useReadContract({
  address: strategyAddress,
  abi: XStrategyABI,
  functionName: 'status'
});
```

#### Participating in Coordination
```typescript
import { useWriteContract } from 'wagmi';

const { writeContract, data: hash } = useWriteContract();

const contribute = async (amount: bigint) => {
  return writeContract({
    address: strategyAddress,
    abi: XStrategyABI,
    functionName: 'contribute',
    value: amount
  });
};
```

### Backend ↔ Smart Contract

#### Event Monitoring
```typescript
import { watchContractEvent } from 'viem';

const unwatch = watchContractEvent({
  address: factoryAddress,
  abi: XStrategyFactoryABI,
  eventName: 'StrategyCreated',
  onLogs: async (logs) => {
    // Handle new strategy creation
    await processNewStrategy(logs[0].args.strategy);
  }
});
```

#### Transaction Execution
```typescript
import { createWalletClient, http } from 'viem';

const walletClient = createWalletClient({
  account: operatorAccount,
  chain: baseSepolia,
  transport: http(process.env.RPC_URL)
});

const hash = await walletClient.writeContract({
  address: strategyAddress,
  abi: XStrategyABI,
  functionName: 'confirmSwap',
  args: [contributor, ethAmount, tokenAmount, minAmount]
});
```

## 🐛 Debugging Guide

### Common Issues

#### Contract Deployment Failures
```bash
# Clean build cache
forge clean
forge install
forge build

# Check gas estimates
forge test --gas-report
```

#### Frontend Connection Issues
```bash
# Verify RPC endpoint
curl -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Clear wagmi cache
rm -rf .wagmi
```

#### Operator Service Problems
```bash
# Check wallet balance
cast balance $OPERATOR_ADDRESS --rpc-url $RPC_URL

# Verify contract addresses
cast call $FACTORY_ADDRESS "getAllStrategies()(address[])" --rpc-url $RPC_URL
```

### Logging and Monitoring

#### Smart Contract Events
```bash
# Monitor factory events
cast logs --address $FACTORY_ADDRESS --rpc-url $RPC_URL

# Monitor specific strategy
cast logs --address $STRATEGY_ADDRESS --rpc-url $RPC_URL
```

#### Frontend Debugging
```typescript
// Enable wagmi logging
localStorage.setItem('wagmi.debug', 'true');

// Console helpers
console.log('Connected chains:', chains);
console.log('Wallet status:', status);
```

## 📚 Useful Commands

### Development
```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck

# Build production
npm run build
```

### Contract Development
```bash
# Generate ABIs
forge bind --bindings-path ./bindings

# Flatten contracts for verification
forge flatten src/XStrategy.sol > flattened/XStrategy.sol

# Estimate gas costs
forge test --gas-report --match-test "testGas"
```

### Deployment
```bash
# Verify contracts
forge verify-contract $ADDRESS $CONTRACT_NAME \
  --verifier etherscan \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Check deployment status
cast code $ADDRESS --rpc-url $RPC_URL
```

## 🔒 Security Best Practices

### Smart Contracts
- Always run full test suite before deployment
- Use OpenZeppelin's security tools
- Implement proper access controls
- Test edge cases thoroughly

### Frontend
- Validate all user inputs
- Sanitize blockchain data before display
- Implement proper error boundaries
- Use environment variables for sensitive data

### Backend
- Never commit private keys
- Use secure connection for RPC endpoints
- Implement rate limiting
- Monitor transaction gas prices

## 🎯 Next Steps

1. Complete the quick start setup
2. Run the test suite to verify installation
3. Deploy to testnet for experimentation
4. Integrate with the frontend application
5. Test the full contribution flow