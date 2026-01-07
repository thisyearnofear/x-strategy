/**
 * Target Block
 * Dynamic, magnetic text inputs for defining strategy target
 */

import React from 'react'
import { BlockContainer, BlockHeader } from './primitives'

interface TargetBlockProps {
  targetCount: number
  targetDescription: string
  targetPlatform: string
  timeline: number
  onChange: (updates: Partial<{
    targetCount: number
    targetDescription: string
    targetPlatform: string
    timeline: number
  }>) => void
}

const COMMON_TARGETS = [
  'professional footballers',
  'YC founders with exits >$50M',
  'musicians with 100K+ streams',
  'content creators with 50K+ subscribers',
  'developers with 1K+ GitHub stars',
  'artists with museum shows',
  'athletes in NBA/NFL/EPL',
  'designers with 10K+ Dribbble followers',
]

const PLATFORMS = [
  'Zora',
  'Farcaster',
  'Lens Protocol',
  'Base',
  'Optimism',
  'Arbitrum',
]

export default function TargetBlock({
  targetCount,
  targetDescription,
  targetPlatform,
  timeline,
  onChange,
}: TargetBlockProps) {
  const [showTargetSuggestions, setShowTargetSuggestions] = React.useState(false)
  const [showPlatformSuggestions, setShowPlatformSuggestions] = React.useState(false)

  return (
    <BlockContainer>
      <BlockHeader icon="🎯" title="Target" />

      <div className="space-y-4">
        {/* Main sentence builder */}
        <div className="flex flex-wrap items-center gap-2 text-lg">
          <span className="text-gray-400">Onboard</span>
          
          {/* Count input */}
          <input
            type="number"
            value={targetCount}
            onChange={(e) => onChange({ targetCount: parseInt(e.target.value) || 1 })}
            className="w-16 px-3 py-2 bg-gray-900 border border-blue-500/50 rounded-lg text-white font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="1000"
          />
          
          {/* Description input with suggestions */}
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              value={targetDescription}
              onChange={(e) => onChange({ targetDescription: e.target.value })}
              onFocus={() => setShowTargetSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTargetSuggestions(false), 200)}
              placeholder="type of users..."
              className="w-full px-4 py-2 bg-gray-900 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Suggestions dropdown */}
            {showTargetSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10 max-h-60 overflow-y-auto">
                {COMMON_TARGETS.filter(t => 
                  t.toLowerCase().includes(targetDescription.toLowerCase())
                ).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange({ targetDescription: suggestion })
                      setShowTargetSuggestions(false)
                    }}
                    className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors text-sm border-b border-gray-700 last:border-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <span className="text-gray-400">to</span>
          
          {/* Platform input with suggestions */}
          <div className="relative">
            <input
              type="text"
              value={targetPlatform}
              onChange={(e) => onChange({ targetPlatform: e.target.value })}
              onFocus={() => setShowPlatformSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPlatformSuggestions(false), 200)}
              placeholder="platform"
              className="w-40 px-4 py-2 bg-gray-900 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            {/* Platform suggestions */}
            {showPlatformSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10">
                {PLATFORMS.map((platform, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange({ targetPlatform: platform })
                      setShowPlatformSuggestions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors text-sm border-b border-gray-700 last:border-0"
                  >
                    {platform}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <span className="text-gray-400">within</span>
          
          {/* Timeline input */}
          <input
            type="number"
            value={timeline}
            onChange={(e) => onChange({ timeline: parseInt(e.target.value) || 1 })}
            className="w-20 px-3 py-2 bg-gray-900 border border-green-500/50 rounded-lg text-white font-semibold text-center focus:outline-none focus:ring-2 focus:ring-green-500"
            min="1"
            max="365"
          />
          
          <span className="text-gray-400">days</span>
        </div>

        {/* Preview sentence */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-500 mb-1">Your strategy:</div>
          <div className="text-white font-medium">
            Onboard <span className="text-blue-400">{targetCount}</span>{' '}
            <span className="text-blue-400">{targetDescription}</span> to{' '}
            <span className="text-purple-400">{targetPlatform}</span> within{' '}
            <span className="text-green-400">{timeline}</span> days
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          <div className="text-xs text-gray-500">Quick presets:</div>
          <button
            onClick={() => onChange({ timeline: 7 })}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
          >
            1 week
          </button>
          <button
            onClick={() => onChange({ timeline: 30 })}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
          >
            1 month
          </button>
          <button
            onClick={() => onChange({ timeline: 60 })}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
          >
            2 months
          </button>
          <button
            onClick={() => onChange({ timeline: 90 })}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
          >
            3 months
          </button>
        </div>
      </div>
    </BlockContainer>
  )
}
