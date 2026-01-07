import { CONFIG, account } from '../config';

interface Quote {
    buyAmount: bigint;
    data: `0x${string}`;
    to: `0x${string}`;
    grossBuyAmount: bigint;
    sellAmount: bigint;
}

export async function getQuote(buyToken: string, sellAmount: bigint): Promise<Quote> {
    if (!CONFIG.ZERO_EX_API_KEY) throw new Error('ZERO_EX_API_KEY required for mainnet/testnet');

    const params = new URLSearchParams({
        buyToken,
        sellToken: 'ETH',
        sellAmount: sellAmount.toString(),
        takerAddress: account.address
    });

    const response = await fetch(`https://api.0x.org/swap/v1/quote?${params.toString()}`, {
        headers: {
            '0x-api-key': CONFIG.ZERO_EX_API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`0x API Error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        buyAmount: BigInt(data.buyAmount),
        data: data.data as `0x${string}`,
        to: data.to as `0x${string}`,
        grossBuyAmount: BigInt(data.grossBuyAmount),
        sellAmount: BigInt(data.sellAmount)
    };
}
