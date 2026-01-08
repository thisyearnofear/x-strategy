import React, { useEffect } from "react";
import { Strategy } from "../lib/types/strategy";

interface StrategyFullscreenProps {
  strategy: Strategy;
  onDismiss: () => void;
}

export default function StrategyFullscreen({
  strategy,
  onDismiss,
}: StrategyFullscreenProps) {
  // Handle Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDismiss]);

  // Prevent click propagation to canvas
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      onClick={onDismiss}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
        onClick={onDismiss}
      />

      {/* Fullscreen Card */}
      <div
        className="relative pointer-events-auto w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={handleContainerClick}
      >
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.1)] overflow-hidden">
          {/* Header with close button */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 p-4 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {strategy.title}
            </h2>
            <button
              onClick={onDismiss}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <svg 
                className="w-6 h-6 text-gray-900 dark:text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8">
            {/* Media */}
            <div className="relative h-64 md:h-80 bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-8">
              {strategy.token.logoUrl && (
                <img
                  src={strategy.token.logoUrl}
                  alt={strategy.token.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full">
                  Active Strategy
                </span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-500 border border-gray-200 dark:border-white/10 rounded-full">
                {strategy.creator.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  Created by
                </p>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  @{strategy.creator.username}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {strategy.description}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                  Backers
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {(strategy.fundingPercentage || 0) > 0
                    ? Math.floor((strategy.fundingPercentage || 0) * 1.5)
                    : 12}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                  Funding
                </p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-500">
                  {strategy.fundingPercentage || 0}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                  Target
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  ${strategy.targetAmountUSD?.toLocaleString() || '50,000'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                  Timeline
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {strategy.timeline || 30}d
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-8">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">
                Milestones
              </h3>
              <div className="space-y-3">
                {strategy.milestones?.map((milestone, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-white/10"
                  >
                    <span className="font-bold text-gray-900 dark:text-white">
                      {milestone.name}
                    </span>
                    <span className="font-black text-blue-600 dark:text-blue-500">
                      {milestone.unlockPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
              <button className="flex-1 bg-black dark:bg-white text-white dark:text-black font-black py-4 uppercase tracking-[0.2em] text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
                Back Outcome
              </button>
              <button className="flex-1 py-4 text-sm font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-[0.2em] transition-colors border border-gray-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20">
                Share Strategy
              </button>
            </div>
          </div>

          {/* Bottom Protocol Info */}
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-xs">
            <span className="font-mono text-zinc-400 uppercase">
              Contract: 0x{strategy.id.substring(2, 8)}...
              {strategy.id.substring(strategy.id.length - 4)}
            </span>
            <span className="font-mono text-zinc-400 uppercase">
              v1.0.4-coordinated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}