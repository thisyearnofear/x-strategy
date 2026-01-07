/**
 * Criteria Block
 * Pill-based criteria builder with flexible rule engine
 */

import React from 'react'
import { Criterion } from './StrategyBuilder'
import { BlockContainer, BlockHeader } from './primitives'

interface CriteriaBlockProps {
  criteria: Criterion[]
  onChange: (criteria: Criterion[]) => void
}

const CRITERION_TEMPLATES = {
  social: [
    { field: 'Twitter followers', operator: '>=' as const, value: 10000 },
    { field: 'Farcaster followers', operator: '>=' as const, value: 1000 },
    { field: 'Instagram followers', operator: '>=' as const, value: 25000 },
    { field: 'YouTube subscribers', operator: '>=' as const, value: 50000 },
    { field: 'Spotify monthly streams', operator: '>=' as const, value: 100000 },
  ],
  onchain: [
    { field: 'Token deployed', operator: '=' as const, value: 'yes' },
    { field: 'NFT collection created', operator: '=' as const, value: 'yes' },
    { field: 'Transactions count', operator: '>=' as const, value: 100 },
    { field: 'Wallet age (days)', operator: '>=' as const, value: 365 },
  ],
  credential: [
    { field: 'Verified athlete', operator: '=' as const, value: 'yes' },
    { field: 'YC batch', operator: 'IN' as const, value: [] },
    { field: 'KYC verified', operator: '=' as const, value: 'yes' },
    { field: 'Age', operator: '>=' as const, value: 18 },
  ],
  custom: [
    { field: 'Exit amount (USD)', operator: '>=' as const, value: 50000000 },
    { field: 'Market cap (USD)', operator: '>=' as const, value: 100000000 },
    { field: 'Active users', operator: '>=' as const, value: 1000 },
  ],
}

export default function CriteriaBlock({ criteria, onChange }: CriteriaBlockProps) {
  const [showAddMenu, setShowAddMenu] = React.useState(false)

  const addCriterion = (type: 'social' | 'onchain' | 'credential' | 'custom', template: any) => {
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      type,
      field: template.field,
      operator: template.operator,
      value: template.value,
      enabled: true,
    }
    onChange([...criteria, newCriterion])
    setShowAddMenu(false)
  }

  const removeCriterion = (id: string) => {
    onChange(criteria.filter(c => c.id !== id))
  }

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    onChange(criteria.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const toggleCriterion = (id: string) => {
    onChange(criteria.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))
  }

  return (
    <BlockContainer>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">📋</div>
        <h3 className="text-xl font-bold text-white">Criteria</h3>
        <span className="text-sm text-gray-500">(Who qualifies?)</span>
      </div>

      <div className="space-y-3">
        {/* Existing criteria */}
        {criteria.map((criterion) => (
          <div
            key={criterion.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              criterion.enabled
                ? 'bg-gray-900/50 border-gray-700'
                : 'bg-gray-900/20 border-gray-800 opacity-50'
            }`}
          >
            {/* Enable/disable checkbox */}
            <button
              onClick={() => toggleCriterion(criterion.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                criterion.enabled
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-transparent border-gray-600'
              }`}
            >
              {criterion.enabled && <span className="text-white text-xs">✓</span>}
            </button>

            {/* Field */}
            <input
              type="text"
              value={criterion.field}
              onChange={(e) => updateCriterion(criterion.id, { field: e.target.value })}
              className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!criterion.enabled}
            />

            {/* Operator */}
            <select
              value={criterion.operator}
              onChange={(e) => updateCriterion(criterion.id, { operator: e.target.value as any })}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!criterion.enabled}
            >
              <option value=">">&gt;</option>
              <option value=">=">&gt;=</option>
              <option value="<">&lt;</option>
              <option value="<=">&lt;=</option>
              <option value="=">=</option>
              <option value="IN">IN</option>
              <option value="NOT IN">NOT IN</option>
            </select>

            {/* Value */}
            {criterion.operator === 'IN' || criterion.operator === 'NOT IN' ? (
              <input
                type="text"
                value={Array.isArray(criterion.value) ? criterion.value.join(', ') : criterion.value}
                onChange={(e) => updateCriterion(criterion.id, { value: e.target.value.split(',').map(v => v.trim()) })}
                placeholder="W06, S06, W07..."
                className="flex-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!criterion.enabled}
              />
            ) : (
              <input
                type={typeof criterion.value === 'number' ? 'number' : 'text'}
                value={criterion.value}
                onChange={(e) => updateCriterion(criterion.id, { 
                  value: typeof criterion.value === 'number' ? parseFloat(e.target.value) : e.target.value 
                })}
                className="w-32 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!criterion.enabled}
              />
            )}

            {/* Type badge */}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              criterion.type === 'social' ? 'bg-blue-900/50 text-blue-400' :
              criterion.type === 'onchain' ? 'bg-purple-900/50 text-purple-400' :
              criterion.type === 'credential' ? 'bg-green-900/50 text-green-400' :
              'bg-gray-700 text-gray-400'
            }`}>
              {criterion.type}
            </span>

            {/* Delete button */}
            <button
              onClick={() => removeCriterion(criterion.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              🗑️
            </button>
          </div>
        ))}

        {/* Add criterion button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full px-4 py-3 bg-gray-900/50 hover:bg-gray-900 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Add Criterion</span>
          </button>

          {/* Add menu dropdown */}
          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-10 max-h-96 overflow-y-auto">
              {/* Social */}
              <div className="p-3 border-b border-gray-700">
                <div className="text-xs font-semibold text-blue-400 mb-2">SOCIAL</div>
                {CRITERION_TEMPLATES.social.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => addCriterion('social', template)}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 rounded transition-colors mb-1"
                  >
                    {template.field} {template.operator} {template.value}
                  </button>
                ))}
              </div>

              {/* On-Chain */}
              <div className="p-3 border-b border-gray-700">
                <div className="text-xs font-semibold text-purple-400 mb-2">ON-CHAIN</div>
                {CRITERION_TEMPLATES.onchain.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => addCriterion('onchain', template)}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 rounded transition-colors mb-1"
                  >
                    {template.field} {template.operator} {template.value}
                  </button>
                ))}
              </div>

              {/* Credentials */}
              <div className="p-3 border-b border-gray-700">
                <div className="text-xs font-semibold text-green-400 mb-2">CREDENTIALS</div>
                {CRITERION_TEMPLATES.credential.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => addCriterion('credential', template)}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 rounded transition-colors mb-1"
                  >
                    {template.field} {template.operator} {Array.isArray(template.value) ? '[...]' : template.value}
                  </button>
                ))}
              </div>

              {/* Custom */}
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-400 mb-2">CUSTOM</div>
                {CRITERION_TEMPLATES.custom.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => addCriterion('custom', template)}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 rounded transition-colors mb-1"
                  >
                    {template.field} {template.operator} {template.value.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {criteria.length > 0 && (
          <div className="p-3 bg-gray-900/50 rounded-lg text-sm text-gray-400">
            {criteria.filter(c => c.enabled).length} criteria active
            {criteria.filter(c => !c.enabled).length > 0 && (
              <span className="text-gray-600">
                {' '}({criteria.filter(c => !c.enabled).length} disabled)
              </span>
            )}
          </div>
        )}
      </div>
    </BlockContainer>
  )
}
