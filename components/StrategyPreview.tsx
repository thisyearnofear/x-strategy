import React from "react";
import { Strategy } from "../lib/types/strategy";

interface StrategyPreviewProps {
  strategy: Strategy;
  onOpenDetails: () => void;
  onExpand: () => void;
  onDismiss: () => void;
}

export default function StrategyPreview({
  strategy,
  onOpenDetails,
  onExpand,
  onDismiss,
}: StrategyPreviewProps) {
  // Prevent click propagation to canvas
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-end pointer-events-none p-6 md:p-12 md:pr-24">
      {/* Overlay to catch clicks outside the preview card */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onDismiss}
      />

      {/* Preview Card - Farcaster/Zora Inspired aesthetic */}
      <div
        className="relative pointer-events-auto animate-fadeInRight w-full max-w-sm"
        onClick={handleContainerClick}
      >
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)] overflow-hidden">
          {/* Header Media / Protocol Banner */}
          <div className="relative h-48 bg-gray-100 dark:bg-zinc-900 overflow-hidden">
            {strategy.token.logoUrl && (
              <img
                src={strategy.token.logoUrl}
                alt={strategy.token.name}
                className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Active Strategy
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Title & Creator */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-2 uppercase">
                {strategy.title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500 border border-gray-200 dark:border-white/10">
                  {strategy.creator.username.substring(0, 2).toUpperCase()}
                </div>
                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  Created by{" "}
                  <span className="text-gray-900 dark:text-white">
                    @{strategy.creator.username}
                  </span>
                </p>
              </div>
            </div>

            {/* Protocol Stats Grid */}
            <div className="grid grid-cols-2 gap-[1px] bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 mb-6">
              <div className="bg-white dark:bg-black p-4">
                <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                  Backers
                </p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  {(strategy.fundingPercentage || 0) > 0
                    ? Math.floor((strategy.fundingPercentage || 0) * 1.5)
                    : 12}
                </p>
              </div>
              <div className="bg-white dark:bg-black p-4">
                <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                  Funding
                </p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-500">
                  {strategy.fundingPercentage || 0}%
                </p>
              </div>
            </div>

            {/* Description (Farcaster "Cast" style) */}
            <div className="mb-8 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-2 italic">
                "{strategy.description}"
              </p>
            </div>

            {/* Action Buttons (Zora Style) */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenDetails}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-4 uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
              >
                <span>Back Outcome</span>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={onExpand}
                className="w-full py-3 text-[10px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-[0.3em] transition-colors border border-gray-200 dark:border-white/10"
              >
                [ Expand View ]
              </button>
              <button
                onClick={onDismiss}
                className="w-full py-3 text-[10px] font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-[0.3em] transition-colors"
              >
                [ Dismiss ]
              </button>
            </div>
          </div>

          {/* Bottom Protocol Info */}
          <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
            <span className="text-[8px] font-mono text-zinc-400 uppercase">
              Contract: 0x{strategy.id.substring(2, 8)}...
              {strategy.id.substring(strategy.id.length - 4)}
            </span>
            <span className="text-[8px] font-mono text-zinc-400 uppercase">
              v1.0.4-coordinated
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeInRight {
          animation: fadeInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
