/**
 * Milestone Composer
 * Interactive timeline with draggable milestones
 */

import React from 'react'
import { MilestoneDraft } from './StrategyBuilder'
import { BlockContainer, BlockHeader } from './primitives'

interface MilestoneComposerProps {
  milestones: MilestoneDraft[]
  timeline: number
  onChange: (milestones: MilestoneDraft[]) => void
}

export default function MilestoneComposer({ milestones, timeline, onChange }: MilestoneComposerProps) {
  const addMilestone = () => {
    const newMilestone: MilestoneDraft = {
      id: Date.now().toString(),
      title: `Milestone ${milestones.length + 1}`,
      description: '',
      targetDay: Math.floor(timeline / (milestones.length + 2)),
      unlockPercentage: Math.floor(100 / (milestones.length + 1)),
      verifications: [],
    }
    
    // Rebalance unlock percentages
    const totalMilestones = milestones.length + 1
    const basePercentage = Math.floor(100 / totalMilestones)
    const remainder = 100 - (basePercentage * totalMilestones)
    
    const updatedMilestones = milestones.map((m, i) => ({
      ...m,
      unlockPercentage: basePercentage + (i === totalMilestones - 1 ? remainder : 0),
    }))
    
    onChange([...updatedMilestones, { ...newMilestone, unlockPercentage: basePercentage + remainder }])
  }

  const removeMilestone = (id: string) => {
    const remaining = milestones.filter(m => m.id !== id)
    
    // Rebalance percentages
    if (remaining.length > 0) {
      const basePercentage = Math.floor(100 / remaining.length)
      const remainder = 100 - (basePercentage * remaining.length)
      onChange(remaining.map((m, i) => ({
        ...m,
        unlockPercentage: basePercentage + (i === remaining.length - 1 ? remainder : 0),
      })))
    } else {
      onChange([])
    }
  }

  const updateMilestone = (id: string, updates: Partial<MilestoneDraft>) => {
    onChange(milestones.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  const addVerification = (id: string, verification: string) => {
    const milestone = milestones.find(m => m.id === id)
    if (milestone) {
      updateMilestone(id, { verifications: [...milestone.verifications, verification] })
    }
  }

  const removeVerification = (id: string, index: number) => {
    const milestone = milestones.find(m => m.id === id)
    if (milestone) {
      updateMilestone(id, { 
        verifications: milestone.verifications.filter((_, i) => i !== index) 
      })
    }
  }

  return (
    <BlockContainer>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🎯</div>
        <h3 className="text-xl font-bold text-white">Milestones</h3>
        <span className="text-sm text-gray-500">(Progress tracking)</span>
      </div>

      {/* Visual Timeline */}
      {milestones.length > 0 && (
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
          <div className="relative h-20">
            {/* Timeline line */}
            <div className="absolute top-10 left-0 right-0 h-1 bg-gray-700" />
            
            {/* Day markers */}
            <div className="absolute top-0 left-0 text-xs text-gray-500">Day 0</div>
            <div className="absolute top-0 right-0 text-xs text-gray-500">Day {timeline}</div>
            
            {/* Milestone markers */}
            {milestones.map((milestone, index) => {
              const position = (milestone.targetDay / timeline) * 100
              return (
                <div
                  key={milestone.id}
                  className="absolute"
                  style={{ 
                    left: `${position}%`, 
                    top: '28px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-gray-900 relative cursor-pointer hover:scale-110 transition-transform">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap">
                        Day {milestone.targetDay}
                      </div>
                    </div>
                    <div className="absolute top-8 text-xs text-gray-400 whitespace-nowrap">
                      {milestone.unlockPercentage}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Milestone Cards */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start gap-4">
              {/* Milestone number */}
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {index + 1}
              </div>

              <div className="flex-1 space-y-3">
                {/* Title */}
                <input
                  type="text"
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                  placeholder="Milestone title..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Description */}
                <textarea
                  value={milestone.description}
                  onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                  placeholder="Describe what needs to be accomplished..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                {/* Target day and unlock percentage */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Target Day:</label>
                    <input
                      type="number"
                      value={milestone.targetDay}
                      onChange={(e) => updateMilestone(milestone.id, { targetDay: parseInt(e.target.value) || 1 })}
                      min="1"
                      max={timeline}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Unlock:</label>
                    <input
                      type="number"
                      value={milestone.unlockPercentage}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0
                        if (newValue >= 0 && newValue <= 100) {
                          updateMilestone(milestone.id, { unlockPercentage: newValue })
                        }
                      }}
                      min="0"
                      max="100"
                      className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-400">%</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${milestone.unlockPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Verifications */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Verification Requirements:</div>
                  <div className="space-y-1">
                    {milestone.verifications.map((verification, vIndex) => (
                      <div key={vIndex} className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="flex-1 text-sm text-white">{verification}</span>
                        <button
                          onClick={() => removeVerification(milestone.id, vIndex)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const verification = prompt('Add verification requirement:')
                        if (verification) addVerification(milestone.id, verification)
                      }}
                      className="text-sm text-gray-500 hover:text-gray-400"
                    >
                      + Add requirement
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => removeMilestone(milestone.id)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {/* Add milestone button */}
        <button
          onClick={addMilestone}
          className="w-full px-4 py-3 bg-gray-900/50 hover:bg-gray-900 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Add Milestone</span>
        </button>

        {/* Summary */}
        {milestones.length > 0 && (
          <div className="p-3 bg-gray-900/50 rounded-lg text-sm text-gray-400">
            {milestones.length} milestones • Total unlock: {milestones.reduce((sum, m) => sum + m.unlockPercentage, 0)}%
            {milestones.reduce((sum, m) => sum + m.unlockPercentage, 0) !== 100 && (
              <span className="text-yellow-400 ml-2">⚠ Should total 100%</span>
            )}
          </div>
        )}
      </div>
    </BlockContainer>
  )
}
