import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import App from "../lib/main";
import StrategyModal from "../components/StrategyModal";
import NavigationHUD from "../components/NavigationHUD";
import SimplifiedStrategyBuilder from "../components/builder/SimplifiedStrategyBuilder";
import ActivityToast from "../components/ActivityToast";
import { Strategy, SimplifiedStrategy } from "../lib/types/strategy";
import { STRATEGIES } from "../lib/data/strategies";
import {
  XStrategyABI,
  XStrategyFactoryABI,
  FACTORY_ADDRESS,
} from "../lib/abis";

import { useTheme } from "next-themes";
import StrategyPreview from "../components/StrategyPreview";
import StrategyFullscreen from "../components/StrategyFullscreen";

export default function Home() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [focusedStrategy, setFocusedStrategy] = useState<Strategy | null>(null);
  const [showPreviewUI, setShowPreviewUI] = useState(false);
  const [isExpandedView, setIsExpandedView] = useState(false);
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
    return () => { };
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

  const handleExpandView = () => {
    setIsExpandedView(true);
  };

  const handleDismissPreview = () => {
    if (app && app.canvas && app.canvas.focusManager) {
      app.canvas.focusManager.unfocusCard();
    }
  };

  const handleDismissFullscreen = () => {
    setIsExpandedView(false);
    // Optionally unfocus the card when dismissing fullscreen
    if (app && app.canvas && app.canvas.focusManager) {
      app.canvas.focusManager.unfocusCard();
    }
  };

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handlePublishStrategy = async (strategy: Partial<SimplifiedStrategy>) => {
    if (!address || !writeContractAsync) return;

    try {
      console.log('Publishing simplified strategy:', strategy);

      // Convert SimplifiedStrategy to contract arguments
      const contractArgs = {
        targetToken: (strategy.targetToken || '0x0000000000000000000000000000000000000000') as `0x${string}`,
        designatedCreator: (strategy.creatorAddress || address || '0x0000000000000000000000000000000000000000') as `0x${string}`,
        targetAmount: strategy.targetAmount || BigInt(0),
        deadline: BigInt(strategy.executionDeadline || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60), // Default to 30 days
        milestoneUnlockBps: [2500, 5000, 7500, 10000], // 25%, 50%, 75%, 100% - example values
      };

      // Call factory contract to create strategy
      const tx = await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: XStrategyFactoryABI,
        functionName: 'createStrategy',
        args: [
          contractArgs.targetToken,
          contractArgs.designatedCreator,
          contractArgs.targetAmount,
          contractArgs.deadline,
          contractArgs.milestoneUnlockBps,
        ],
      });

      console.log('Strategy creation transaction:', tx);
      setIsBuilderOpen(false);
      alert('Strategy created successfully! Transaction: ' + tx);
    } catch (error) {
      console.error('Error creating strategy:', error);
      alert('Error creating strategy: ' + (error as Error).message);
    }
  };

  const handleCreateStrategy = () => {
    setIsBuilderOpen(true);
  };

  // Deploy Simplified Strategy via Factory
  const handlePublishSimplifiedStrategy = async (strategy: Partial<SimplifiedStrategy>) => {
    if (!address || !writeContractAsync) return;

    try {
      console.log('Publishing simplified strategy:', strategy);

      // Convert SimplifiedStrategy to contract arguments
      const contractArgs = {
        targetToken: (strategy.targetToken || '0x0000000000000000000000000000000000000000') as `0x${string}`,
        designatedCreator: (strategy.creatorAddress || address || '0x0000000000000000000000000000000000000000') as `0x${string}`,
        targetAmount: strategy.targetAmount || BigInt(0),
        deadline: BigInt(strategy.executionDeadline || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60), // Default to 30 days
        milestoneUnlockBps: [2500, 5000, 7500, 10000], // 25%, 50%, 75%, 100% - example values
      };

      // Call factory contract to create strategy
      const tx = await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: XStrategyFactoryABI,
        functionName: 'createStrategy',
        args: [
          contractArgs.targetToken,
          contractArgs.designatedCreator,
          contractArgs.targetAmount,
          contractArgs.deadline,
          contractArgs.milestoneUnlockBps,
        ],
      });

      console.log('Strategy creation transaction:', tx);
      setIsBuilderOpen(false);
      alert('Strategy created successfully! Transaction: ' + tx);
    } catch (error) {
      console.error('Error creating strategy:', error);
      alert('Error creating strategy: ' + (error as Error).message);
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
            isZenMode={isZenMode}
            onZenModeToggle={setIsZenMode}
          />

          {/* Strategy Preview (Intermediate State) */}
          {focusedStrategy && showPreviewUI && !isModalOpen && !isExpandedView && (
            <StrategyPreview
              strategy={focusedStrategy}
              onOpenDetails={handleOpenDetails}
              onExpand={handleExpandView}
              onDismiss={handleDismissPreview}
            />
          )}

          {/* Strategy Fullscreen View */}
          {focusedStrategy && isExpandedView && (
            <StrategyFullscreen
              strategy={focusedStrategy}
              onDismiss={handleDismissFullscreen}
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

          {/* Simplified Strategy Builder */}
          <SimplifiedStrategyBuilder
            isOpen={isBuilderOpen}
            onClose={() => setIsBuilderOpen(false)}
            onPublish={handlePublishSimplifiedStrategy}
          />
        </>
      )}


    </>
  );
}
