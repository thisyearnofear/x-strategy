/**
 * Strategy Builder - Main Canvas
 * Visual, interactive strategy composition tool
 */

import React, { useState } from 'react'
import { Strategy, StrategyCategory, TokenType } from '../../lib/types/strategy'
import TemplateLibrary from './TemplateLibrary'
import TargetBlock from './TargetBlock'
import CriteriaBlock from './CriteriaBlock'
import MilestoneComposer from './MilestoneComposer'
import EconomicsBlock from './EconomicsBlock'
import TokenSelector from './TokenSelector'
import LivePreview from './LivePreview'

interface StrategyBuilderProps {
  isOpen: boolean
  onClose: () => void
  onPublish?: (strategy: Partial<Strategy>) => void
}

export interface StrategyDraft {
  // Target
  targetCount: number
  targetDescription: string
  targetPlatform: string
  timeline: number // days
  
  // Criteria
  criteria: Criterion[]
  
  // Milestones
  milestones: MilestoneDraft[]
  
  // Economics
  targetFunding: number
  creatorStake: number
  
  // Token
  tokenConfig: {
    useExisting: boolean
    existingAddress?: string
    newToken?: {
      name: string
      symbol: string
      startingMarketCap: 'LOW' | 'MID' | 'HIGH'
    }
  }
  
  // Category
  category: StrategyCategory
}

export interface Criterion {
  id: string
  type: 'social' | 'onchain' | 'credential' | 'custom'
  field: string
  operator: '>' | '>=' | '<' | '<=' | '=' | 'IN' | 'NOT IN'
  value: string | number | string[]
  enabled: boolean
}

export interface MilestoneDraft {
  id: string
  title: string
  description: string
  targetDay: number
  unlockPercentage: number
  verifications: string[]
}

const EMPTY_DRAFT: StrategyDraft = {
  targetCount: 3,
  targetDescription: 'users',
  targetPlatform: 'Zora',
  timeline: 30,
  criteria: [],
  milestones: [],
  targetFunding: 50000,
  creatorStake: 5000,
  tokenConfig: {
    useExisting: false,
  },
  category: StrategyCategory.SPORTS,
}

export default function StrategyBuilder({ isOpen, onClose, onPublish }: StrategyBuilderProps) {
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

  const handleSaveDraft = () => {
    // Save to localStorage or backend
    localStorage.setItem('strategy-draft', JSON.stringify(draft))
    alert('Draft saved!')
  }

  const handlePublish = () => {
    if (onPublish) {
      // Convert draft to Strategy format
      const strategy: Partial<Strategy> = {
        title: `Onboard ${draft.targetCount} ${draft.targetDescription} to ${draft.targetPlatform}`,
        description: `Strategy to onboard ${draft.targetCount} ${draft.targetDescription} to ${draft.targetPlatform} within ${draft.timeline} days`,
        category: draft.category,
        targetAmountUSD: draft.targetFunding,
        // ... map other fields
      }
      
      onPublish(strategy)
    }
  }

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
          className="w-full h-full max-w-[1600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700 pointer-events-auto flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'slideUp 0.4s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                {step === 'template' ? 'Choose Your Strategy' : 'Build Your Strategy'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {step === 'template' 
                  ? 'Start with a template or build from scratch' 
                  : 'Compose your strategy visually - no forms, just creativity'}
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
              <TemplateLibrary
                onSelectTemplate={handleTemplateSelect}
                onStartFromScratch={handleStartFromScratch}
              />
            ) : (
              <div className="h-full flex">
                {/* Builder Panel (Left 60%) */}
                <div className="w-[60%] h-full overflow-y-auto p-8 space-y-6">
                  <TargetBlock
                    targetCount={draft.targetCount}
                    targetDescription={draft.targetDescription}
                    targetPlatform={draft.targetPlatform}
                    timeline={draft.timeline}
                    onChange={(updates) => updateDraft(updates)}
                  />

                  <CriteriaBlock
                    criteria={draft.criteria}
                    onChange={(criteria) => updateDraft({ criteria })}
                  />

                  <MilestoneComposer
                    milestones={draft.milestones}
                    timeline={draft.timeline}
                    onChange={(milestones) => updateDraft({ milestones })}
                  />

                  <EconomicsBlock
                    targetFunding={draft.targetFunding}
                    creatorStake={draft.creatorStake}
                    timeline={draft.timeline}
                    onChange={(updates) => updateDraft(updates)}
                  />

                  <TokenSelector
                    tokenConfig={draft.tokenConfig}
                    onChange={(tokenConfig) => updateDraft({ tokenConfig })}
                  />
                </div>

                {/* Preview Panel (Right 40%) */}
                <div className="w-[40%] h-full bg-gray-900/50 border-l border-gray-700 p-8">
                  <LivePreview draft={draft} />
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
                  onClick={handleSaveDraft}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Publish Strategy →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}
