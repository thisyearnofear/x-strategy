import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import App from '../lib/main'
import StrategyModal from '../components/StrategyModal'
import NavigationHUD from '../components/NavigationHUD'
import StrategyBuilder from '../components/builder/StrategyBuilder'
import { Strategy } from '../lib/types/strategy'
import { STRATEGIES } from '../lib/data/strategies'
import { XStrategyABI, XStrategyFactoryABI, FACTORY_ADDRESS } from '../lib/abis'

export default function Home() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [strategies] = useState<Strategy[]>(STRATEGIES)

  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  // Initialize Canvas
  useEffect(() => {
    const app = new App()
    if (app.canvas && app.canvas.planes) {
      app.canvas.planes.setClickCallback((instanceId: number) => {
        const strategyIndex = instanceId % strategies.length
        setSelectedStrategy(strategies[strategyIndex])
        setIsModalOpen(true)
      })
    }
    return () => { }
  }, [strategies])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedStrategy(null), 300)
  }

  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  const handleCreateStrategy = () => {
    setIsBuilderOpen(true)
  }

  // Deploy Strategy via Factory
  const handlePublishStrategy = async (strategy: any) => {
    console.log('Publishing strategy:', strategy)
    try {
      // Map strategy draft to Contract arguments
      // Note: strategy contains draft data directly here via builder callback
      const unlockBps = strategy.milestones.map((m: any) => m.unlockPercentage * 100);

      const tx = await writeContractAsync({
        address: FACTORY_ADDRESS,
        abi: XStrategyFactoryABI,
        functionName: 'createStrategy',
        args: [
          strategy.token.address || '0x0000000000000000000000000000000000000000', // Mock if missing
          strategy.designatedCreator || address, // Default to self if missing
          BigInt(strategy.targetAmountUSD || 0) * BigInt(1e18), // Rough map
          BigInt(Math.floor(Date.now() / 1000) + (strategy.timeline || 30) * 86400),
          unlockBps
        ]
      });

      setIsBuilderOpen(false)
      alert(`Strategy Deployed! TX: ${tx}`)
    } catch (e) {
      console.error(e);
      alert('Deployment failed. See console.');
    }
  }

  // Interactions
  const handleOptIn = async (strategyId: string, stake: bigint) => {
    // Assuming strategyId is the address for MVP, or we need a map
    // For now, let's treat ID as address if it starts with 0x, otherwise mock or error
    if (!strategyId.startsWith('0x')) {
      alert("Strategy address not found (Mock ID).");
      return;
    }

    await writeContractAsync({
      address: strategyId as `0x${string}`,
      abi: XStrategyABI,
      functionName: 'optIn',
      value: stake
    });
  }

  const handleContribute = async (strategyId: string, amount: bigint) => {
    if (!strategyId.startsWith('0x')) {
      alert("Strategy address not found (Mock ID).");
      return;
    }

    await writeContractAsync({
      address: strategyId as `0x${string}`,
      abi: XStrategyABI,
      functionName: 'contribute',
      value: amount
    });
  }

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  return (
    <>
      <Head>
        <title>X-Strategy | Outcome-Backed Capital Coordination</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Deploy capital around real-world execution with automated downside protection."
        />
      </Head>

      {/* 3D Canvas */}
      <canvas id="webgl" />

      {/* Navigation HUD */}
      <NavigationHUD
        onCreateStrategy={handleCreateStrategy}
        onFilterChange={handleFilterChange}
      />

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
  )
}