# X-Strategy Protocol

Transforming tokens into coordination instruments, not just speculative assets.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/x-strategy/ci.yml)](https://github.com/x-strategy/actions)

## 🎯 Vision

X-Strategy transforms tokens from mere speculative assets into powerful coordination instruments. We enable creators to raise capital for meaningful projects while protecting contributors through smart contract automation. Our protocol pools funds, executes token purchases, and automatically unwinds failed strategies with built-in protections.

## 🚀 Getting Started

### Quick Setup
```bash
# Clone and setup
git clone https://github.com/x-strategy/x-strategy.git
cd x-strategy

# Install dependencies
npm install

# Start development
npm run dev
```

### Explore the Protocol
- **[Documentation Hub](docs/DOCUMENTATION_OVERVIEW.md)** - Complete project overview and navigation
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - Smart contract design and system architecture  
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Developer workflows and integration patterns
- **[Deployment Operations](docs/DEPLOYMENT_OPERATIONS.md)** - Production deployment procedures

## 🏗️ Core Architecture

### Smart Contracts
- **XStrategyFactory.sol** - Strategy deployment and lifecycle management
- **XStrategy.sol** - Individual strategy logic with escrow, milestones, and automated protection
- Built with minimal custom logic leveraging battle-tested primitives

### Services Layer
- **Backend Operator** - Node.js service orchestrating token swaps via 0x API
- **Frontend Application** - Next.js interface with immersive 3D visualization
- **Indexer** (planned) - Real-time event indexing and analytics engine

## 🔄 Coordination Workflow

1. **Strategy Creation** - Define measurable milestones, token targets, and funding goals
2. **Capital Coordination** - Contributors pool resources, operator executes token purchases
3. **Outcome Verification** - Creator delivers predefined milestones with transparent proof
4. **Value Distribution** - Success rewards participants, failure triggers automatic refunds

## 🛠️ Development

### Prerequisites
- Node.js v18+
- Foundry for smart contracts
- Base Sepolia testnet access

### Testing
```bash
# Smart contracts
cd contracts && forge test -vvv

# Frontend
npm run test

# Integration
npm run test:integration
```

### Local Development
```bash
# Start frontend
npm run dev

# Start operator service
cd operator && npm run dev

# Deploy contracts locally
cd contracts && forge script script/Deploy.s.sol --rpc-url localhost
```

## 🚢 Deployment

### Testnet (Base Sepolia)
```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

### Mainnet
Follow the detailed [Deployment Operations](docs/DEPLOYMENT_OPERATIONS.md) guide for production deployment.

## 🔧 Key Capabilities

- **Capital Pooling** - Efficient fund aggregation with shared risk/reward
- **Automated Protection** - Built-in downside safeguards through smart contracts
- **Milestone Tracking** - Verifiable outcome-based progress measurement
- **Gas Optimization** - Efficient contract design minimizing transaction costs
- **MEV Protection** - Secure token swapping via decentralized exchange aggregation
- **Coordination Signals** - Time-locked information sharing for informed participation

## 📊 Status

**Current Progress**: 35% Complete

✅ Core contracts implemented and tested  
✅ Backend operator service complete  
✅ Frontend UI 85% complete  
⏳ Mainnet deployment pending  
⏳ Advanced features in development  

## 🔗 Integrations

- [0xSplits](https://docs.0xsplits.xyz/) - Distribution system
- [0x API](https://0x.org/docs/api) - Token swapping
- [Zora Protocol](https://zora.co/) - Token creation (planned)
- [Base Network](https://docs.base.org/) - Blockchain infrastructure

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: See the [consolidated docs](docs/)
- **Issues**: [GitHub Issues](https://github.com/x-strategy/x-strategy/issues)
- **Discussion**: [GitHub Discussions](https://github.com/x-strategy/x-strategy/discussions)

---

*Built with ❤️ for decentralized finance*