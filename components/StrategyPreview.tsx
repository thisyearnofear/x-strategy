import React from "react";
import { Strategy } from "../lib/types/strategy";

interface StrategyPreviewProps {
  strategy: Strategy;
  onOpenDetails: () => void;
  onDismiss: () => void;
}

export default function StrategyPreview({
  strategy,
  onOpenDetails,
  onDismiss,
}: StrategyPreviewProps) {
  // Prevent click propagation to canvas
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
      {/* Overlay to catch clicks outside the preview card */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onDismiss}
      />

      {/* Preview Card - positioned below the 3D card (which is centered) */}
      <div
        className="relative mt-[450px] pointer-events-auto animate-fadeInUp"
        onClick={handleContainerClick}
      >
        <div className="bg-white dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 w-[90vw] max-w-md mx-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {strategy.title}
                </h3>
                {strategy.creator.reputationScore &&
                  strategy.creator.reputationScore > 80 && (
                    <span className="text-blue-500" title="Verified Creator">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.604.3 1.166.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                by{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {strategy.creator.username}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full mb-1">
                {strategy.fundingPercentage}% Funded
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {strategy.daysRemaining}d left
              </span>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mb-4 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${strategy.fundingPercentage}%` }}
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">
            {strategy.description}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onOpenDetails}
              className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Back this Outcome</span>
              <span className="text-xs opacity-60 font-normal">
                in {strategy.token.symbol}
              </span>
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
