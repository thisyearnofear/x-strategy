import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

dotenv.config();

if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY is required');
if (!process.env.FACTORY_ADDRESS) throw new Error('FACTORY_ADDRESS is required');

export const CONFIG = {
    RPC_URL: process.env.RPC_URL || 'https://sepolia.base.org',
    PRIVATE_KEY: process.env.PRIVATE_KEY as `0x${string}`,
    FACTORY_ADDRESS: process.env.FACTORY_ADDRESS as `0x${string}`,
    ZERO_EX_API_KEY: process.env.ZERO_EX_API_KEY,
    CHAIN: baseSepolia // Default to Base Sepolia
};

export const account = privateKeyToAccount(CONFIG.PRIVATE_KEY);

export const publicClient = createPublicClient({
    chain: CONFIG.CHAIN,
    transport: http(CONFIG.RPC_URL)
});

export const walletClient = createWalletClient({
    account,
    chain: CONFIG.CHAIN,
    transport: http(CONFIG.RPC_URL)
});
