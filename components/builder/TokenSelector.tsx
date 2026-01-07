/**
 * Token Selector
 * Search existing tokens or create new Zora coin
 */

import React, { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { createZoraCoin, checkBalance, estimateGas } from '../../lib/zora/createCoin'
import { BlockContainer, BlockHeader } from './primitives'

interface TokenSelectorProps {
  tokenConfig: {
    useExisting: boolean
    existingAddress?: string
    newToken?: {
      name: string
      symbol: string
      startingMarketCap: 'LOW' | 'MID' | 'HIGH'
    }
  }
  onChange: (config: any) => void
}

export default function TokenSelector({ tokenConfig, onChange }: TokenSelectorProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [balanceCheck, setBalanceCheck] = useState<any>(null)

  const handleToggleMode = (useExisting: boolean) => {
    onChange({
      ...tokenConfig,
      useExisting,
    })
  }

  const handleNewTokenChange = (field: string, value: any) => {
    onChange({
      ...tokenConfig,
      newToken: {
        ...tokenConfig.newToken,
        [field]: value,
      },
    })
  }

  const handleCheckBalance = async () => {
    if (!address || !tokenConfig.newToken) return

    const chain = chainId === 8453 ? 'base' : 'zora'
    const result = await checkBalance(
      address,
      tokenConfig.newToken.startingMarketCap,
      chain
    )
    setBalanceCheck(result)
  }

  const handleCreateCoin = async () => {
    if (!address || !tokenConfig.newToken) return

    setIsCreating(true)
    setCreateError(null)

    try {
      const chain = chainId === 8453 ? 'base' : 'zora'
      
      const result = await createZoraCoin({
        creatorAddress: address,
        name: tokenConfig.newToken.name,
        symbol: tokenConfig.newToken.symbol,
        startingMarketCap: tokenConfig.newToken.startingMarketCap,
        chain,
      })

      if (result.success && result.coinAddress) {
        // Switch to using the created token
        onChange({
          useExisting: true,
          existingAddress: result.coinAddress,
        })
        alert(`Token created successfully!\nAddress: ${result.coinAddress}`)
      } else {
        setCreateError(result.error || 'Failed to create token')
      }
    } catch (error: any) {
      setCreateError(error.message || 'Unknown error')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <BlockContainer>
      <BlockHeader icon="🪙" title="Token Selection" />

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleToggleMode(false)}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
            !tokenConfig.useExisting
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Create New Token
        </button>
        <button
          onClick={() => handleToggleMode(true)}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
            tokenConfig.useExisting
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Use Existing Token
        </button>
      </div>

      {/* Create New Token */}
      {!tokenConfig.useExisting && (
        <div className="space-y-4">
          {!isConnected && (
            <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4">
              <div className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Wallet Not Connected</div>
              <div className="text-yellow-300 text-xs">
                Connect your wallet to create a Zora coin
              </div>
            </div>
          )}

          {/* Token Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Token Name</label>
            <input
              type="text"
              value={tokenConfig.newToken?.name || ''}
              onChange={(e) => handleNewTokenChange('name', e.target.value)}
              placeholder="e.g., Lane Rettig"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
          </div>

          {/* Token Symbol */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Symbol</label>
            <input
              type="text"
              value={tokenConfig.newToken?.symbol || ''}
              onChange={(e) => handleNewTokenChange('symbol', e.target.value.toUpperCase())}
              placeholder="e.g., LANE"
              maxLength={10}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              disabled={!isConnected}
            />
          </div>

          {/* Starting Market Cap */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Starting Market Cap</label>
            <div className="grid grid-cols-3 gap-3">
              {(['LOW', 'MID', 'HIGH'] as const).map((cap) => (
                <button
                  key={cap}
                  onClick={() => handleNewTokenChange('startingMarketCap', cap)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    tokenConfig.newToken?.startingMarketCap === cap
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                  disabled={!isConnected}
                >
                  <div className="text-lg">{cap}</div>
                  <div className="text-xs opacity-70">
                    {cap === 'LOW' && '~$300'}
                    {cap === 'MID' && '~$3K'}
                    {cap === 'HIGH' && '~$30K'}
                  </div>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Higher starting caps help prevent sniping attacks
            </div>
          </div>

          {/* Balance Check */}
          {isConnected && tokenConfig.newToken?.startingMarketCap && (
            <div>
              <button
                onClick={handleCheckBalance}
                className="text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Check if you have enough balance
              </button>
              
              {balanceCheck && (
                <div className={`mt-2 p-3 rounded-lg ${
                  balanceCheck.hasEnough
                    ? 'bg-green-900/20 border border-green-900/50'
                    : 'bg-red-900/20 border border-red-900/50'
                }`}>
                  <div className={`text-sm ${balanceCheck.hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                    {balanceCheck.hasEnough ? '✓' : '✗'} Balance: {balanceCheck.balance} ETH
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Required: {balanceCheck.required} ETH
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {tokenConfig.newToken?.name && tokenConfig.newToken?.symbol && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400 mb-3">Preview:</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {tokenConfig.newToken.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-white font-semibold">{tokenConfig.newToken.symbol}</div>
                  <div className="text-gray-400 text-sm">{tokenConfig.newToken.name}</div>
                  <div className="text-xs text-blue-400 mt-1">Live on {chainId === 8453 ? 'Base' : 'Zora'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateCoin}
            disabled={
              !isConnected ||
              !tokenConfig.newToken?.name ||
              !tokenConfig.newToken?.symbol ||
              !tokenConfig.newToken?.startingMarketCap ||
              isCreating
            }
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:scale-100"
          >
            {isCreating ? 'Creating Token...' : 'Deploy to Zora'}
          </button>

          {createError && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3">
              <div className="text-red-400 text-sm">Error: {createError}</div>
            </div>
          )}

          {/* Gas Estimate */}
          <div className="text-xs text-gray-500 text-center">
            Estimated gas: ~$5-15 depending on network
          </div>
        </div>
      )}

      {/* Use Existing Token */}
      {tokenConfig.useExisting && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Token Address</label>
            <input
              type="text"
              value={tokenConfig.existingAddress || ''}
              onChange={(e) =>
                onChange({
                  ...tokenConfig,
                  existingAddress: e.target.value,
                })
              }
              placeholder="0x..."
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
            Fetch Token Details
          </button>

          <div className="text-xs text-gray-500">
            Paste the address of an existing Zora creator coin
          </div>
        </div>
      )}
    </BlockContainer>
  )
}
