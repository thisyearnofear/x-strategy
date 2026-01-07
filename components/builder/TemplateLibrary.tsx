/**
 * Template Library
 * Pre-built strategy templates for quick start
 */

import React from 'react'
import { StrategyDraft, Criterion, MilestoneDraft } from './StrategyBuilder'
import { StrategyCategory } from '../../lib/types/strategy'

interface TemplateLibraryProps {
  onSelectTemplate: (template: Partial<StrategyDraft>) => void
  onStartFromScratch: () => void
}

interface Template {
  id: string
  name: string
  icon: string
  description: string
  example: string
  draft: Partial<StrategyDraft>
  color: string
}

const TEMPLATES: Template[] = [
  {
    id: 'onboarding',
    name: 'Onboarding',
    icon: '🎯',
    description: 'Bring users to a platform',
    example: 'Lane Rettig: 3 footballers to Zora',
    color: 'from-blue-500 to-cyan-500',
    draft: {
      targetCount: 3,
      targetDescription: 'professional footballers',
      targetPlatform: 'Zora',
      timeline: 30,
      category: StrategyCategory.SPORTS,
      criteria: [
        {
          id: '1',
          type: 'social',
          field: 'Twitter followers',
          operator: '>=',
          value: 10000,
          enabled: true,
        },
        {
          id: '2',
          type: 'credential',
          field: 'Professional athlete',
          operator: '=',
          value: 'verified',
          enabled: true,
        },
      ],
      milestones: [
        {
          id: '1',
          title: 'First User Onboarded',
          description: 'Onboard first user and launch their profile',
          targetDay: 10,
          unlockPercentage: 33,
          verifications: ['Profile created', 'Verified account'],
        },
        {
          id: '2',
          title: 'Second User Onboarded',
          description: 'Onboard second user',
          targetDay: 20,
          unlockPercentage: 33,
          verifications: ['Profile created', 'Verified account'],
        },
        {
          id: '3',
          title: 'Final User Onboarded',
          description: 'Complete all onboardings',
          targetDay: 30,
          unlockPercentage: 34,
          verifications: ['All profiles active', 'Minimum engagement met'],
        },
      ],
      targetFunding: 50000,
      creatorStake: 5000,
    },
  },
  {
    id: 'appcoin',
    name: 'App Coin Launch',
    icon: '🚀',
    description: 'Launch mini apps with tokens',
    example: 'Papa Jams: 5 Farcaster mini apps',
    color: 'from-purple-500 to-pink-500',
    draft: {
      targetCount: 5,
      targetDescription: 'Farcaster mini apps with coins',
      targetPlatform: 'Farcaster',
      timeline: 60,
      category: StrategyCategory.TECH,
      criteria: [
        {
          id: '1',
          type: 'onchain',
          field: 'App coin deployed',
          operator: '=',
          value: 'yes',
          enabled: true,
        },
        {
          id: '2',
          type: 'custom',
          field: 'Active users',
          operator: '>=',
          value: 200,
          enabled: true,
        },
      ],
      milestones: [
        {
          id: '1',
          title: 'First App Launched',
          description: 'Launch first mini app with 200+ users',
          targetDay: 20,
          unlockPercentage: 30,
          verifications: ['App deployed', 'Coin launched', '200+ users'],
        },
        {
          id: '2',
          title: 'Apps 2-3 Launched',
          description: 'Launch second and third apps',
          targetDay: 40,
          unlockPercentage: 30,
          verifications: ['Both apps live', '150+ users each'],
        },
        {
          id: '3',
          title: 'All Apps + 1K Users',
          description: 'Launch final apps and hit user milestone',
          targetDay: 60,
          unlockPercentage: 40,
          verifications: ['5 apps live', '1000+ total users'],
        },
      ],
      targetFunding: 80000,
      creatorStake: 10000,
    },
  },
  {
    id: 'yc-founders',
    name: 'YC Founders',
    icon: '🏢',
    description: 'Onboard successful founders',
    example: 'Garry Tan: Founders with $50M+ exits',
    color: 'from-orange-500 to-red-500',
    draft: {
      targetCount: 10,
      targetDescription: 'YC founders with $50M+ exits',
      targetPlatform: 'Farcaster',
      timeline: 60,
      category: StrategyCategory.TECH,
      criteria: [
        {
          id: '1',
          type: 'credential',
          field: 'YC batch',
          operator: 'IN',
          value: ['W06', 'S06', 'W07', 'S07', 'W08', 'S08'],
          enabled: true,
        },
        {
          id: '2',
          type: 'custom',
          field: 'Exit amount',
          operator: '>=',
          value: 50000000,
          enabled: true,
        },
        {
          id: '3',
          type: 'social',
          field: 'Twitter followers',
          operator: '>=',
          value: 5000,
          enabled: true,
        },
      ],
      milestones: [
        {
          id: '1',
          title: 'First 3 Founders',
          description: 'Onboard first 3 qualifying founders',
          targetDay: 20,
          unlockPercentage: 30,
          verifications: ['Farcaster profiles created', 'Identity verified'],
        },
        {
          id: '2',
          title: 'Next 4 Founders',
          description: 'Onboard 4 more founders',
          targetDay: 40,
          unlockPercentage: 30,
          verifications: ['7 total founders', 'All profiles active'],
        },
        {
          id: '3',
          title: 'Final 3 + Engagement',
          description: 'Complete onboarding and ensure engagement',
          targetDay: 60,
          unlockPercentage: 40,
          verifications: ['10 founders', 'Average 5+ casts per founder'],
        },
      ],
      targetFunding: 200000,
      creatorStake: 20000,
    },
  },
  {
    id: 'musicians',
    name: 'Musicians',
    icon: '🎵',
    description: 'Onboard artists with streaming stats',
    example: '10 musicians with 100K+ monthly streams',
    color: 'from-green-500 to-teal-500',
    draft: {
      targetCount: 10,
      targetDescription: 'musicians with 100K+ monthly streams',
      targetPlatform: 'Zora',
      timeline: 45,
      category: StrategyCategory.MUSIC,
      criteria: [
        {
          id: '1',
          type: 'social',
          field: 'Spotify monthly streams',
          operator: '>=',
          value: 100000,
          enabled: true,
        },
        {
          id: '2',
          type: 'social',
          field: 'Instagram followers',
          operator: '>=',
          value: 25000,
          enabled: true,
        },
      ],
      milestones: [
        {
          id: '1',
          title: 'First 3 Artists',
          description: 'Onboard first 3 musicians',
          targetDay: 15,
          unlockPercentage: 30,
          verifications: ['Zora profiles', 'NFT collection launched'],
        },
        {
          id: '2',
          title: 'Next 4 Artists',
          description: 'Onboard 4 more musicians',
          targetDay: 30,
          unlockPercentage: 30,
          verifications: ['7 total artists', 'Collections have sales'],
        },
        {
          id: '3',
          title: 'Final 3 + Engagement',
          description: 'Complete onboarding and hit engagement targets',
          targetDay: 45,
          unlockPercentage: 40,
          verifications: ['10 artists', 'Average $5K+ in sales per artist'],
        },
      ],
      targetFunding: 75000,
      creatorStake: 7500,
    },
  },
  {
    id: 'creators',
    name: 'Content Creators',
    icon: '📹',
    description: 'Onboard YouTubers/TikTokers',
    example: 'Creators with 50K+ subscribers',
    color: 'from-red-500 to-pink-500',
    draft: {
      targetCount: 15,
      targetDescription: 'content creators with 50K+ subscribers',
      targetPlatform: 'Lens Protocol',
      timeline: 90,
      category: StrategyCategory.ENTERTAINMENT,
      criteria: [
        {
          id: '1',
          type: 'social',
          field: 'YouTube subscribers',
          operator: '>=',
          value: 50000,
          enabled: true,
        },
        {
          id: '2',
          type: 'social',
          field: 'TikTok followers',
          operator: '>=',
          value: 100000,
          enabled: false,
        },
      ],
      milestones: [
        {
          id: '1',
          title: 'First 5 Creators',
          description: 'Onboard first batch',
          targetDay: 30,
          unlockPercentage: 33,
          verifications: ['Lens profiles created', 'First posts published'],
        },
        {
          id: '2',
          title: 'Next 5 Creators',
          description: 'Onboard second batch',
          targetDay: 60,
          unlockPercentage: 33,
          verifications: ['10 total creators', 'Active posting'],
        },
        {
          id: '3',
          title: 'Final 5 + Engagement',
          description: 'Complete and hit engagement metrics',
          targetDay: 90,
          unlockPercentage: 34,
          verifications: ['15 creators', '1000+ total followers'],
        },
      ],
      targetFunding: 100000,
      creatorStake: 10000,
    },
  },
  {
    id: 'custom',
    name: 'Custom Strategy',
    icon: '✨',
    description: 'Build from scratch',
    example: 'Start with a blank canvas',
    color: 'from-gray-500 to-gray-600',
    draft: {
      targetCount: 3,
      targetDescription: 'users',
      targetPlatform: 'Platform',
      timeline: 30,
      category: StrategyCategory.OTHER,
      criteria: [],
      milestones: [],
      targetFunding: 50000,
      creatorStake: 5000,
    },
  },
]

export default function TemplateLibrary({ onSelectTemplate, onStartFromScratch }: TemplateLibraryProps) {
  return (
    <div className="h-full overflow-y-auto p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-3">Choose Your Strategy Type</h3>
          <p className="text-gray-400">
            Start with a template and customize, or build from scratch
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-3 gap-6">
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
                {/* Icon */}
                <div className="text-5xl mb-4">{template.icon}</div>

                {/* Name */}
                <h4 className="text-xl font-bold text-white mb-2">
                  {template.name}
                </h4>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-3">
                  {template.description}
                </p>

                {/* Example */}
                <div className="bg-gray-900/50 rounded-lg px-3 py-2 text-xs text-gray-500">
                  <span className="text-gray-600">Example:</span><br />
                  {template.example}
                </div>

                {/* Stats (if not custom) */}
                {template.id !== 'custom' && (
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <div>
                      <span className="text-gray-600">Target:</span>{' '}
                      {template.draft.targetCount} {template.draft.targetDescription}
                    </div>
                    <div>
                      <span className="text-gray-600">Timeline:</span>{' '}
                      {template.draft.timeline}d
                    </div>
                  </div>
                )}

                {/* Use Button (appears on hover) */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`px-4 py-2 bg-gradient-to-r ${template.color} text-white font-semibold rounded-lg text-center text-sm`}>
                    {template.id === 'custom' ? 'Start Building' : 'Use This Template'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            All templates are fully customizable. You can modify any field after selection.
          </p>
        </div>
      </div>
    </div>
  )
}
