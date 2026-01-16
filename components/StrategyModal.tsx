/**
 * Strategy Detail Modal
 * Expanded view of strategy details when a card is clicked
 */

import { useEffect, useState } from "react";
import { Strategy, StrategyStatus } from "../lib/types/strategy";
import { useNotifications, getErrorMessage } from "../lib/hooks/useNotifications";

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
  const { addNotification } = useNotifications();

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

  const handleOptInClick = async () => {
    if (!onOptIn) return;
    try {
      setIsProcessing(true);
      await onOptIn(strategy.id, strategy.creatorStake);
      setIsProcessing(false);
      addNotification({
        type: 'success',
        title: 'Opt-in Successful',
        message: `You have opted into the strategy. The stake will be refunded upon successful completion.`,
      });
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      addNotification({
        type: 'error',
        title: 'Opt-in Failed',
        message: getErrorMessage(e),
      });
    }
  };

  const handleContributeClick = async () => {
    if (!onContribute) return;

    const amount = parseFloat(contributionAmount);

    if (isNaN(amount) || amount <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid contribution amount greater than 0.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const amountWei = BigInt(amount * 1e18);
      await onContribute(strategy.id, amountWei);
      setIsProcessing(false);
      addNotification({
        type: 'success',
        title: 'Contribution Pending',
        message: 'Your contribution has been submitted. The Operator will execute the swap shortly.',
      });
      setContributionAmount("0.1");
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      addNotification({
        type: 'error',
        title: 'Contribution Failed',
        message: getErrorMessage(e),
      });
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
        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 pointer-events-none"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-black w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto pointer-events-auto shadow-[0_0_100px_rgba(0,0,0,0.5)] border-x md:border border-gray-200 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Top Navigation Bar (Farcaster style) */}
          <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-6 py-4 flex justify-between items-center z-20">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                Strategy Protocol / v1.0
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-white/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left Column: Media & Core Info */}
            <div className="flex-1 border-r border-gray-100 dark:border-white/10">
              {/* Media Section (Zora style) */}
              <div className="aspect-square md:aspect-video bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden border-b border-gray-100 dark:border-white/10">
                {strategy.token.logoUrl && (
                  <img
                    src={strategy.token.logoUrl}
                    alt={strategy.token.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
                    {strategy.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white text-[10px] font-mono px-2 py-1 uppercase tracking-widest border border-white/20">
                      {strategy.status.replace("_", " ")}
                    </span>
                    {strategy.trending && (
                      <span className="bg-white text-black text-[10px] font-mono px-2 py-1 uppercase tracking-widest border border-black/20">
                        Trending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-black text-zinc-500 overflow-hidden border border-gray-100 dark:border-white/10">
                    {strategy.creator.avatarUrl ? (
                      <img
                        src={strategy.creator.avatarUrl}
                        alt={strategy.creator.username}
                        className="w-full h-full object-cover grayscale"
                      />
                    ) : (
                      strategy.creator.username.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">
                      Proposed by
                    </p>
                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      @{strategy.creator.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] border-b border-gray-100 dark:border-white/10 pb-4">
                    [ Outcome Description ]
                  </h2>
                  <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {strategy.description}
                  </p>
                </div>

                {/* Milestones Section (Protocol Checklist) */}
                <div className="mt-16 space-y-8">
                  <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] border-b border-gray-100 dark:border-white/10 pb-4">
                    [ Verification Milestones ]
                  </h2>
                  <div className="space-y-4">
                    {strategy.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="flex gap-6 items-start p-4 border border-gray-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20"
                      >
                        <div
                          className={`mt-1 w-5 h-5 flex-shrink-0 border-2 ${
                            milestone.status === "completed"
                              ? "bg-black dark:bg-white border-black dark:border-white"
                              : "border-zinc-300 dark:border-zinc-700"
                          } flex items-center justify-center`}
                        >
                          {milestone.status === "completed" && (
                            <svg
                              className="w-3 h-3 text-white dark:text-black"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="4"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-black uppercase tracking-tight ${
                              milestone.status === "completed"
                                ? "text-gray-900 dark:text-white"
                                : "text-zinc-400"
                            }`}
                          >
                            {milestone.title}
                          </p>
                          <p className="text-sm text-zinc-500 mt-1 italic">
                            {milestone.description}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-[9px] font-mono text-zinc-400 uppercase">
                            {milestone.status === "completed"
                              ? "Verified"
                              : "Locked"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Stats */}
            <div className="w-full md:w-[400px] bg-zinc-50 dark:bg-zinc-950 p-8 md:p-12 space-y-12">
              {/* Stats Grid (Modular Blocks) */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 p-6">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">
                    Current Funding
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">
                      {strategy.fundingPercentage || 0}%
                    </span>
                    <span className="text-xs font-bold text-zinc-400 uppercase">
                      of Target
                    </span>
                  </div>
                  <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 mt-4 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-1000"
                      style={{ width: `${strategy.fundingPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 p-6">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">
                    Time Remaining
                  </p>
                  <span className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {strategy.daysRemaining || 0} Days
                  </span>
                </div>
              </div>

              {/* Action Area (Brutalist style) */}
              <div className="space-y-6">
                {strategy.status === StrategyStatus.PENDING_CREATOR ? (
                  <div className="p-6 bg-yellow-600/5 border border-yellow-600/20">
                    {isDesignatedCreator ? (
                      <>
                        <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-[0.2em] mb-4">
                          Creator Opt-In Required
                        </p>
                        <p className="text-sm text-zinc-500 mb-6 font-medium">
                          To activate this strategy, you must stake{" "}
                          <strong>
                            {Number(strategy.creatorStake) / 1e18} ETH
                          </strong>
                          . This stake ensures alignment and is refunded upon
                          success.
                        </p>
                        <button
                          onClick={handleOptInClick}
                          disabled={isProcessing}
                          className="w-full bg-yellow-600 text-white py-5 font-black uppercase tracking-[0.3em] text-sm hover:bg-yellow-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isProcessing ? "Processing..." : "Opt In & Stake"}
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">
                          Status: Pending Creator
                        </p>
                        <p className="text-sm text-zinc-500 font-medium">
                          Waiting for @{strategy.creator.username} to opt-in.
                        </p>
                      </div>
                    )}
                  </div>
                ) : strategy.status === StrategyStatus.ACTIVE ? (
                  <div className="p-6 bg-blue-600/5 border border-blue-600/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                        Back with {strategy.token.symbol}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Balance: --
                      </span>
                    </div>
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full bg-white dark:bg-black border-2 border-black dark:border-white p-4 text-2xl font-black text-gray-900 dark:text-white focus:outline-none mb-4"
                      placeholder="0.00"
                    />
                    <button
                      onClick={handleContributeClick}
                      disabled={isProcessing}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-5 font-black uppercase tracking-[0.3em] text-sm hover:invert transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isProcessing ? "Executing..." : "Confirm Backing"}
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-center">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                      Strategy {strategy.status.replace("_", " ")}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-4">
                    Your contribution is protected by the Strategy Protocol.
                  </p>
                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                        Auto-Unwind
                      </p>
                      <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                        ENABLED
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                        Slippage
                      </p>
                      <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                        1.0%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Stats Grid (Zora/Farcaster Style) */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-[1px] bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10">
                  <div className="bg-white dark:bg-black p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                      Backers
                    </p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {strategy.contributorCount || 124}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-black p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                      Casts
                    </p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {strategy.castCount
                        ? `${(strategy.castCount / 1000).toFixed(1)}k`
                        : "8.2k"}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-black p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                      Verifiers
                    </p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {Math.floor((strategy.contributorCount || 124) * 0.3)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-black p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-400 mb-1">
                      Signals
                    </p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">
                      {strategy.signalCount || 0}
                    </p>
                  </div>
                </div>

                {/* Technical Metadata Footer */}
                <div className="pt-8 border-t border-gray-100 dark:border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                      Contract Address
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      0x{strategy.id.substring(2, 8)}...
                      {strategy.id.substring(strategy.id.length - 4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                      Protocol Version
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      v1.0.4-COORDINATED
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                      Network
                    </span>
                    <span className="text-[10px] font-mono text-blue-500 uppercase">
                      {strategy.token.chain} Mainnet
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
