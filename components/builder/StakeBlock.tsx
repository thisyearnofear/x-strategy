/**
 * Stake Block
 * Configure creator stakes, timeline, and exit strategy
 */

import React from 'react'
import { ExitStrategy } from '../../lib/types/strategy'
import { BlockContainer, BlockHeader } from './primitives'

interface StakeBlockProps {
    nativeTokenStake: number
    ethStake: number
    fundingDays: number
    executionDays: number
    exitStrategy: ExitStrategy
    tier: number
    fee: number
    onChange: (updates: Partial<{
        nativeTokenStake: number
        ethStake: number
        fundingDays: number
        executionDays: number
        exitStrategy: ExitStrategy
    }>) => void
}

const EXIT_STRATEGIES = {
    [ExitStrategy.AUTO_SELL]: {
        title: 'Automatic Sale',
        description: 'Tokens sold automatically at deadline',
        icon: '⏰',
        pros: ['Guaranteed exit', 'No coordination needed'],
        cons: ['No flexibility', 'May miss upside'],
    },
    [ExitStrategy.GOVERNANCE_VOTE]: {
        title: 'Governance Vote',
        description: 'Contributors vote on when to sell',
        icon: '🗳️',
        pros: ['Democratic decision', 'Flexible timing'],
        cons: ['Requires coordination', 'Potential delays'],
    },
    [ExitStrategy.CREATOR_CHOICE]: {
        title: 'Creator Decision',
        description: 'Creator decides with veto protection',
        icon: '👑',
        pros: ['Expert timing', 'Quick decisions'],
        cons: ['Centralized control', 'Trust required'],
    },
}

export default function StakeBlock({
    nativeTokenStake,
    ethStake,
    fundingDays,
    executionDays,
    exitStrategy,
    tier,
    fee,
    onChange
}: StakeBlockProps) {
    const minNativeStake = [50, 100, 300, 500][tier - 1]
    const minEthStake = [0.05, 0.1, 0.5, 1.0][tier - 1]

    const totalDays = fundingDays + executionDays
    const stakeReturn = ethStake * 1.1 // 10% bonus on success
    const slashAmount = ethStake * 0.5 // 50% slashed on failure

    return (
        <BlockContainer>
            <BlockHeader icon="🔒" title="Stakes & Timeline" />

            <div className="space-y-6">
                {/* Stake Requirements */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Native Token Stake */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">
                                Platform Token Stake
                            </label>
                            <span className="text-lg font-bold text-white">
                                {nativeTokenStake} tokens
                            </span>
                        </div>
                        <input
                            type="range"
                            min={minNativeStake}
                            max={minNativeStake * 10}
                            step="10"
                            value={nativeTokenStake}
                            onChange={(e) => onChange({ nativeTokenStake: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Min: {minNativeStake} • Locked until completion
                        </div>
                    </div>

                    {/* ETH Stake */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">
                                ETH Stake
                            </label>
                            <span className="text-lg font-bold text-white">
                                {ethStake} ETH
                            </span>
                        </div>
                        <input
                            type="range"
                            min={minEthStake}
                            max={minEthStake * 20}
                            step="0.05"
                            value={ethStake}
                            onChange={(e) => onChange({ ethStake: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Min: {minEthStake} ETH • Refundable with bonus
                        </div>
                    </div>
                </div>

                {/* Timeline Configuration */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Funding Period */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Funding Period</label>
                            <span className="text-lg font-bold text-white">
                                {fundingDays} days
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={fundingDays}
                            onChange={(e) => onChange({ fundingDays: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Time to reach funding threshold
                        </div>
                    </div>

                    {/* Execution Period */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">Execution Period</label>
                            <span className="text-lg font-bold text-white">
                                {executionDays} days
                            </span>
                        </div>
                        <input
                            type="range"
                            min="7"
                            max="180"
                            step="7"
                            value={executionDays}
                            onChange={(e) => onChange({ executionDays: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Time to complete coordination
                        </div>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm font-semibold text-white mb-3">Timeline Overview:</div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-green-600 h-3 rounded-l flex items-center justify-center text-white text-xs font-bold">
                            Funding ({fundingDays}d)
                        </div>
                        <div className="flex-[2] bg-blue-600 h-3 rounded-r flex items-center justify-center text-white text-xs font-bold">
                            Execution ({executionDays}d)
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">
                        Total duration: {totalDays} days
                    </div>
                </div>

                {/* Exit Strategy Selection */}
                <div>
                    <label className="block text-sm text-gray-400 mb-4">Exit Strategy:</label>
                    <div className="space-y-3">
                        {Object.entries(EXIT_STRATEGIES).map(([strategy, info]) => {
                            const strategyEnum = strategy as ExitStrategy
                            const isSelected = exitStrategy === strategyEnum

                            return (
                                <button
                                    key={strategy}
                                    onClick={() => onChange({ exitStrategy: strategyEnum })}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{info.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold mb-1">{info.title}</div>
                                            <div className="text-sm opacity-90 mb-2">{info.description}</div>
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <div className="text-green-400 font-semibold mb-1">Pros:</div>
                                                    {info.pros.map((pro, i) => (
                                                        <div key={i}>• {pro}</div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div className="text-red-400 font-semibold mb-1">Cons:</div>
                                                    {info.cons.map((con, i) => (
                                                        <div key={i}>• {con}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Stake Economics */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm font-semibold text-white mb-3">Stake Economics:</div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Your ETH stake:</span>
                            <span className="text-white font-semibold">{ethStake} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Platform fee ({fee}%):</span>
                            <span className="text-white font-semibold">Deducted on success</span>
                        </div>

                        <div className="border-t border-gray-700 my-2" />

                        <div className="bg-green-900/20 border border-green-900/50 rounded p-3">
                            <div className="text-green-400 font-semibold text-sm mb-1">✓ If successful:</div>
                            <div className="text-green-300 text-sm">
                                Receive {stakeReturn.toFixed(3)} ETH (stake + 10% bonus)
                            </div>
                        </div>

                        <div className="bg-red-900/20 border border-red-900/50 rounded p-3">
                            <div className="text-red-400 font-semibold text-sm mb-1">✕ If failed:</div>
                            <div className="text-red-300 text-sm">
                                Lose {slashAmount.toFixed(3)} ETH (50% slashed)
                            </div>
                            <div className="text-red-300/70 text-sm">
                                Remaining {slashAmount.toFixed(3)} ETH returned
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BlockContainer>
    )
}