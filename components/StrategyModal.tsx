/**
 * Strategy Detail Modal
 * Expanded view of strategy details when a card is clicked
 */

import React, { useEffect, useState } from "react";
import { Strategy, StrategyStatus } from "../lib/types/strategy";

interface StrategyModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserAddress?: string;
  onOptIn?: (strategyId: string, stake: bigint) => Promise<void>;
  onContribute?: (strategyId: string, amount: bigint) => Promise<void>;
}

export default function StrategyModal({
  strategy,
  isOpen,
  onClose,
  currentUserAddress,
  onOptIn,
  onContribute,
}: StrategyModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [contributionAmount, setContributionAmount] = useState<string>("0.1");

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !strategy) return null;

  const statusColors = {
    [StrategyStatus.PENDING_CREATOR]: "bg-yellow-500",
    [StrategyStatus.ACTIVE]: "bg-blue-500",
    [StrategyStatus.ENDING_SOON]: "bg-red-500",
    [StrategyStatus.COMPLETED_SUCCESS]: "bg-green-500",
    [StrategyStatus.COMPLETED_FAILURE]: "bg-gray-500",
    [StrategyStatus.UNWINDING]: "bg-orange-500",
    [StrategyStatus.CANCELLED]: "bg-gray-600",
    [StrategyStatus.DRAFT]: "bg-gray-400",
  };

  const statusColor = statusColors[strategy.status] || "bg-gray-500";

  const handleOptInClick = async () => {
    if (!onOptIn) return;
    try {
      setIsProcessing(true);
      await onOptIn(strategy.id, strategy.creatorStake);
      setIsProcessing(false);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const handleContributeClick = async () => {
    if (!onContribute) return;
    try {
      setIsProcessing(true);
      // Convert to BigInt (simplified for UI)
      const amountWei = BigInt(parseFloat(contributionAmount) * 1e18);
      await onContribute(strategy.id, amountWei);
      setIsProcessing(false);
      alert(
        "Contribution Pending! The Operator will execute your swap shortly."
      );
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const isDesignatedCreator =
    currentUserAddress &&
    strategy.designatedCreator &&
    currentUserAddress.toLowerCase() ===
      strategy.designatedCreator.toLowerCase();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/80 z-40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 p-6 flex justify-between items-start z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`${statusColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm`}
                >
                  {strategy.status.replace("_", " ").toUpperCase()}
                </span>
                {strategy.trending && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    🔥 TRENDING
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {strategy.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                by{" "}
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {strategy.creator.displayName || strategy.creator.username}
                </span>
                {strategy.creator.reputationScore && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                    ⭐ {strategy.creator.reputationScore} reputation
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Token & Creator Info */}
            <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-4">
                {strategy.token.logoUrl && (
                  <img
                    src={strategy.token.logoUrl}
                    alt={strategy.token.name}
                    className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                  />
                )}
                <div>
                  <div className="text-gray-900 dark:text-white font-bold text-lg">
                    {strategy.token.name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {strategy.token.symbol}
                  </div>
                </div>
              </div>
              {strategy.creator.avatarUrl && (
                <div className="flex items-center gap-3 ml-auto">
                  <img
                    src={strategy.creator.avatarUrl}
                    alt={strategy.creator.username}
                    className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-sm"
                  />
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-white font-semibold">
                      {strategy.creator.displayName ||
                        strategy.creator.username}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {strategy.creator.strategiesCompleted}/
                      {strategy.creator.strategiesCreated} completed
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Outcome
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {strategy.description}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  How this creates upside
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by {strategy.token.symbol}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="text-gray-900 dark:text-white font-semibold mb-1">
                    Back early
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    You contribute capital to fund the strategy’s execution.
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="text-gray-900 dark:text-white font-semibold mb-1">
                    Milestones verify
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    As milestones complete, value unlocks to contributors.
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="text-gray-900 dark:text-white font-semibold mb-1">
                    Protections apply
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Auto-unwind and slippage limits help manage downside.
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-4">
                <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-unwind
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white font-semibold">
                    {strategy.automation.autoUnwindEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Slippage limit
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white font-semibold">
                    {strategy.automation.slippageLimit}%
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Liquidity checks
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white font-semibold">
                    {strategy.automation.liquidityCheckEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                </div>
              </div>
            </div>

            {/* Timelines and Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Timeline
                </div>
                <div className="text-gray-900 dark:text-white text-2xl font-bold">
                  {strategy.daysRemaining !== undefined
                    ? `${strategy.daysRemaining}d remaining`
                    : strategy.hoursRemaining !== undefined
                    ? `${strategy.hoursRemaining}h remaining`
                    : "Completed"}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  Funding
                </div>
                <div className="text-gray-900 dark:text-white text-2xl font-bold">
                  {strategy.fundingPercentage}%
                </div>
                <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  ${strategy.currentAmountUSD?.toLocaleString()} / $
                  {strategy.targetAmountUSD?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${statusColor} transition-all duration-500`}
                  style={{ width: `${strategy.fundingPercentage}%` }}
                />
              </div>
            </div>

            {/* Action Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-1">
                Back This Outcome
              </h3>
              <div className="text-sm text-gray-400 mb-4">
                Contribute now; upside tracks the creator/app coin if the
                outcome succeeds.
              </div>

              {strategy.status === StrategyStatus.PENDING_CREATOR ? (
                <div className="space-y-4">
                  {isDesignatedCreator ? (
                    <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-lg">
                      <p className="text-yellow-200 mb-2">
                        You are the designated creator for this strategy.
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        To activate it, you must opt-in by staking{" "}
                        <strong>
                          {Number(strategy.creatorStake) / 1e18} ETH
                        </strong>
                        . This stake ensures alignment and is refunded upon
                        success.
                      </p>
                      <button
                        onClick={handleOptInClick}
                        disabled={isProcessing}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isProcessing
                          ? "Processing Opt-In..."
                          : "✅ Opt In & Stake"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-800 rounded-lg">
                      <p className="text-gray-400">
                        Waiting for <strong>{strategy.creator.username}</strong>{" "}
                        to opt-in.
                      </p>
                    </div>
                  )}
                </div>
              ) : strategy.status === StrategyStatus.ACTIVE ? (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="ETH to escrow"
                    />
                    <button
                      onClick={handleContributeClick}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                    >
                      {isProcessing ? "Processing..." : "Back with ETH"}
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    ⚠️ Funds are swapped by Operator to {strategy.token.symbol}{" "}
                    and pending confirmation. Funds held in escrow.
                  </p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <span className="text-gray-400">
                    Strategy is {strategy.status.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Milestones
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:border-l-2 before:border-gray-100 dark:before:border-gray-800 before:pointer-events-none">
                {strategy.milestones.map((milestone, idx) => (
                  <div key={idx} className="relative pl-10">
                    <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-gray-900 z-10 ${
                      milestone.status === 'completed' 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {milestone.status === 'completed' && (
                        <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <h5 className={`font-bold ${milestone.status === 'completed' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {milestone.title}
                      </h5>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        milestone.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {milestone.status === 'completed' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {milestone.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal Streams */}
            {strategy.hasActiveSignals && (
              <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/30">
                <h3 className="text-lg font-bold text-white mb-2">
                  🛰️ Signal Streams Available
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {strategy.signalCount} creator signals published. Stake tokens
                  to unlock access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
