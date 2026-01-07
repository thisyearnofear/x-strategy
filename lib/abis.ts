export const XStrategyFactoryABI = [
    {
        "type": "function",
        "name": "createStrategy",
        "inputs": [
            { "name": "_token", "type": "address" },
            { "name": "_designatedCreator", "type": "address" },
            { "name": "_targetAmount", "type": "uint256" },
            { "name": "_deadline", "type": "uint256" },
            { "name": "_milestoneUnlockBps", "type": "uint32[]" }
        ],
        "outputs": [{ "name": "strategy", "type": "address" }],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "StrategyCreated",
        "inputs": [
            { "name": "strategy", "type": "address", "indexed": true },
            { "name": "strategyCreator", "type": "address", "indexed": true },
            { "name": "designatedCreator", "type": "address", "indexed": true },
            { "name": "token", "type": "address", "indexed": false },
            { "name": "targetAmount", "type": "uint256", "indexed": false },
            { "name": "deadline", "type": "uint256", "indexed": false }
        ]
    }
] as const;

export const XStrategyABI = [
    {
        "type": "function",
        "name": "optIn",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "rejectStrategy",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "contribute",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "status",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "creatorStake",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view"
    }
] as const;

// Default to a placeholder if not set
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
