/**
 * Economics Block
 * Interactive sliders for funding, stake, and timeline
 */

import React from 'react'
import { BlockContainer, BlockHeader } from './primitives'

interface EconomicsBlockProps {
  targetFunding: number
  creatorStake: number
  timeline: number
  onChange: (updates: Partial<{
    targetFunding: number
    creatorStake: number
    timeline: number
  }>) => void
}

export default function EconomicsBlock({ targetFunding, creatorStake, timeline, onChange }: EconomicsBlockProps) {
  const protocolFee = targetFunding * 0.02 // 2%
  const contributorAmount = targetFunding - protocolFee
  const stakeReturn = creatorStake * 1.1 // 10% bonus
  const slashAmount = creatorStake * 0.5 // 50% slashed on failure

  return (
    <BlockContainer>
      <BlockHeader icon="💰" title="Economics" />

      <div className="space-y-6">
        {/* Target Funding */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Target Funding</label>
            <span className="text-2xl font-bold text-white">
              ${targetFunding.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={targetFunding}
            onChange={(e) => onChange({ targetFunding: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$10K</span>
            <span>$250K</span>
            <span>$500K</span>
          </div>
        </div>

        {/* Creator Stake */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">
              Your Stake <span className="text-gray-600">(min 10%)</span>
            </label>
            <span className="text-2xl font-bold text-white">
              ${creatorStake.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={targetFunding * 0.1}
            max={targetFunding * 0.3}
            step="1000"
            value={creatorStake}
            onChange={(e) => onChange({ creatorStake: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>20%</span>
            <span>30%</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Refundable if successful • {((creatorStake / targetFunding) * 100).toFixed(1)}% of target
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
          <div className="text-sm font-semibold text-white mb-3">Breakdown:</div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Contributors receive:</span>
            <span className="text-white font-semibold">${contributorAmount.toLocaleString()} worth of tokens</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Protocol fee (2%):</span>
            <span className="text-white font-semibold">${protocolFee.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-gray-700 my-2" />
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Your stake:</span>
            <span className="text-white font-semibold">${creatorStake.toLocaleString()}</span>
          </div>
          
          <div className="bg-green-900/20 border border-green-900/50 rounded p-2 text-xs">
            <div className="text-green-400 font-semibold mb-1">✓ If successful:</div>
            <div className="text-green-300">You receive ${stakeReturn.toLocaleString()} (stake + 10% bonus)</div>
          </div>
          
          <div className="bg-red-900/20 border border-red-900/50 rounded p-2 text-xs">
            <div className="text-red-400 font-semibold mb-1">✕ If failed:</div>
            <div className="text-red-300">You lose ${slashAmount.toLocaleString()} (50% slashed)</div>
            <div className="text-red-300/70">Remaining ${slashAmount.toLocaleString()} returned</div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
          <div className="text-sm font-semibold text-blue-400 mb-2">Risk Analysis</div>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Stake shows commitment and aligns incentives</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Contributors protected with automated downside</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">ℹ</span>
              <span>Success rate for similar strategies: ~78%</span>
            </div>
          </div>
        </div>
      </div>
    </BlockContainer>
  )
}
