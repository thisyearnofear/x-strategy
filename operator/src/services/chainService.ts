import { publicClient, walletClient, account } from '../config';
import { XStrategyABI, ERC20ABI } from '../abis';
import { getQuote } from './swapService';

export async function processContribution(
    strategyAddress: `0x${string}`,
    contributor: `0x${string}`,
    ethAmount: bigint
) {
    console.log(`Processing contribution: ${ethAmount} wei from ${contributor} for strategy ${strategyAddress}`);

    try {
        // 1. Get Strategy Token
        const tokenAddress = await publicClient.readContract({
            address: strategyAddress,
            abi: XStrategyABI,
            functionName: 'token'
        }) as `0x${string}`;

        // 2. Get Quote
        const quote = await getQuote(tokenAddress, ethAmount);
        console.log(`Quote received: Buy ${quote.buyAmount} tokens`);

        // 3. Measure Operator Balance (To calc exact received)
        const preBalance = await publicClient.readContract({
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: 'balanceOf',
            args: [account.address]
        }); // Returns bigint

        // 4. Execute Swap (ETH -> Tokens)
        console.log('Executing Swap on-chain...');
        const swapHash = await walletClient.sendTransaction({
            to: quote.to,
            data: quote.data,
            value: ethAmount
        });
        await publicClient.waitForTransactionReceipt({ hash: swapHash });
        console.log(`Swap executed: ${swapHash}`);

        // 5. Measure New Balance
        const postBalance = await publicClient.readContract({
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: 'balanceOf',
            args: [account.address]
        });

        const tokensReceived = postBalance - (preBalance as bigint);
        if (tokensReceived <= 0n) throw new Error("Swap yielded 0 tokens");

        // 6. Approve Strategy to pull tokens
        console.log('Approving tokens...');
        const approveHash = await walletClient.writeContract({
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: 'approve',
            args: [strategyAddress, tokensReceived]
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // 7. Deposit Tokens to Strategy
        console.log('Depositing tokens...');
        const depositHash = await walletClient.writeContract({
            address: strategyAddress,
            abi: XStrategyABI,
            functionName: 'receiveTokens',
            args: [tokensReceived]
        });
        await publicClient.waitForTransactionReceipt({ hash: depositHash });

        // 8. Confirm Swap (Triggers ETH Refund to Operator)
        console.log('Confirming swap...');
        const minExpected = (quote.buyAmount * 95n) / 100n; // 5% slippage tolerance
        const confirmHash = await walletClient.writeContract({
            address: strategyAddress,
            abi: XStrategyABI,
            functionName: 'confirmSwap',
            args: [contributor, ethAmount, tokensReceived, minExpected]
        });
        await publicClient.waitForTransactionReceipt({ hash: confirmHash });

        console.log(`SUCCESS: Swap confirmed. Refund TX: ${confirmHash}`);

    } catch (error) {
        console.error('Error processing contribution:', error);
    }
}
