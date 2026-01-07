import React from 'react'

interface BlockContainerProps {
  children: React.ReactNode
  className?: string
}

export function BlockContainer({ children, className = '' }: BlockContainerProps) {
  return (
    <div className={`bg-gray-800/50 rounded-2xl p-6 border border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

interface BlockHeaderProps {
  icon: string
  title: string
}

export function BlockHeader({ icon, title }: BlockHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="text-3xl">{icon}</div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
  )
}
