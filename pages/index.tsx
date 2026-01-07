import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import App from "../lib/main";
import StrategyModal from "../components/StrategyModal";
import NavigationHUD from "../components/NavigationHUD";
import StrategyBuilder from "../components/builder/StrategyBuilder";
import ActivityToast from "../components/ActivityToast";
import { Strategy } from "../lib/types/strategy";
import { STRATEGIES } from "../lib/data/strategies";
import {
  XStrategyABI,
  XStrategyFactoryABI,
  FACTORY_ADDRESS,
} from "../lib/abis";

import { useTheme } from "next-themes";
import StrategyPreview from "../components/StrategyPreview";

export default function Home() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [focusedStrategy, setFocusedStrategy] = useState<Strategy | null>(null);
  const [showPreviewUI, setShowPreviewUI] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [strategies] = useState<Strategy[]>(STRATEGIES);
  const [app, setApp] = useState<App | null>(null);
  const { theme, resolvedTheme } = useTheme();

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [isZenMode, setIsZenMode] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const newApp = new App();
    setApp(newApp);

    if (newApp.canvas && newApp.canvas.planes) {
      // Focus callback - Show preview
      newApp.canvas.focusManager?.onFocus((instanceId) => {
        const strategyIndex = instanceId % strategies.length;
        setFocusedStrategy(strategies[strategyIndex]);
        newApp.canvas.planes.setPaused(true);

        // Delay UI appearance to match 3D animation
        setTimeout(() => {
          setShowPreviewUI(true);
        }, 400);
      });

      // Unfocus callback - Hide preview
      newApp.canvas.focusManager?.onUnfocus(() => {
        setShowPreviewUI(false);
        setTimeout(() => {
          setFocusedStrategy(null);
        }, 300);
        newApp.canvas.planes.setPaused(false);
      });

      // Keep click callback for immediate interaction if needed
      // (Currently we use focus system primarily)
      newApp.canvas.planes.setClickCallback((instanceId) => {
        // This is redundant if focus system handles it, but good backup
        // If already focused, the focusManager handles the click to unfocus
      });
    }
    return () => {};
  }, [strategies]);

  // Update theme in Canvas
  useEffect(() => {
    if (app && app.canvas) {
      app.canvas.setTheme(resolvedTheme || "dark");
    }
  }, [app, resolvedTheme]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Don't unfocus immediately to allow "Back" to preview
    // But usually closing modal means we want to go back to gallery?
    // User said: "tap out and the gallery keeps scrolling horizontally"
    // So closing modal should probably unfocus entirely.
    if (app && app.canvas && app.canvas.focusManager) {
      app.canvas.focusManager.unfocusCard();
    }
  };

  const handleOpenDetails = () => {
    if (focusedStrategy) {
      setSelectedStrategy(focusedStrategy);
      setIsModalOpen(true);
    }
  };

  const handleDismissPreview = () => {
    if (app && app.canvas && app.canvas.focusManager) {
      app.canvas.focusManager.unfocusCard();
    }
  };

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handleCreateStrategy = () => {
    setIsBuilderOpen(true);
  };

  // Deploy Strategy via Factory
  const handlePublishStrategy = async (strategy: any) => {
    console.log("Publishing strategy:", strategy);
    try {
      // Map strategy draft to Contract arguments
      // Note: strategy contains draft data directly here via builder callback
      const unlockBps = strategy.milestones.map(
        (m: any) => m.unlockPercentage * 100
      );

      const tx = await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: XStrategyFactoryABI,
        functionName: "createStrategy",
        args: [
          strategy.token.address ||
            "0x0000000000000000000000000000000000000000", // Mock if missing
          strategy.designatedCreator || address, // Default to self if missing
          BigInt(strategy.targetAmountUSD || 0) * BigInt(1e18), // Rough map
          BigInt(
            Math.floor(Date.now() / 1000) + (strategy.timeline || 30) * 86400
          ),
          unlockBps,
        ],
      });

      setIsBuilderOpen(false);
      alert(`Strategy Deployed! TX: ${tx}`);
    } catch (e) {
      console.error(e);
      alert("Deployment failed. See console.");
    }
  };

  // Interactions
  const handleOptIn = async (strategyId: string, stake: bigint) => {
    // Assuming strategyId is the address for MVP, or we need a map
    // For now, let's treat ID as address if it starts with 0x, otherwise mock or error
    if (!strategyId.startsWith("0x")) {
      alert("Strategy address not found (Mock ID).");
      return;
    }

    await writeContractAsync({
      address: strategyId as `0x${string}`,
      abi: XStrategyABI,
      functionName: "optIn",
      value: stake,
    });
  };

  const handleContribute = async (strategyId: string, amount: bigint) => {
    if (!strategyId.startsWith("0x")) {
      alert("Strategy address not found (Mock ID).");
      return;
    }

    await writeContractAsync({
      address: strategyId as `0x${string}`,
      abi: XStrategyABI,
      functionName: "contribute",
      value: amount,
    });
  };

  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
  };

  return (
    <>
      <Head>
        <title>
          X-Strategy | Transforming Tokens Into Coordination Instruments
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Transform tokens from speculative assets into powerful coordination instruments for outcome-backed capital coordination with automated protection."
        />
      </Head>

      {/* 3D Canvas */}
      <canvas id="webgl" className="fixed inset-0 z-0 outline-none" />

      {!isZenMode && (
        <>
          <ActivityToast />

          {/* Navigation HUD */}
          <NavigationHUD
            onCreateStrategy={handleCreateStrategy}
            onFilterChange={handleFilterChange}
          />

          {/* Strategy Preview (Intermediate State) */}
          {focusedStrategy && showPreviewUI && !isModalOpen && (
            <StrategyPreview
              strategy={focusedStrategy}
              onOpenDetails={handleOpenDetails}
              onDismiss={handleDismissPreview}
            />
          )}

          {/* Strategy Detail Modal */}
          <StrategyModal
            strategy={selectedStrategy}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            currentUserAddress={address}
            onOptIn={handleOptIn}
            onContribute={handleContribute}
          />

          {/* Strategy Builder */}
          <StrategyBuilder
            isOpen={isBuilderOpen}
            onClose={() => setIsBuilderOpen(false)}
            onPublish={handlePublishStrategy}
          />
        </>
      )}

      {/* Zen Mode Toggle (Always Visible or Floating) */}
      <button
        onClick={() => setIsZenMode(!isZenMode)}
        className="fixed bottom-6 right-6 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all shadow-xl group"
        aria-label="Toggle Zen Mode"
      >
        <div className="flex items-center gap-2 px-1">
          <span className="text-lg">{isZenMode ? "🖥️" : "✨"}</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            {isZenMode ? "Show Interface" : "Zen Mode"}
          </span>
        </div>
      </button>
    </>
  );
}
