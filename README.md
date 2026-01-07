# X-Strategy Protocol

A decentralized protocol for milestone-based fundraising with automated downside protection.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/x-strategy/ci.yml)](https://github.com/x-strategy/actions)

## 🎯 Overview

X-Strategy enables creators to raise capital for projects while protecting contributors through smart contract automation. The protocol pools funds, executes token purchases, and automatically unwinds failed strategies with built-in protections.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/x-strategy/x-strategy.git
cd x-strategy

# Install dependencies
npm install

# Start development
npm run dev
```

## 📚 Documentation

All documentation has been consolidated into four focused guides:

| Document | Purpose | Length |
|----------|---------|--------|
| [**Documentation Overview**](docs/DOCUMENTATION_OVERVIEW.md) | Project vision, quick start, and navigation | ~100 lines |
| [**Technical Architecture**](docs/TECHNICAL_ARCHITECTURE.md) | Smart contract design and system architecture | ~200 lines |
| [**Development Guide**](docs/DEVELOPMENT_GUIDE.md) | Developer workflows and integration patterns | ~200 lines |
| [**Deployment Operations**](docs/DEPLOYMENT_OPERATIONS.md) | Deployment procedures and operational guidelines | ~200 lines |

## 🏗️ Core Components

### Smart Contracts
- **XStrategyFactory.sol** - Strategy deployment and management
- **XStrategy.sol** - Individual strategy logic with escrow and milestones
- Built with minimal custom logic leveraging audited primitives

### Services
- **Backend Operator** - Node.js service for token swaps via 0x API
- **Frontend Application** - Next.js app with 3D visualization
- **Indexer** (planned) - Event indexing and analytics

## 🔄 How It Works

1. **Create Strategy** - Define milestones, token, and funding goals
2. **Raise Capital** - Contributors send ETH, operator buys tokens
3. **Execute Milestones** - Creator completes predefined outcomes
4. **Distribution** - Success rewards all, failure refunds contributors

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

## 🔧 Key Features

- **Capital Pooling** - Efficient fund aggregation
- **Automated Protection** - Built-in downside safeguards
- **Milestone Tracking** - Measurable outcome verification
- **Gas Efficiency** - Optimized contract design
- **MEV Protection** - Secure token swapping via 0x API

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