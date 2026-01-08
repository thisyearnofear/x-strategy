/**
 * Simplified Template Library
 * Party Protocol inspired templates for group coordination
 */

import React from 'react'
import { StrategyDraft } from './SimplifiedStrategyBuilder'
import { CommitmentLevel, ExitStrategy } from '../../lib/types/strategy'

interface SimplifiedTemplateLibraryProps {
    onSelectTemplate: (template: Partial<StrategyDraft>) => void
    onStartFromScratch: () => void
}

interface Template {
    id: string
    name: string
    icon: string
    description: string
    example: string
    commitment: CommitmentLevel
    draft: Partial<StrategyDraft>
    color: string
}

const TEMPLATES: Template[] = [
    {
        id: 'onboarding-confirmed',
        name: 'Confirmed Onboarding',
        icon: '🎯',
        description: 'Targets have confirmed participation',
        example: 'Garry Tan: 3 YC founders confirmed to join Farcaster',
        commitment: CommitmentLevel.CONFIRMED,
        color: 'from-green-500 to-emerald-500',
        draft: {
            targetCount: 3,
            targetDescription: 'YC founders with $50M+ exits',
            targetPlatform: 'Farcaster',
            commitmentLevel: CommitmentLevel.CONFIRMED,
            targetToken: '0x0000000000000000000000000000000000000000', // WARP token example
            fundingThreshold: 5,
            targetAmount: 25,
            nativeTokenStake: 500,
            ethStake: 1.0,
            fundingDays: 7,
            executionDays: 60,
            exitStrategy: ExitStrategy.GOVERNANCE_VOTE,
        },
    },
    {
        id: 'onboarding-signaled',
        name: 'Signaled Interest',
        icon: '📢',
        description: 'Targets have shown public interest',
        example: 'Lane Rettig: 3 footballers liked the strategy post',
        commitment: CommitmentLevel.SIGNALED,
        color: 'from-blue-500 to-cyan-500',
        draft: {
            targetCount: 3,
            targetDescription: 'professional footballers',
            targetPlatform: 'Zora',
            commitmentLevel: CommitmentLevel.SIGNALED,
            fundingThreshold: 2,
            targetAmount: 10,
            nativeTokenStake: 200,
            ethStake: 0.5,
            fundingDays: 5,
            executionDays: 30,
            exitStrategy: ExitStrategy.GOVERNANCE_VOTE,
        },
    },
    {
        id: 'creator-coordination',
        name: 'Creator Coordination',
        icon: '🎨',
        description: 'Coordinate investment in creator tokens',
        example: 'Coordinate 10 ETH investment in $ARTIST token',
        commitment: CommitmentLevel.CLAIMED,
        color: 'from-purple-500 to-pink-500',
        draft: {
            targetCount: 10,
            targetDescription: 'musicians with 100K+ streams',
            targetPlatform: 'Zora',
            commitmentLevel: CommitmentLevel.CLAIMED,
            fundingThreshold: 1,
            targetAmount: 10,
            nativeTokenStake: 100,
            ethStake: 0.2,
            fundingDays: 3,
            executionDays: 45,
            exitStrategy: ExitStrategy.AUTO_SELL,
        },
    },
    {
        id: 'platform-growth',
        name: 'Platform Growth',
        icon: '🚀',
        description: 'Coordinate growth initiatives',
        example: 'Bring 15 developers to Base ecosystem',
        commitment: CommitmentLevel.SIGNALED,
        color: 'from-orange-500 to-red-500',
        draft: {
            targetCount: 15,
            targetDescription: 'developers with 1K+ GitHub stars',
            targetPlatform: 'Base',
            commitmentLevel: CommitmentLevel.SIGNALED,
            fundingThreshold: 3,
            targetAmount: 20,
            nativeTokenStake: 300,
            ethStake: 0.8,
            fundingDays: 10,
            executionDays: 90,
            exitStrategy: ExitStrategy.CREATOR_CHOICE,
        },
    },
    {
        id: 'escrowed-premium',
        name: 'Premium Escrowed',
        icon: '💎',
        description: 'Highest trust with target stakes',
        example: 'Targets put up their own stake for coordination',
        commitment: CommitmentLevel.ESCROWED,
        color: 'from-yellow-500 to-amber-500',
        draft: {
            targetCount: 5,
            targetDescription: 'verified influencers',
            targetPlatform: 'Lens Protocol',
            commitmentLevel: CommitmentLevel.ESCROWED,
            fundingThreshold: 10,
            targetAmount: 100,
            nativeTokenStake: 1000,
            ethStake: 5.0,
            fundingDays: 14,
            executionDays: 120,
            exitStrategy: ExitStrategy.GOVERNANCE_VOTE,
        },
    },
    {
        id: 'custom',
        name: 'Custom Strategy',
        icon: '✨',
        description: 'Build from scratch',
        example: 'Start with a blank canvas',
        commitment: CommitmentLevel.CLAIMED,
        color: 'from-gray-500 to-gray-600',
        draft: {
            targetCount: 3,
            targetDescription: 'users',
            targetPlatform: 'Platform',
            commitmentLevel: CommitmentLevel.CLAIMED,
            fundingThreshold: 1,
            targetAmount: 5,
            nativeTokenStake: 100,
            ethStake: 0.1,
            fundingDays: 7,
            executionDays: 30,
            exitStrategy: ExitStrategy.GOVERNANCE_VOTE,
        },
    },
]

const COMMITMENT_COLORS = {
    [CommitmentLevel.CLAIMED]: 'bg-gray-600',
    [CommitmentLevel.SIGNALED]: 'bg-blue-600',
    [CommitmentLevel.CONFIRMED]: 'bg-green-600',
    [CommitmentLevel.ESCROWED]: 'bg-yellow-600',
}

const COMMITMENT_LABELS = {
    [CommitmentLevel.CLAIMED]: 'Claimed',
    [CommitmentLevel.SIGNALED]: 'Signaled',
    [CommitmentLevel.CONFIRMED]: 'Confirmed',
    [CommitmentLevel.ESCROWED]: 'Escrowed',
}

export default function SimplifiedTemplateLibrary({
    onSelectTemplate,
    onStartFromScratch
}: SimplifiedTemplateLibraryProps) {
    return (
        <div className="h-full overflow-y-auto p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold text-white mb-3">Choose Your Coordination Strategy</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Group coordination for existing token investment. Higher commitment levels unlock
                        better terms and higher funding limits.
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-2 gap-6">
                    {TEMPLATES.map((template) => (
                        <button
                            key={template.id}
                            onClick={() =>
                                template.id === 'custom'
                                    ? onStartFromScratch()
                                    : onSelectTemplate(template.draft)
                            }
                            className="group relative bg-gray-800/50 hover:bg-gray-800 border-2 border-gray-700 hover:border-gray-600 rounded-2xl p-6 text-left transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />

                            {/* Content */}
                            <div className="relative">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-4xl">{template.icon}</div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${COMMITMENT_COLORS[template.commitment]}`}>
                                        {COMMITMENT_LABELS[template.commitment]}
                                    </div>
                                </div>

                                {/* Name & Description */}
                                <h4 className="text-xl font-bold text-white mb-2">
                                    {template.name}
                                </h4>
                                <p className="text-gray-400 text-sm mb-4">
                                    {template.description}
                                </p>

                                {/* Example */}
                                <div className="bg-gray-900/50 rounded-lg px-3 py-3 text-sm text-gray-300 mb-4">
                                    <span className="text-gray-500 text-xs">Example:</span><br />
                                    {template.example}
                                </div>

                                {/* Stats */}
                                {template.id !== 'custom' && (
                                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                        <div>
                                            <span className="text-gray-600">Target:</span><br />
                                            <span className="text-white">{template.draft.targetCount} {template.draft.targetDescription}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Funding:</span><br />
                                            <span className="text-white">{template.draft.fundingThreshold}-{template.draft.targetAmount} ETH</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Timeline:</span><br />
                                            <span className="text-white">{template.draft.fundingDays}d + {template.draft.executionDays}d</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Stake:</span><br />
                                            <span className="text-white">{template.draft.ethStake} ETH</span>
                                        </div>
                                    </div>
                                )}

                                {/* Use Button */}
                                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className={`px-4 py-3 bg-gradient-to-r ${template.color} text-white font-semibold rounded-lg text-center text-sm`}>
                                        {template.id === 'custom' ? 'Start Building' : 'Use This Template'}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Commitment Level Guide */}
                <div className="mt-12 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
                    <h4 className="text-lg font-bold text-white mb-6">Commitment Levels & Benefits</h4>
                    <div className="grid grid-cols-4 gap-6">
                        {Object.entries(COMMITMENT_LABELS).map(([level, label]) => {
                            const numLevel = parseInt(level) as CommitmentLevel
                            const maxFunding = [5, 25, 100, 500][numLevel]
                            const fee = [2.5, 2.0, 1.5, 1.0][numLevel]

                            return (
                                <div key={level} className="text-center">
                                    <div className={`w-12 h-12 rounded-full ${COMMITMENT_COLORS[numLevel]} flex items-center justify-center text-white font-bold text-lg mx-auto mb-3`}>
                                        {parseInt(level) + 1}
                                    </div>
                                    <div className="text-white font-semibold mb-2">{label}</div>
                                    <div className="text-xs text-gray-400 space-y-1">
                                        <div>Max: {maxFunding} ETH</div>
                                        <div>Fee: {fee}%</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>
                        All templates are customizable. Higher commitment levels require verification but offer better terms.
                    </p>
                </div>
            </div>
        </div>
    )
}