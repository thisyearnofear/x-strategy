import { publicClient, CONFIG } from './config';
import { XStrategyFactoryABI, XStrategyABI } from './abis';
import { processContribution } from './services/chainService';

// Add getAllStrategies to a local ABI fragment for reading
const FactoryReadABI = [
    {
        inputs: [],
        name: "getAllStrategies",
        outputs: [{ name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
    }
] as const;

async function main() {
    console.log(`Starting Operator Service on Chain ID: ${CONFIG.CHAIN.id}`);
    console.log(`Operator Address: ${CONFIG.PRIVATE_KEY ? 'Loaded' : 'Missing'}`); // Don't log key
    console.log(`Factory: ${CONFIG.FACTORY_ADDRESS}`);

    // 1. Load Existing Strategies
    try {
        const strategies = await publicClient.readContract({
            address: CONFIG.FACTORY_ADDRESS,
            abi: FactoryReadABI,
            functionName: 'getAllStrategies'
        }) as `0x${string}`[];

        console.log(`Found ${strategies.length} existing strategies.`);
        strategies.forEach(watchStrategy);
    } catch (e) {
        console.warn("Failed to fetch existing strategies (Factory might be empty or invalid address):", e);
    }

    // 2. Watch for NEW strategies
    publicClient.watchContractEvent({
        address: CONFIG.FACTORY_ADDRESS,
        abi: XStrategyFactoryABI,
        eventName: 'StrategyCreated',
        onLogs: logs => {
            logs.forEach(log => {
                const strategy = log.args.strategy;
                if (strategy) {
                    console.log(`New Strategy Detected: ${strategy}`);
                    watchStrategy(strategy);
                }
            });
        }
    });
}

const activeWatchers = new Set<string>();

function watchStrategy(address: `0x${string}`) {
    if (activeWatchers.has(address)) return;
    activeWatchers.add(address);

    console.log(`Watching strategy: ${address}`);

    publicClient.watchContractEvent({
        address,
        abi: XStrategyABI,
        eventName: 'ContributionPending',
        onLogs: logs => {
            logs.forEach(log => {
                const { contributor, amount } = log.args;
                if (contributor && amount) {
                    console.log(`Event: ContributionPending on ${address}`);
                    processContribution(address, contributor, amount);
                }
            });
        }
    });
}

main().catch(console.error);
