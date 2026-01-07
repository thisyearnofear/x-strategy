/**
 * Wagmi Configuration
 * Wallet connection and chain setup for X-Strategy
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia, zora, zoraTestnet } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'X-Strategy',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [base, zora, baseSepolia, zoraTestnet],
  ssr: true, // Enable server-side rendering
})

// Chain configurations
export const SUPPORTED_CHAINS = {
  base: {
    id: base.id,
    name: 'Base',
    network: 'base',
    nativeCurrency: base.nativeCurrency,
    rpcUrls: base.rpcUrls,
    blockExplorers: base.blockExplorers,
  },
  zora: {
    id: zora.id,
    name: 'Zora',
    network: 'zora',
    nativeCurrency: zora.nativeCurrency,
    rpcUrls: zora.rpcUrls,
    blockExplorers: zora.blockExplorers,
  },
}

export const DEFAULT_CHAIN = base
