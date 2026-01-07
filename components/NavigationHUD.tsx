/**
 * Navigation HUD
 * Minimal overlay for filters, timeline controls, and navigation
 */

import React from "react";
import { StrategyStatus, StrategyCategory } from "../lib/types/strategy";
import WalletConnect from "./WalletConnect";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NavigationHUDProps {
  onCreateStrategy?: () => void;
  onFilterChange?: (filters: any) => void;
  activeFilters?: {
    status?: StrategyStatus[];
    category?: StrategyCategory[];
  };
}

export default function NavigationHUD({
  onCreateStrategy,
  onFilterChange,
  activeFilters = {},
}: NavigationHUDProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showExplainer, setShowExplainer] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed =
      typeof window !== "undefined" &&
      window.localStorage.getItem("xstrategy_explainer_dismissed") === "1";
    if (!dismissed) setShowExplainer(true);
  }, []);

  const [onboardingStep, setOnboardingStep] = useState(0);
  const onboardingContent = [
    {
      title: "Outcome-Backed Coordination",
      description:
        "X-Strategy transforms tokens from speculative assets into instruments for verifiable outcomes. No more empty hype.",
      icon: "🎯",
    },
    {
      title: "Verifiable Milestones",
      description:
        "Contributors back outcomes. Capital is only unlocked when milestones are verified on-chain, ensuring accountability.",
      icon: "⚖️",
    },
    {
      title: "Automated Protections",
      description:
        "Built-in auto-unwind and slippage limits protect your downside if coordination goals aren't met.",
      icon: "🛡️",
    },
  ];

  const dismissExplainer = () => {
    window.localStorage.setItem("xstrategy_explainer_dismissed", "1");
    setShowExplainer(false);
  };

  const nextOnboarding = () => {
    if (onboardingStep < onboardingContent.length - 1) {
      setOnboardingStep((s) => s + 1);
    } else {
      dismissExplainer();
    }
  };

  if (!mounted) return null;

  const statusOptions = [
    { value: StrategyStatus.ACTIVE, label: "Active", color: "bg-blue-500" },
    {
      value: StrategyStatus.ENDING_SOON,
      label: "Ending Soon",
      color: "bg-red-500",
    },
    {
      value: StrategyStatus.COMPLETED_SUCCESS,
      label: "Completed",
      color: "bg-green-500",
    },
  ];

  const categoryOptions = [
    { value: StrategyCategory.SPORTS, label: "Sports", icon: "⚽" },
    { value: StrategyCategory.ART, label: "Art", icon: "🎨" },
    { value: StrategyCategory.MUSIC, label: "Music", icon: "🎵" },
    { value: StrategyCategory.TECH, label: "Tech", icon: "💻" },
    { value: StrategyCategory.COMMUNITY, label: "Community", icon: "👥" },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="pointer-events-auto group">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter transition-transform group-hover:scale-[1.02]">
              <span className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                X-STRATEGY
              </span>
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Network Active
                </p>
              </div>
              <button
                onClick={() => setShowExplainer(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                Docs
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {/* Wallet Connect */}
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
              className="pointer-events-auto bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white font-semibold px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600/50 transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
              <span>🔍</span>
              <span>Filters</span>
              {(activeFilters.status?.length || 0) +
                (activeFilters.category?.length || 0) >
                0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {(activeFilters.status?.length || 0) +
                    (activeFilters.category?.length || 0)}
                </span>
              )}
            </button>

            <button className="pointer-events-auto bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-900 dark:text-white font-semibold px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600/50 transition-colors text-sm shadow-sm">
              All Strategies
            </button>

            <button className="pointer-events-auto bg-blue-600/90 backdrop-blur-sm hover:bg-blue-700/90 text-white font-semibold px-4 py-2 rounded-full border border-blue-500/50 transition-colors text-sm shadow-sm">
              🔥 Trending
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-3">
            <span className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700/50 shadow-sm">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                Drag
              </span>{" "}
              to explore •{" "}
              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                Scroll
              </span>{" "}
              to zoom •{" "}
              <span className="text-green-600 dark:text-green-400 font-semibold">
                Click
              </span>{" "}
              to back outcomes
            </span>
          </div>
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        onClick={onCreateStrategy}
        className="fixed bottom-8 right-8 z-30 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center gap-2"
        style={{ animation: "pulse 2s infinite" }}
      >
        <span className="text-2xl">+</span>
        <span>Create Strategy</span>
      </button>

      {/* Onboarding Explainer */}
      {showExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md transition-all">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-2xl">
                  {onboardingContent[onboardingStep].icon}
                </div>
                <div className="flex gap-1">
                  {onboardingContent.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === onboardingStep
                          ? "w-4 bg-blue-500"
                          : "w-1 bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                {onboardingContent[onboardingStep].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {onboardingContent[onboardingStep].description}
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              {onboardingStep > 0 && (
                <button
                  onClick={() => setOnboardingStep((s) => s - 1)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={nextOnboarding}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
              >
                {onboardingStep === onboardingContent.length - 1
                  ? "Start Exploring"
                  : "Next Step"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
          <div
            className="bg-white dark:bg-gray-900/95 backdrop-blur-md rounded-t-3xl border-t border-gray-200 dark:border-gray-700 p-6 w-full max-w-4xl pointer-events-auto shadow-2xl"
            style={{ animation: "slideUpPanel 0.3s ease-out" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Filter Strategies
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Status Filters */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Status
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      activeFilters.status?.includes(option.value)
                        ? `${option.color} text-white border-transparent shadow-md`
                        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      const current = activeFilters.status || [];
                      const newStatus = current.includes(option.value)
                        ? current.filter((s) => s !== option.value)
                        : [...current, option.value];
                      onFilterChange?.({ ...activeFilters, status: newStatus });
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Category
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      activeFilters.category?.includes(option.value)
                        ? "bg-purple-600 text-white border-transparent shadow-md"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      const current = activeFilters.category || [];
                      const newCategory = current.includes(option.value)
                        ? current.filter((c) => c !== option.value)
                        : [...current, option.value];
                      onFilterChange?.({
                        ...activeFilters,
                        category: newCategory,
                      });
                    }}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(activeFilters.status?.length || 0) +
              (activeFilters.category?.length || 0) >
              0 && (
              <button
                onClick={() => onFilterChange?.({})}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm underline underline-offset-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
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
  );
}
