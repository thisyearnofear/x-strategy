/**
 * Commitment Block
 * Verify target commitment level and provide proof
 */

import React from 'react'
import { CommitmentLevel } from '../../lib/types/strategy'
import { BlockContainer, BlockHeader } from './primitives'

interface CommitmentBlockProps {
    commitmentLevel: CommitmentLevel
    commitmentProof?: string
    targetCommitments?: string[]
    onChange: (updates: Partial<{
        commitmentLevel: CommitmentLevel
        commitmentProof?: string
        targetCommitments?: string[]
    }>) => void
}

const COMMITMENT_INFO = {
    [CommitmentLevel.CLAIMED]: {
        title: 'Claimed Commitment',
        description: 'You claim you can deliver the targets',
        requirements: ['Creator reputation at stake'],
        maxFunding: '5 ETH',
        fee: '2.5%',
        color: 'gray',
        icon: '📝'
    },
    [CommitmentLevel.SIGNALED]: {
        title: 'Signaled Interest',
        description: 'Targets have shown public interest',
        requirements: ['Social media engagement', 'Likes/shares/comments'],
        maxFunding: '25 ETH',
        fee: '2.0%',
        color: 'blue',
        icon: '📢'
    },
    [CommitmentLevel.CONFIRMED]: {
        title: 'Confirmed Participation',
        description: 'Targets have explicitly confirmed',
        requirements: ['Signed messages', 'Public confirmations', 'Direct communication'],
        maxFunding: '100 ETH',
        fee: '1.5%',
        color: 'green',
        icon: '✅'
    },
    [CommitmentLevel.ESCROWED]: {
        title: 'Escrowed Stakes',
        description: 'Targets have put up their own stakes',
        requirements: ['Target stakes locked', 'Mutual skin in the game'],
        maxFunding: '500 ETH',
        fee: '1.0%',
        color: 'yellow',
        icon: '💎'
    },
}

const COLOR_CLASSES = {
    gray: {
        bg: 'bg-gray-600',
        border: 'border-gray-600',
        text: 'text-gray-400',
        hover: 'hover:bg-gray-700'
    },
    blue: {
        bg: 'bg-blue-600',
        border: 'border-blue-600',
        text: 'text-blue-400',
        hover: 'hover:bg-blue-700'
    },
    green: {
        bg: 'bg-green-600',
        border: 'border-green-600',
        text: 'text-green-400',
        hover: 'hover:bg-green-700'
    },
    yellow: {
        bg: 'bg-yellow-600',
        border: 'border-yellow-600',
        text: 'text-yellow-400',
        hover: 'hover:bg-yellow-700'
    },
}

export default function CommitmentBlock({
    commitmentLevel,
    commitmentProof,
    targetCommitments,
    onChange
}: CommitmentBlockProps) {
    const currentInfo = COMMITMENT_INFO[commitmentLevel]
    const currentColors = COLOR_CLASSES[currentInfo.color as keyof typeof COLOR_CLASSES]

    const addTargetCommitment = () => {
        const newCommitments = [...(targetCommitments || []), '']
        onChange({ targetCommitments: newCommitments })
    }

    const updateTargetCommitment = (index: number, value: string) => {
        const newCommitments = [...(targetCommitments || [])]
        newCommitments[index] = value
        onChange({ targetCommitments: newCommitments })
    }

    const removeTargetCommitment = (index: number) => {
        const newCommitments = (targetCommitments || []).filter((_, i) => i !== index)
        onChange({ targetCommitments: newCommitments })
    }

    return (
        <BlockContainer>
            <BlockHeader icon="🤝" title="Commitment Verification" />

            <div className="space-y-6">
                {/* Commitment Level Selector */}
                <div>
                    <label className="block text-sm text-gray-400 mb-4">Choose Commitment Level:</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(COMMITMENT_INFO).map(([level, info]) => {
                            const levelNum = parseInt(level) as CommitmentLevel
                            const colors = COLOR_CLASSES[info.color as keyof typeof COLOR_CLASSES]
                            const isSelected = commitmentLevel === levelNum

                            return (
                                <button
                                    key={level}
                                    onClick={() => onChange({ commitmentLevel: levelNum })}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                            ? `${colors.bg} ${colors.border} text-white`
                                            : `bg-gray-800 border-gray-700 text-gray-300 ${colors.hover}`
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{info.icon}</span>
                                        <div>
                                            <div className="font-semibold">{info.title}</div>
                                            <div className="text-xs opacity-80">
                                                Max {info.maxFunding} • {info.fee} fee
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm opacity-90">{info.description}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Current Level Details */}
                <div className={`bg-${currentInfo.color}-900/20 border border-${currentInfo.color}-900/50 rounded-lg p-4`}>
                    <div className={`${currentColors.text} text-sm font-semibold mb-3`}>
                        {currentInfo.icon} {currentInfo.title} Requirements:
                    </div>
                    <ul className="space-y-1 text-sm text-gray-300">
                        {currentInfo.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className={currentColors.text}>•</span>
                                {req}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Commitment Proof */}
                {commitmentLevel > CommitmentLevel.CLAIMED && (
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Commitment Proof {commitmentLevel >= CommitmentLevel.CONFIRMED && '(Required)'}:
                        </label>
                        <input
                            type="url"
                            value={commitmentProof || ''}
                            onChange={(e) => onChange({ commitmentProof: e.target.value })}
                            placeholder={
                                commitmentLevel === CommitmentLevel.SIGNALED
                                    ? 'https://twitter.com/user/status/... or https://warpcast.com/...'
                                    : commitmentLevel === CommitmentLevel.CONFIRMED
                                        ? 'Link to confirmation posts, messages, or signatures'
                                        : 'Link to escrow transaction or contract'
                            }
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {commitmentLevel === CommitmentLevel.SIGNALED && 'Social media posts showing target interest'}
                            {commitmentLevel === CommitmentLevel.CONFIRMED && 'Direct confirmations from targets'}
                            {commitmentLevel === CommitmentLevel.ESCROWED && 'On-chain proof of target stakes'}
                        </div>
                    </div>
                )}

                {/* Target Commitments */}
                {commitmentLevel >= CommitmentLevel.CONFIRMED && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm text-gray-400">
                                Target Confirmations:
                            </label>
                            <button
                                onClick={addTargetCommitment}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                            >
                                + Add Target
                            </button>
                        </div>

                        <div className="space-y-2">
                            {(targetCommitments || []).map((commitment, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={commitment}
                                        onChange={(e) => updateTargetCommitment(index, e.target.value)}
                                        placeholder="@username or 0x... address"
                                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => removeTargetCommitment(index)}
                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {(!targetCommitments || targetCommitments.length === 0) && (
                                <div className="text-sm text-gray-500 italic">
                                    Add usernames or addresses of confirmed targets
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Benefits Summary */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-white mb-3">Your Benefits:</div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                            <div className="text-gray-400">Max Funding:</div>
                            <div className="text-white font-semibold">{currentInfo.maxFunding}</div>
                        </div>
                        <div>
                            <div className="text-gray-400">Platform Fee:</div>
                            <div className="text-white font-semibold">{currentInfo.fee}</div>
                        </div>
                        <div>
                            <div className="text-gray-400">Success Rate:</div>
                            <div className="text-white font-semibold">
                                {commitmentLevel === CommitmentLevel.CLAIMED && '~45%'}
                                {commitmentLevel === CommitmentLevel.SIGNALED && '~65%'}
                                {commitmentLevel === CommitmentLevel.CONFIRMED && '~85%'}
                                {commitmentLevel === CommitmentLevel.ESCROWED && '~95%'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BlockContainer>
    )
}