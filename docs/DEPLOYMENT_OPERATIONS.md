# Deployment and Operations

## 🚀 Deployment Pipeline

### Testnet Deployment (Base Sepolia)

#### Prerequisites
- Funded deployer wallet (0.1 ETH recommended)
- Verified 0x API key
- Configured environment variables

#### Deployment Steps
```bash
# 1. Prepare deployment
cd contracts
source .env

# 2. Run deployment script
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# 3. Verify deployment
cast call $FACTORY_ADDRESS "owner()(address)" --rpc-url $RPC_URL
```

#### Expected Output
```
✓ Successfully deployed XStrategyFactory
✓ Contract verified on Basescan
✓ Owner set to deployer address
✓ Initial configuration complete
```

### Mainnet Deployment (Base)

#### Pre-Deployment Checklist
- [ ] Code audit completed
- [ ] Testnet deployment validated
- [ ] Operator service tested
- [ ] Frontend integration verified
- [ ] Emergency procedures documented
- [ ] Monitoring systems configured

#### Deployment Process
```bash
# 1. Final verification
forge test --match-path "test/integration/*" -vvv

# 2. Production deployment
forge script script/Deploy.s.sol \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify \
  --slow \
  --gas-price 0.1gwei

# 3. Post-deployment validation
cast call $FACTORY_ADDRESS "getAllStrategies()(uint256)" --rpc-url https://mainnet.base.org
```

## ⚙️ Operator Service Operations

### Initial Setup

#### Wallet Preparation
```bash
# 1. Create dedicated operator wallet
cast wallet new

# 2. Fund with ETH for gas
cast send $OPERATOR_ADDRESS --value 0.1ether --private-key $FUNDING_KEY

# 3. Verify balance
cast balance $OPERATOR_ADDRESS --rpc-url $RPC_URL
```

#### Service Configuration
```bash
# Configure operator service
cd operator
cp .env.example .env

# Edit .env with:
# - RPC_URL
# - PRIVATE_KEY
# - FACTORY_ADDRESS
# - ZERO_EX_API_KEY
```

### Starting the Service

#### Development Mode
```bash
cd operator
npm run dev
```

#### Production Mode
```bash
# Using PM2
pm2 start ecosystem.config.js --env production

# Using systemd (recommended)
sudo systemctl enable xstrategy-operator
sudo systemctl start xstrategy-operator
```

### Monitoring and Maintenance

#### Health Checks
```bash
# Check service status
pm2 status xstrategy-operator

# View logs
pm2 logs xstrategy-operator

# Monitor specific metrics
cast logs --address $FACTORY_ADDRESS --rpc-url $RPC_URL | grep "ContributionConfirmed"
```

#### Routine Maintenance
```bash
# Weekly: Update dependencies
cd operator && npm update

# Monthly: Rotate API keys
# Update ZERO_EX_API_KEY in .env

# Quarterly: Review gas usage
cast rpc eth_getBlockByNumber latest false --rpc-url $RPC_URL
```

## 🔍 Monitoring and Alerting

### Key Metrics to Monitor

#### Smart Contract Metrics
```bash
# Active strategies count
cast call $FACTORY_ADDRESS "getAllStrategies()(address[])" --rpc-url $RPC_URL | jq '. | length'

# Total ETH locked
cast call $STRATEGY_ADDRESS "totalContributed()(uint256)" --rpc-url $RPC_URL

# Recent events
cast logs --address $FACTORY_ADDRESS --from-block $(($(cast block-number --rpc-url $RPC_URL) - 1000)) --rpc-url $RPC_URL
```

#### Operator Service Metrics
```bash
# Transaction success rate
cast logs --address $STRATEGY_ADDRESS --topic0 "ContributionConfirmed()" --rpc-url $RPC_URL | wc -l

# Average gas price paid
cast rpc eth_gasPrice --rpc-url $RPC_URL

# Wallet balance monitoring
while true; do
  cast balance $OPERATOR_ADDRESS --rpc-url $RPC_URL
  sleep 300
done
```

### Alerting Configuration

#### Critical Alerts
- Operator wallet balance < 0.05 ETH
- Failed transaction rate > 5%
- Contract pause events
- Unusual gas price spikes

#### Warning Alerts
- Strategy creation rate drops significantly
- High slippage on swaps
- Service restarts
- API rate limiting

## 🚨 Incident Response

### Common Incidents and Solutions

#### Operator Service Downtime
```bash
# 1. Check service status
systemctl status xstrategy-operator

# 2. Restart service
systemctl restart xstrategy-operator

# 3. Check logs for errors
journalctl -u xstrategy-operator -f

# 4. Manual intervention if needed
cd operator && npm run start:manual
```

#### Transaction Failures
```bash
# 1. Identify failed transactions
cast logs --address $STRATEGY_ADDRESS --topic0 "ContributionFailed()" --rpc-url $RPC_URL

# 2. Check gas prices
cast rpc eth_gasPrice --rpc-url $RPC_URL

# 3. Retry with higher gas
# Update gas settings in operator configuration
```

#### Contract Issues
```bash
# 1. Check contract state
cast call $STRATEGY_ADDRESS "status()(uint8)" --rpc-url $RPC_URL

# 2. Verify contract code
cast code $STRATEGY_ADDRESS --rpc-url $RPC_URL

# 3. Emergency pause (admin only)
cast send $FACTORY_ADDRESS "pauseStrategy(address)" $STRATEGY_ADDRESS --private-key $ADMIN_KEY
```

### Emergency Procedures

#### Immediate Actions
1. **Pause affected strategies** - Use admin controls
2. **Stop operator service** - Prevent further transactions
3. **Document incident** - Record all relevant information
4. **Notify stakeholders** - Alert team and users if needed

#### Investigation Steps
1. Review transaction logs
2. Check blockchain explorer for failed transactions
3. Examine operator service logs
4. Verify contract state and balances
5. Test recovery procedures in staging

## 🔧 Infrastructure Management

### Backup and Recovery

#### Configuration Backups
```bash
# Backup environment files
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env contracts/.env operator/.env

# Store in secure location
scp config-backup-*.tar.gz backup-server:/backups/
```

#### State Recovery
```bash
# Recover from backup
tar -xzf config-backup-latest.tar.gz

# Restore wallet (if needed)
cast wallet import --interactive restored-wallet

# Verify restored configuration
npm run validate-config
```

### Scaling Operations

#### Load Balancing
```bash
# Multiple operator instances
pm2 start ecosystem.config.js --instances 3

# Health check endpoint
curl http://localhost:3001/health

# Load distribution
# Configure reverse proxy (nginx/haproxy)
```

#### Database Management (if using indexer)
```bash
# Backup database
pg_dump xstrategy_indexer > backup-$(date +%Y%m%d).sql

# Restore database
psql xstrategy_indexer < backup-latest.sql

# Optimize queries
ANALYZE VERBOSE strategy_events;
```

## 📊 Performance Optimization

### Gas Optimization
```bash
# Monitor gas usage trends
forge test --gas-report --match-path "test/gas/*"

# Optimize expensive operations
# - Batch multiple operations
# - Cache frequently accessed data
# - Use efficient data structures
```

### Throughput Improvements
```bash
# Increase concurrent operations
# Adjust in operator configuration:
MAX_CONCURRENT_SWAPS=5
BATCH_SIZE=10

# Optimize RPC calls
# Use websocket connections
# Implement connection pooling
```

## 🛡️ Security Operations

### Access Control
```bash
# Regular key rotation
# 1. Generate new keys
cast wallet new

# 2. Update configurations
# 3. Test new keys
# 4. Revoke old keys

# Monitor unauthorized access
cast logs --address $FACTORY_ADDRESS --topic0 "OwnershipTransferred()" --rpc-url $RPC_URL
```

### Audit Trail
```bash
# Maintain transaction logs
cast receipt $TRANSACTION_HASH --rpc-url $RPC_URL

# Document all admin actions
# - Strategy pauses
# - Parameter changes
# - Emergency interventions
```

## 📈 Reporting and Analytics

### Daily Reports
```bash
# Generate daily summary
./scripts/daily-report.sh

# Contents:
# - New strategies created
# - Total contributions
# - Successful completions
# - Failed strategies
# - Operator performance
```

### Monthly Analysis
```bash
# Comprehensive monthly review
./scripts/monthly-analysis.sh

# Metrics:
# - User growth trends
# - Revenue analysis
# - System performance
# - Security incidents
# - Improvement opportunities
```

## 🎯 Continuous Improvement

### Regular Reviews
- **Weekly**: Service health and performance
- **Monthly**: Security audit and optimization
- **Quarterly**: Architecture review and planning
- **Annually**: Major version upgrades and roadmap

### Feedback Integration
- Monitor user feedback and issues
- Track support tickets and resolution times
- Analyze system performance data
- Plan iterative improvements