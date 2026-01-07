/**
 * Navigation HUD
 * Minimal overlay for filters, timeline controls, and navigation
 */

import React from 'react'
import { StrategyStatus, StrategyCategory } from '../lib/types/strategy'
import WalletConnect from './WalletConnect'

interface NavigationHUDProps {
  onCreateStrategy?: () => void
  onFilterChange?: (filters: any) => void
  activeFilters?: {
    status?: StrategyStatus[]
    category?: StrategyCategory[]
  }
}

export default function NavigationHUD({ 
  onCreateStrategy, 
  onFilterChange,
  activeFilters = {}
}: NavigationHUDProps) {
  const [showFilters, setShowFilters] = React.useState(false)

  const statusOptions = [
    { value: StrategyStatus.ACTIVE, label: 'Active', color: 'bg-blue-500' },
    { value: StrategyStatus.ENDING_SOON, label: 'Ending Soon', color: 'bg-red-500' },
    { value: StrategyStatus.COMPLETED_SUCCESS, label: 'Completed', color: 'bg-green-500' },
  ]

  const categoryOptions = [
    { value: StrategyCategory.SPORTS, label: 'Sports', icon: '⚽' },
    { value: StrategyCategory.ART, label: 'Art', icon: '🎨' },
    { value: StrategyCategory.MUSIC, label: 'Music', icon: '🎵' },
    { value: StrategyCategory.TECH, label: 'Tech', icon: '💻' },
    { value: StrategyCategory.COMMUNITY, label: 'Community', icon: '👥' },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="pointer-events-auto">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                X-Strategy
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Outcome-Backed Coordination</p>
          </div>

          {/* Wallet Connect */}
          <div className="pointer-events-auto">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="pointer-events-auto bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white font-semibold px-4 py-2 rounded-full border border-gray-600/50 transition-colors text-sm flex items-center gap-2"
            >
              <span>🔍</span>
              <span>Filters</span>
              {(activeFilters.status?.length || 0) + (activeFilters.category?.length || 0) > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {(activeFilters.status?.length || 0) + (activeFilters.category?.length || 0)}
                </span>
              )}
            </button>

            <button className="pointer-events-auto bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white font-semibold px-4 py-2 rounded-full border border-gray-600/50 transition-colors text-sm">
              All Strategies
            </button>

            <button className="pointer-events-auto bg-blue-600/80 backdrop-blur-sm hover:bg-blue-700/80 text-white font-semibold px-4 py-2 rounded-full border border-blue-500/50 transition-colors text-sm">
              🔥 Trending
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-gray-400 text-sm mb-3">
            <span className="bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50">
              <span className="text-blue-400 font-semibold">Drag</span> to explore •{' '}
              <span className="text-purple-400 font-semibold">Scroll</span> to zoom •{' '}
              <span className="text-green-400 font-semibold">Click</span> for details
            </span>
          </div>
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        onClick={onCreateStrategy}
        className="fixed bottom-8 right-8 z-30 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center gap-2"
        style={{ animation: 'pulse 2s infinite' }}
      >
        <span className="text-2xl">+</span>
        <span>Create Strategy</span>
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
          <div
            className="bg-gray-900/95 backdrop-blur-md rounded-t-3xl border-t-2 border-gray-700 p-6 w-full max-w-4xl pointer-events-auto"
            style={{ animation: 'slideUpPanel 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Filter Strategies</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Status Filters */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-400 mb-3">Status</div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      activeFilters.status?.includes(option.value)
                        ? `${option.color} text-white border-transparent`
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      const current = activeFilters.status || []
                      const newStatus = current.includes(option.value)
                        ? current.filter((s) => s !== option.value)
                        : [...current, option.value]
                      onFilterChange?.({ ...activeFilters, status: newStatus })
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-400 mb-3">Category</div>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      activeFilters.category?.includes(option.value)
                        ? 'bg-purple-600 text-white border-transparent'
                        : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      const current = activeFilters.category || []
                      const newCategory = current.includes(option.value)
                        ? current.filter((c) => c !== option.value)
                        : [...current, option.value]
                      onFilterChange?.({ ...activeFilters, category: newCategory })
                    }}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {((activeFilters.status?.length || 0) + (activeFilters.category?.length || 0) > 0) && (
              <button
                onClick={() => onFilterChange?.({})}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        @keyframes slideUpPanel {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
