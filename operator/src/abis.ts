export const XStrategyFactoryABI = [
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
        "type": "event",
        "name": "ContributionPending",
        "inputs": [
            { "name": "contributor", "type": "address", "indexed": true },
            { "name": "amount", "type": "uint256", "indexed": false }
        ]
    },
    {
        "type": "function",
        "name": "confirmSwap",
        "inputs": [
            { "name": "contributor", "type": "address" },
            { "name": "ethAmount", "type": "uint256" },
            { "name": "tokensReceived", "type": "uint256" },
            { "name": "minExpected", "type": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "receiveTokens",
        "inputs": [
            { "name": "amount", "type": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "token",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "status",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "view"
    }
] as const;

export const ERC20ABI = [
    {
        "name": "approve",
        "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool" }]
    },
    {
        "name": "balanceOf",
        "type": "function",
        "stateMutability": "view",
        "inputs": [{ "name": "account", "type": "address" }],
        "outputs": [{ "name": "", "type": "uint256" }]
    },
    {
        "name": "decimals",
        "type": "function",
        "stateMutability": "view",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint8" }]
    }
] as const;
