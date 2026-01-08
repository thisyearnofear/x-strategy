/**
 * Simplified Strategy Builder - Party Protocol Inspired
 * Focus on group coordination for existing token investment
 */

import React, { useState } from 'react'
import { SimplifiedStrategy, CommitmentLevel, ExitStrategy } from '../../lib/types/strategy'
import SimplifiedTemplateLibrary from './SimplifiedTemplateLibrary'
import CoordinationBlock from './CoordinationBlock'
import CommitmentBlock from './CommitmentBlock'
import InvestmentBlock from './InvestmentBlock'
import StakeBlock from './StakeBlock'
import SimplifiedPreview from './SimplifiedPreview'

interface SimplifiedStrategyBuilderProps {
    isOpen: boolean
    onClose: () => void
    onPublish?: (strategy: Partial<SimplifiedStrategy>) => void
}

export interface StrategyDraft {
    // Group Coordination
    targetDescription: string
    targetCount: number
    targetPlatform: string

    // Commitment
    commitmentLevel: CommitmentLevel
    commitmentProof?: string
    targetCommitments?: string[]

    // Investment
    targetToken: string
    fundingThreshold: number // In ETH for UI
    targetAmount: number // In ETH for UI

    // Stakes
    nativeTokenStake: number
    ethStake: number

    // Timeline & Exit
    fundingDays: number
    executionDays: number
    exitStrategy: ExitStrategy

    // Features
    chatEnabled: boolean
    signalStreamEnabled: boolean
    governanceEnabled: boolean
}

const EMPTY_DRAFT: StrategyDraft = {
    targetDescription: 'professional footballers',
    targetCount: 3,
    targetPlatform: 'Zora',
    commitmentLevel: CommitmentLevel.CLAIMED,
    targetToken: '',
    fundingThreshold: 1, // 1 ETH minimum
    targetAmount: 5, // 5 ETH target
    nativeTokenStake: 100,
    ethStake: 0.1,
    fundingDays: 7,
    executionDays: 30,
    exitStrategy: ExitStrategy.GOVERNANCE_VOTE,
    chatEnabled: true,
    signalStreamEnabled: true,
    governanceEnabled: true,
}

export default function SimplifiedStrategyBuilder({
    isOpen,
    onClose,
    onPublish
}: SimplifiedStrategyBuilderProps) {
    const [step, setStep] = useState<'template' | 'build'>('template')
    const [draft, setDraft] = useState<StrategyDraft>(EMPTY_DRAFT)

    if (!isOpen) return null

    const handleTemplateSelect = (template: Partial<StrategyDraft>) => {
        setDraft({ ...EMPTY_DRAFT, ...template })
        setStep('build')
    }

    const handleStartFromScratch = () => {
        setDraft(EMPTY_DRAFT)
        setStep('build')
    }

    const updateDraft = (updates: Partial<StrategyDraft>) => {
        setDraft({ ...draft, ...updates })
    }

    const handlePublish = () => {
        if (onPublish) {
            // Convert draft to SimplifiedStrategy format
            const strategy: Partial<SimplifiedStrategy> = {
                targetDescription: `${draft.targetCount} ${draft.targetDescription} to ${draft.targetPlatform}`,
                targetCount: draft.targetCount,
                targetPlatform: draft.targetPlatform,
                commitmentLevel: draft.commitmentLevel,
                commitmentProof: draft.commitmentProof,
                targetToken: draft.targetToken,
                fundingThreshold: BigInt(Math.floor(draft.fundingThreshold * 1e18)),
                targetAmount: BigInt(Math.floor(draft.targetAmount * 1e18)),
                creatorNativeTokenStake: BigInt(draft.nativeTokenStake),
                creatorETHStake: BigInt(Math.floor(draft.ethStake * 1e18)),
                fundingDeadline: Date.now() + (draft.fundingDays * 24 * 60 * 60 * 1000),
                executionDeadline: Date.now() + ((draft.fundingDays + draft.executionDays) * 24 * 60 * 60 * 1000),
                exitStrategy: draft.exitStrategy,
                chatEnabled: draft.chatEnabled,
                signalStreamEnabled: draft.signalStreamEnabled,
                governanceEnabled: draft.governanceEnabled,
            }

            onPublish(strategy)
        }
    }

    // Calculate tier based on commitment level
    const getTier = () => {
        switch (draft.commitmentLevel) {
            case CommitmentLevel.CLAIMED: return 1
            case CommitmentLevel.SIGNALED: return 2
            case CommitmentLevel.CONFIRMED: return 3
            case CommitmentLevel.ESCROWED: return 4
            default: return 1
        }
    }

    const tier = getTier()
    const maxFunding = [5, 25, 100, 500][tier - 1] // ETH limits by tier
    const fee = [2.5, 2.0, 1.5, 1.0][tier - 1] // Fee % by tier

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/90 z-50 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Builder */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
                <div
                    className="w-full h-full max-w-[1400px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700 pointer-events-auto flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                {step === 'template' ? 'Choose Strategy Type' : 'Build Your Coordination Strategy'}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {step === 'template'
                                    ? 'Group coordination for existing token investment'
                                    : `Tier ${tier} Strategy • Max ${maxFunding} ETH • ${fee}% fee`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {step === 'template' ? (
                            <SimplifiedTemplateLibrary
                                onSelectTemplate={handleTemplateSelect}
                                onStartFromScratch={handleStartFromScratch}
                            />
                        ) : (
                            <div className="h-full flex">
                                {/* Builder Panel (Left 65%) */}
                                <div className="w-[65%] h-full overflow-y-auto p-8 space-y-6">
                                    <CoordinationBlock
                                        targetCount={draft.targetCount}
                                        targetDescription={draft.targetDescription}
                                        targetPlatform={draft.targetPlatform}
                                        onChange={(updates) => updateDraft(updates)}
                                    />

                                    <CommitmentBlock
                                        commitmentLevel={draft.commitmentLevel}
                                        commitmentProof={draft.commitmentProof}
                                        targetCommitments={draft.targetCommitments}
                                        onChange={(updates) => updateDraft(updates)}
                                    />

                                    <InvestmentBlock
                                        targetToken={draft.targetToken}
                                        fundingThreshold={draft.fundingThreshold}
                                        targetAmount={draft.targetAmount}
                                        maxFunding={maxFunding}
                                        onChange={(updates) => updateDraft(updates)}
                                    />

                                    <StakeBlock
                                        nativeTokenStake={draft.nativeTokenStake}
                                        ethStake={draft.ethStake}
                                        fundingDays={draft.fundingDays}
                                        executionDays={draft.executionDays}
                                        exitStrategy={draft.exitStrategy}
                                        tier={tier}
                                        fee={fee}
                                        onChange={(updates) => updateDraft(updates)}
                                    />
                                </div>

                                {/* Preview Panel (Right 35%) */}
                                <div className="w-[35%] h-full bg-gray-900/50 border-l border-gray-700 p-6">
                                    <SimplifiedPreview
                                        draft={draft}
                                        tier={tier}
                                        fee={fee}
                                        maxFunding={maxFunding}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer (Build mode only) */}
                    {step === 'build' && (
                        <div className="flex items-center justify-between px-8 py-6 border-t border-gray-700">
                            <button
                                onClick={() => setStep('template')}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ← Back to Templates
                            </button>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        localStorage.setItem('simplified-strategy-draft', JSON.stringify(draft))
                                        alert('Draft saved!')
                                    }}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={!draft.targetToken || draft.targetAmount < draft.fundingThreshold}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                                >
                                    Launch Strategy →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}