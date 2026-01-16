import type { AppProps } from 'next/app'
import '../styles/globals.css'
import '../lib/style.css'
import '@rainbow-me/rainbowkit/styles.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ThemeProvider } from 'next-themes'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '../lib/config/wagmi'
import { useEffect, useState } from 'react'
import { NotificationProvider } from '../lib/hooks/useNotifications'
import NotificationDisplay from '../components/NotificationDisplay'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NotificationProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={null} // Let next-themes handle it via custom CSS or dynamic theme
            >
              {mounted && <Component {...pageProps} />}
            </RainbowKitProvider>
            <NotificationDisplay />
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </NotificationProvider>
  )
}

export default MyApp