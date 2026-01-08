/**
 * Simplified Preview
 * Real-time preview of the coordination strategy
 */

import React from 'react'
import { StrategyDraft } from './SimplifiedStrategyBuilder'
import { CommitmentLevel, ExitStrategy } from '../../lib/types/strategy'

interface SimplifiedPreviewProps {
    draft: StrategyDraft
    tier: number
    fee: number
    maxFunding: number
}

const COMMITMENT_LABELS = {
    [CommitmentLevel.CLAIMED]: 'Claimed',
    [CommitmentLevel.SIGNALED]: 'Signaled',
    [CommitmentLevel.CONFIRMED]: 'Confirmed',
    [CommitmentLevel.ESCROWED]: 'Escrowed',
}

const EXIT_LABELS = {
    [ExitStrategy.AUTO_SELL]: 'Auto Sale',
    [ExitStrategy.GOVERNANCE_VOTE]: 'Vote',
    [ExitStrategy.CREATOR_CHOICE]: 'Creator',
}

export default function SimplifiedPreview({
    draft,
    tier,
    fee,
    maxFunding
}: SimplifiedPreviewProps) {
    const isValid = draft.targetToken && draft.targetAmount >= draft.fundingThreshold
    const totalDays = draft.fundingDays + draft.executionDays

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Strategy Preview</h3>
                <p className="text-sm text-gray-400">
                    Tier {tier} • {fee}% fee • Max {maxFunding} ETH
                </p>
            </div>

            {/* Card Preview */}
            <div className="flex-1 flex items-center justify-center mb-6">
                <div className="relative">
                    {/* 3D Card */}
                    <div
                        className={`w-72 h-72 rounded-2xl shadow-2xl border-4 transform transition-all duration-300 ${tier === 1 ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-400' :
                                tier === 2 ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-400' :
                                    tier === 3 ? 'bg-gradient-to-br from-green-600 to-green-700 border-green-400' :
                                        'bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-400'
                            }`}
                        style={{
                            transform: 'rotateY(5deg) rotateX(-5deg)',
                            boxShadow: tier === 1 ? '0 20px 60px rgba(107, 114, 128, 0.4)' :
                                tier === 2 ? '0 20px 60px rgba(59, 130, 246, 0.4)' :
                                    tier === 3 ? '0 20px 60px rgba(34, 197, 94, 0.4)' :
                                        '0 20px 60px rgba(245, 158, 11, 0.4)'
                        }}
                    >
                        {/* Card Content */}
                        <div className="h-full flex flex-col justify-between p-6 text-white">
                            {/* Top: Strategy Description */}
                            <div>
                                <div className="font-bold text-lg mb-2">
                                    {draft.targetCount} {draft.targetDescription}
                                </div>
                                <div className="text-white/80 text-sm">
                                    to {draft.targetPlatform}
                                </div>
                            </div>

                            {/* Middle: Key Stats */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span>💰</span>
                                    <span>{draft.fundingThreshold}-{draft.targetAmount} ETH</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span>⏱️</span>
                                    <span>{totalDays} days total</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span>🤝</span>
                                    <span>{COMMITMENT_LABELS[draft.commitmentLevel]}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span>🚪</span>
                                    <span>{EXIT_LABELS[draft.exitStrategy]}</span>
                                </div>
                            </div>

                            {/* Bottom: Progress Placeholder */}
                            <div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-white w-0" />
                                </div>
                                <div className="flex items-center justify-between text-xs text-white/80">
                                    <span>0% funded</span>
                                    <span>0 contributors</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Badge */}
                    <div className={`absolute -top-3 -right-3 px-4 py-2 rounded-full text-xs font-bold shadow-lg text-white ${tier === 1 ? 'bg-gray-600' :
                            tier === 2 ? 'bg-blue-600' :
                                tier === 3 ? 'bg-green-600' :
                                    'bg-yellow-600'
                        }`}>
                        TIER {tier}
                    </div>
                </div>
            </div>

            {/* Details Panel */}
            <div className="space-y-4">
                {/* Strategy Summary */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm font-semibold text-white mb-3">Strategy Summary</div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Coordination:</span>
                            <span className="text-white">{draft.targetCount} → {draft.targetPlatform}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Investment:</span>
                            <span className="text-white">{draft.targetAmount} ETH max</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Your Stake:</span>
                            <span className="text-white">{draft.ethStake} ETH</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Timeline:</span>
                            <span className="text-white">{draft.fundingDays}d + {draft.executionDays}d</span>
                        </div>
                    </div>
                </div>

                {/* Validation Status */}
                {!isValid ? (
                    <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4">
                        <div className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Incomplete</div>
                        <div className="space-y-1 text-xs text-yellow-300">
                            {!draft.targetToken && <div>• Select a target token</div>}
                            {draft.targetAmount < draft.fundingThreshold && <div>• Target must be ≥ threshold</div>}
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4">
                        <div className="text-green-400 text-sm font-semibold mb-1">✓ Ready to Launch</div>
                        <div className="text-xs text-green-300">
                            Strategy is complete and ready for deployment
                        </div>
                    </div>
                )}

                {/* Economics Preview */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm font-semibold text-white mb-3">Economics</div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Platform Fee:</span>
                            <span className="text-white">{fee}% on success</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Success Bonus:</span>
                            <span className="text-green-400">+10% stake return</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Failure Penalty:</span>
                            <span className="text-red-400">50% stake slashed</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Max Contributors:</span>
                            <span className="text-white">Unlimited</span>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="text-sm font-semibold text-white mb-3">Features</div>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Group Chat:</span>
                            <span className={draft.chatEnabled ? "text-green-400" : "text-gray-500"}>
                                {draft.chatEnabled ? "✓ Enabled" : "✗ Disabled"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Signal Stream:</span>
                            <span className={draft.signalStreamEnabled ? "text-green-400" : "text-gray-500"}>
                                {draft.signalStreamEnabled ? "✓ Enabled" : "✗ Disabled"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Governance:</span>
                            <span className={draft.governanceEnabled ? "text-green-400" : "text-gray-500"}>
                                {draft.governanceEnabled ? "✓ Enabled" : "✗ Disabled"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Share Preview */}
                <button
                    disabled={!isValid}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
                >
                    Share Preview Link
                </button>
            </div>
        </div>
    )
}