/**
 * Live Preview
 * Real-time 3D card preview of the strategy being built
 */

import React from 'react'
import { StrategyDraft } from './StrategyBuilder'

interface LivePreviewProps {
  draft: StrategyDraft
}

export default function LivePreview({ draft }: LivePreviewProps) {
  const fundingPercentage = 0 // No funding yet (it's a preview)
  const milestonesCompleted = 0
  const contributorCount = 0

  // Calculate total unlock percentage
  const totalUnlock = draft.milestones.reduce((sum, m) => sum + m.unlockPercentage, 0)
  const unlockValid = totalUnlock === 100

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Live Preview</h3>
        <p className="text-sm text-gray-400">
          See how your strategy will appear in the gallery
        </p>
      </div>

      {/* Card Preview */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* 3D Card Mockup */}
          <div 
            className="w-80 h-80 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl border-4 border-blue-400 transform perspective-1000 rotate-y-5 hover:rotate-y-0 transition-transform duration-300"
            style={{
              transform: 'rotateY(5deg) rotateX(-5deg)',
              boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)',
            }}
          >
            {/* Card Content */}
            <div className="h-full flex flex-col justify-between p-6">
              {/* Top: Title area */}
              <div>
                <div className="text-white font-bold text-xl mb-2">
                  {draft.targetCount} {draft.targetDescription}
                </div>
                <div className="text-blue-200 text-sm">
                  to {draft.targetPlatform}
                </div>
              </div>

              {/* Middle: Stats */}
              <div className="space-y-2 text-white">
                <div className="flex items-center gap-2 text-sm">
                  <span>⏱️</span>
                  <span>{draft.timeline} days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>💰</span>
                  <span>${(draft.targetFunding / 1000).toFixed(0)}K target</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span>🎯</span>
                  <span>{draft.milestones.length} milestones</span>
                </div>
              </div>

              {/* Bottom: Progress bar */}
              <div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-white"
                    style={{ width: `${fundingPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>{fundingPercentage}% funded</span>
                  <span>{contributorCount} contributors</span>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl -z-10" />
          </div>

          {/* Status badge */}
          <div className="absolute -top-3 -right-3 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
            DRAFT
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="mt-6 space-y-4">
        {/* Strategy Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm font-semibold text-white mb-3">Strategy Details</div>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="text-white">{draft.category}</span>
            </div>
            <div className="flex justify-between">
              <span>Criteria:</span>
              <span className="text-white">{draft.criteria.filter(c => c.enabled).length} active</span>
            </div>
            <div className="flex justify-between">
              <span>Milestones:</span>
              <span className={unlockValid ? "text-green-400" : "text-yellow-400"}>
                {draft.milestones.length} ({totalUnlock}% unlock)
                {!unlockValid && " ⚠️"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Your Stake:</span>
              <span className="text-white">${draft.creatorStake.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Validation Warnings */}
        {(!unlockValid || draft.milestones.length === 0 || draft.criteria.length === 0) && (
          <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4">
            <div className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Incomplete</div>
            <div className="space-y-1 text-xs text-yellow-300">
              {draft.milestones.length === 0 && <div>• Add at least one milestone</div>}
              {!unlockValid && <div>• Milestone unlocks must total 100%</div>}
              {draft.criteria.length === 0 && <div>• Add criteria to define who qualifies</div>}
            </div>
          </div>
        )}

        {/* Ready to publish */}
        {unlockValid && draft.milestones.length > 0 && draft.criteria.length > 0 && (
          <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4">
            <div className="text-green-400 text-sm font-semibold mb-1">✓ Ready to Publish</div>
            <div className="text-xs text-green-300">
              Your strategy looks complete and ready to launch!
            </div>
          </div>
        )}

        {/* Share Preview */}
        <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm">
          Share Preview Link
        </button>
      </div>
    </div>
  )
}
