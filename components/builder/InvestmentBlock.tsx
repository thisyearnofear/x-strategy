/**
 * Investment Block
 * Configure token investment parameters
 */

import React, { useState } from 'react'
import { BlockContainer, BlockHeader } from './primitives'

interface InvestmentBlockProps {
    targetToken: string
    fundingThreshold: number
    targetAmount: number
    maxFunding: number
    onChange: (updates: Partial<{
        targetToken: string
        fundingThreshold: number
        targetAmount: number
    }>) => void
}

const POPULAR_TOKENS = [
    {
        address: '0x0000000000000000000000000000000000000001',
        symbol: 'WARP',
        name: 'Warpcast Token',
        price: 0.05,
        chain: 'Base'
    },
    {
        address: '0x0000000000000000000000000000000000000002',
        symbol: 'ZORA',
        name: 'Zora Token',
        price: 0.12,
        chain: 'Zora'
    },
    {
        address: '0x0000000000000000000000000000000000000003',
        symbol: 'LENS',
        name: 'Lens Protocol',
        price: 0.08,
        chain: 'Polygon'
    },
    {
        address: '0x0000000000000000000000000000000000000004',
        symbol: 'BASE',
        name: 'Base Token',
        price: 0.15,
        chain: 'Base'
    },
]

export default function InvestmentBlock({
    targetToken,
    fundingThreshold,
    targetAmount,
    maxFunding,
    onChange
}: InvestmentBlockProps) {
    const [tokenSearch, setTokenSearch] = useState('')
    const [showTokenList, setShowTokenList] = useState(false)

    const selectedToken = POPULAR_TOKENS.find(t => t.address === targetToken)

    const handleTokenSelect = (token: typeof POPULAR_TOKENS[0]) => {
        onChange({ targetToken: token.address })
        setShowTokenList(false)
        setTokenSearch('')
    }

    const estimatedTokens = selectedToken
        ? (targetAmount / selectedToken.price).toLocaleString(undefined, { maximumFractionDigits: 0 })
        : '0'

    return (
        <BlockContainer>
            <BlockHeader icon="💰" title="Investment Configuration" />

            <div className="space-y-6">
                {/* Token Selection */}
                <div>
                    <label className="block text-sm text-gray-400 mb-3">Target Token (Existing Only):</label>

                    {/* Selected Token Display */}
                    {selectedToken ? (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {selectedToken.symbol.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">{selectedToken.symbol}</div>
                                        <div className="text-gray-400 text-sm">{selectedToken.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-semibold">${selectedToken.price}</div>
                                    <div className="text-gray-400 text-sm">{selectedToken.chain}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                            <div className="text-gray-400 mb-2">No token selected</div>
                            <div className="text-sm text-gray-500">Choose from popular tokens or enter custom address</div>
                        </div>
                    )}

                    {/* Token Search/Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={tokenSearch || targetToken}
                            onChange={(e) => {
                                setTokenSearch(e.target.value)
                                if (e.target.value.startsWith('0x')) {
                                    onChange({ targetToken: e.target.value })
                                }
                                setShowTokenList(e.target.value.length > 0 && !e.target.value.startsWith('0x'))
                            }}
                            placeholder="Search tokens or paste address (0x...)"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Token Dropdown */}
                        {showTokenList && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10 max-h-60 overflow-y-auto">
                                {POPULAR_TOKENS
                                    .filter(token =>
                                        token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
                                        token.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
                                    )
                                    .map((token) => (
                                        <button
                                            key={token.address}
                                            onClick={() => handleTokenSelect(token)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {token.symbol.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold">{token.symbol}</div>
                                                        <div className="text-gray-400 text-sm">{token.name}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white">${token.price}</div>
                                                    <div className="text-gray-400 text-xs">{token.chain}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Funding Configuration */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Funding Threshold */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Minimum to Launch</label>
                            <span className="text-xl font-bold text-white">
                                {fundingThreshold} ETH
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max={maxFunding / 2}
                            step="0.1"
                            value={fundingThreshold}
                            onChange={(e) => {
                                const newThreshold = parseFloat(e.target.value)
                                onChange({
                                    fundingThreshold: newThreshold,
                                    targetAmount: Math.max(newThreshold, targetAmount)
                                })
                            }}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Strategy launches when this amount is raised
                        </div>
                    </div>

                    {/* Target Amount */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Target Amount</label>
                            <span className="text-xl font-bold text-white">
                                {targetAmount} ETH
                            </span>
                        </div>
                        <input
                            type="range"
                            min={fundingThreshold}
                            max={maxFunding}
                            step="0.5"
                            value={targetAmount}
                            onChange={(e) => onChange({ targetAmount: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Maximum funding goal (based on commitment tier)
                        </div>
                    </div>
                </div>

                {/* Investment Preview */}
                {selectedToken && (
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <div className="text-sm font-semibold text-white mb-3">Investment Preview:</div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <div className="text-gray-400">Token Purchase:</div>
                                <div className="text-white font-semibold">~{estimatedTokens} {selectedToken.symbol}</div>
                            </div>
                            <div>
                                <div className="text-gray-400">Per Contributor:</div>
                                <div className="text-white font-semibold">
                                    {selectedToken.symbol} tokens
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400">Current Price:</div>
                                <div className="text-white font-semibold">${selectedToken.price}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Funding Range Indicator */}
                <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 text-sm">Funding Range</span>
                        <span className="text-blue-300 text-sm">
                            {fundingThreshold} ETH → {targetAmount} ETH
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(fundingThreshold / targetAmount) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Launch threshold</span>
                        <span>Maximum goal</span>
                    </div>
                </div>

                {/* Validation */}
                {!targetToken && (
                    <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3">
                        <div className="text-yellow-400 text-sm">⚠️ Please select a target token to continue</div>
                    </div>
                )}
            </div>
        </BlockContainer>
    )
}