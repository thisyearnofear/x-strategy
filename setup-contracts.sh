#!/bin/bash

# X-Strategy Contracts - Quick Setup Script

set -e

echo "🚀 Setting up X-Strategy contracts..."

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "📦 Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    foundryup
else
    echo "✅ Foundry already installed"
fi

cd contracts

# Install dependencies
echo "📦 Installing dependencies..."
forge install OpenZeppelin/openzeppelin-contracts@v5.0.1 --no-commit
forge install 0xSplits/splits-contracts@v2.0.0 --no-commit

# Build contracts
echo "🔨 Building contracts..."
forge build

# Run tests
echo "🧪 Running tests..."
forge test -vvv

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy contracts/.env.example to contracts/.env"
echo "2. Add your PRIVATE_KEY and other vars"
echo "3. Deploy to testnet: cd contracts && forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast"
echo ""
