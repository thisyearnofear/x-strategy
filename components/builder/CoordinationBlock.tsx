/**
 * Coordination Block
 * Define who you're coordinating and where
 */

import React from 'react'
import { BlockContainer, BlockHeader } from './primitives'

interface CoordinationBlockProps {
    targetCount: number
    targetDescription: string
    targetPlatform: string
    onChange: (updates: Partial<{
        targetCount: number
        targetDescription: string
        targetPlatform: string
    }>) => void
}

const COMMON_TARGETS = [
    'professional footballers',
    'YC founders with $50M+ exits',
    'musicians with 100K+ streams',
    'content creators with 50K+ subscribers',
    'developers with 1K+ GitHub stars',
    'artists with museum shows',
    'verified influencers',
    'crypto founders',
]

const PLATFORMS = [
    'Zora',
    'Farcaster',
    'Lens Protocol',
    'Base',
    'Optimism',
    'Arbitrum',
    'Polygon',
    'Ethereum',
]

export default function CoordinationBlock({
    targetCount,
    targetDescription,
    targetPlatform,
    onChange
}: CoordinationBlockProps) {
    return (
        <BlockContainer>
            <BlockHeader icon="🎯" title="Group Coordination" />

            <div className="space-y-6">
                {/* Natural Language Builder */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                    <div className="text-lg text-white mb-4">
                        Coordinate{' '}
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={targetCount}
                            onChange={(e) => onChange({ targetCount: parseInt(e.target.value) || 1 })}
                            className="inline-block w-16 px-2 py-1 bg-blue-600 text-white text-center rounded font-bold mx-1"
                        />
                        <input
                            type="text"
                            value={targetDescription}
                            onChange={(e) => onChange({ targetDescription: e.target.value })}
                            className="inline-block bg-transparent border-b-2 border-blue-600 text-blue-400 font-semibold px-2 py-1 mx-1 focus:outline-none focus:border-blue-400"
                            placeholder="target description"
                        />
                        to join{' '}
                        <input
                            type="text"
                            value={targetPlatform}
                            onChange={(e) => onChange({ targetPlatform: e.target.value })}
                            className="inline-block bg-transparent border-b-2 border-purple-600 text-purple-400 font-semibold px-2 py-1 mx-1 focus:outline-none focus:border-purple-400"
                            placeholder="platform"
                        />
                    </div>

                    <div className="text-sm text-gray-400">
                        This creates a coordination strategy for group investment in an existing token
                    </div>
                </div>

                {/* Quick Suggestions */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Target Suggestions */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Common Targets:</label>
                        <div className="space-y-2">
                            {COMMON_TARGETS.map((target) => (
                                <button
                                    key={target}
                                    onClick={() => onChange({ targetDescription: target })}
                                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${targetDescription === target
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {target}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Platform Suggestions */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Platforms:</label>
                        <div className="space-y-2">
                            {PLATFORMS.map((platform) => (
                                <button
                                    key={platform}
                                    onClick={() => onChange({ targetPlatform: platform })}
                                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${targetPlatform === platform
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {platform}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Count Presets */}
                <div>
                    <label className="block text-sm text-gray-400 mb-3">Quick Count:</label>
                    <div className="flex gap-2">
                        {[1, 3, 5, 10, 15, 25, 50].map((count) => (
                            <button
                                key={count}
                                onClick={() => onChange({ targetCount: count })}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${targetCount === count
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
                    <div className="text-blue-400 text-sm font-semibold mb-2">Strategy Preview:</div>
                    <div className="text-blue-300">
                        "Coordinate {targetCount} {targetDescription} to join {targetPlatform} through collective token investment"
                    </div>
                </div>
            </div>
        </BlockContainer>
    )
}