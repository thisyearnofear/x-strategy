/**
 * X-Strategy Data
 * Real strategies for outcome-backed capital coordination
 */

import {
  Strategy,
  StrategyStatus,
  TokenType,
  StrategyCategory,
  MilestoneStatus,
  Token,
  Creator,
  Milestone,
  Contributor,
} from '../types/strategy'

const now = Date.now()
const DAY_MS = 24 * 60 * 60 * 1000

// ============================================================================
// Tokens
// ============================================================================

export const TOKENS: Record<string, Token> = {
  LANEKSA: {
    address: '0xb5dad39acc1f5812561673fee809c737875563b5',
    symbol: 'LANEKSA',
    name: 'Lane Rettig',
    logoUrl: 'https://zora.co/api/avatar/0xb5dad39acc1f5812561673fee809c737875563b5',
    type: TokenType.CREATOR_COIN,
    marketCap: BigInt('50000000000000000000000'),
    liquidity: BigInt('10000000000000000000000'),
    priceUSD: 1.25,
    chain: 'zora',
  },
  PAPAJAMS: {
    address: '0x2e9be99b199c874bd403f1b70fcaa9f11f47b96c',
    symbol: 'PAPAJAMS',
    name: 'Papa Jams',
    logoUrl: 'https://zora.co/api/avatar/0x2e9be99b199c874bd403f1b70fcaa9f11f47b96c',
    type: TokenType.APP_COIN,
    marketCap: BigInt('100000000000000000000000'),
    liquidity: BigInt('20000000000000000000000'),
    priceUSD: 0.08,
    chain: 'base',
  },
}

// ============================================================================
// Creators
// ============================================================================

export const CREATORS: Record<string, Creator> = {
  LANEKSA: {
    address: '0xb5dad39acc1f5812561673fee809c737875563b5',
    username: '@laneksa',
    displayName: 'Lane Rettig',
    avatarUrl: 'https://zora.co/api/avatar/0xb5dad39acc1f5812561673fee809c737875563b5',
    bio: 'Building the future of creator coins. Onboarding athletes to web3.',
    reputationScore: 94,
    strategiesCreated: 3,
    strategiesCompleted: 2,
    signalAccuracy: 92,
    socialLinks: {
      twitter: 'laneksa',
      farcaster: 'laneksa',
    },
  },
  PAPAJAMS: {
    address: '0x2e9be99b199c874bd403f1b70fcaa9f11f47b96c',
    username: '@papajams',
    displayName: 'Papa Jams',
    avatarUrl: 'https://zora.co/api/avatar/0x2e9be99b199c874bd403f1b70fcaa9f11f47b96c',
    bio: 'Building mini apps on Farcaster. Launching app coins.',
    reputationScore: 88,
    strategiesCreated: 2,
    strategiesCompleted: 1,
    signalAccuracy: 85,
    socialLinks: {
      farcaster: 'papajams',
    },
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

function createMilestone(
  id: string,
  order: number,
  title: string,
  description: string,
  status: MilestoneStatus,
  targetDaysFromNow?: number
): Milestone {
  return {
    id,
    title,
    description,
    order,
    status,
    targetDate: targetDaysFromNow ? now + targetDaysFromNow * DAY_MS : undefined,
    completedAt: status === MilestoneStatus.COMPLETED ? now - 2 * DAY_MS : undefined,
    unlockPercentage: 33,
  }
}

function createContributor(
  address: string,
  username: string,
  amount: string,
  avatarUrl: string
): Contributor {
  return {
    address,
    username,
    amountContributed: BigInt(amount),
    contributedAt: now - Math.random() * 10 * DAY_MS,
    avatarUrl,
    isStaking: Math.random() > 0.5,
  }
}

// ============================================================================
// Strategies
// ============================================================================

export const STRATEGIES: Strategy[] = [
  // Strategy 1: Onboarding Strategy - Lane Rettig
  {
    id: '0x7b5dad39acc1f5812561673fee809c737875563b5',
    title: 'Onboard 3 Professional Footballers to Zora',
    description:
      'Lane Rettig has deep connections with professional soccer players through her network. This strategy funds her to onboard 3 professional footballers to launch their creator coins on Zora within 30 days, bringing real athletes into web3.',
    category: StrategyCategory.SPORTS,
    token: TOKENS.LANEKSA,
    targetAmount: BigInt('40000000000000000000000'), // 40k tokens
    currentAmount: BigInt('10000000000000000000000'), // 10k tokens (25%)
    targetAmountUSD: 50000,
    currentAmountUSD: 12500,
    creator: CREATORS.LANEKSA,
    creatorStake: BigInt('5000000000000000000000'), // 5k tokens
    designatedCreator: CREATORS.LANEKSA.address,
    creatorOptedIn: true,
    createdAt: now - 16 * DAY_MS,
    deadline: now + 14 * DAY_MS, // 14 days remaining
    status: StrategyStatus.ACTIVE,
    milestones: [
      createMilestone(
        'm1',
        1,
        'First Player Onboarded',
        'Onboard first professional footballer and launch their creator coin on Zora',
        MilestoneStatus.COMPLETED,
        7
      ),
      createMilestone(
        'm2',
        2,
        'Second Player Onboarded',
        'Onboard second professional footballer and launch their coin',
        MilestoneStatus.COMPLETED,
        14
      ),
      createMilestone(
        'm3',
        3,
        'Third Player + Active Trading',
        'Onboard third player and ensure all coins are actively trading with liquidity',
        MilestoneStatus.IN_PROGRESS,
        30
      ),
    ],
    currentMilestone: 2,
    contributors: [],
    contributorCount: 47,
    topContributors: [
      createContributor('0xabc...def', '@alice.eth', '500000000000000000000', 'https://zora.co/api/avatar/0xabc'),
      createContributor('0xdef...ghi', '@bob.eth', '350000000000000000000', 'https://zora.co/api/avatar/0xdef'),
      createContributor('0xghi...jkl', '@carol.eth', '200000000000000000000', 'https://zora.co/api/avatar/0xghi'),
    ],
    automation: {
      autoUnwindEnabled: true,
      slippageLimit: 5,
      cooldownPeriod: 24 * 60 * 60, // 24 hours
      liquidityCheckEnabled: true,
    },
    signalCount: 3,
    hasActiveSignals: true,
    tags: ['onboarding', 'sports', 'football', 'athletes', 'zora'],
    imageUrl: CREATORS.LANEKSA.avatarUrl,
    castCount: 23,
    trending: true,
    fundingPercentage: 25,
    timeRemaining: 14 * DAY_MS,
    daysRemaining: 14,
    milestonesCompleted: 2,
    milestonesTotal: 3,
  },

  // Strategy 2: AppCoin Strategy - Papa Jams
  {
    id: '0x2e9be99b199c874bd403f1b70fcaa9f11f47b96c',
    title: 'Launch 5 Farcaster Mini Apps with Coins',
    description:
      'Papa Jams will create and launch 5 mini apps on Farcaster, each with their own app coin. Apps must meet criteria: useful utility, active users, and sustainable tokenomics. Target 1000+ active users across all apps.',
    category: StrategyCategory.TECH,
    token: TOKENS.PAPAJAMS,
    targetAmount: BigInt('80000000000000000000000'), // 80k tokens
    currentAmount: BigInt('8000000000000000000000'), // 8k tokens (10%)
    targetAmountUSD: 6400,
    currentAmountUSD: 640,
    creator: CREATORS.PAPAJAMS,
    creatorStake: BigInt('10000000000000000000000'), // 10k tokens
    designatedCreator: CREATORS.PAPAJAMS.address,
    creatorOptedIn: true,
    createdAt: now - 5 * DAY_MS,
    deadline: now + 55 * DAY_MS, // 55 days remaining
    status: StrategyStatus.ACTIVE,
    milestones: [
      createMilestone(
        'm1',
        1,
        'First Mini App Launch',
        'Launch first Farcaster mini app with app coin and 200+ users',
        MilestoneStatus.IN_PROGRESS,
        20
      ),
      createMilestone(
        'm2',
        2,
        'Apps 2-3 Launched',
        'Launch second and third mini apps, each with 150+ active users',
        MilestoneStatus.PENDING,
        40
      ),
      createMilestone(
        'm3',
        3,
        'Apps 4-5 + 1000 User Milestone',
        'Launch final two apps and reach 1000+ combined active users',
        MilestoneStatus.PENDING,
        60
      ),
    ],
    currentMilestone: 0,
    contributors: [],
    contributorCount: 15,
    topContributors: [
      createContributor('0x111...222', '@farcaster_dev', '200000000000000000000', 'https://zora.co/api/avatar/0x111'),
      createContributor('0x222...333', '@miniapp_fan', '150000000000000000000', 'https://zora.co/api/avatar/0x222'),
    ],
    automation: {
      autoUnwindEnabled: true,
      slippageLimit: 5,
      cooldownPeriod: 24 * 60 * 60,
      liquidityCheckEnabled: true,
    },
    signalCount: 1,
    hasActiveSignals: true,
    tags: ['appcoin', 'farcaster', 'miniapp', 'launch', 'tech'],
    imageUrl: CREATORS.PAPAJAMS.avatarUrl,
    castCount: 12,
    trending: false,
    fundingPercentage: 10,
    timeRemaining: 55 * DAY_MS,
    daysRemaining: 55,
    milestonesCompleted: 0,
    milestonesTotal: 3,
  },

  // Strategy 3: Ending Soon - Sport/App Bridge
  {
    id: '0x8e92d39acc1f5812561673fee809c737875563b5',
    title: 'Bridge NBA Fan Experience to Base',
    description: 'Creating a direct Fan-to-Player engagement protocol on Base for NBA fans. Allowing token-gated access to exclusive content and voting rights on fan-driven initiatives.',
    category: StrategyCategory.SPORTS,
    token: TOKENS.LANEKSA,
    targetAmount: BigInt('100000000000000000000000'),
    currentAmount: BigInt('95000000000000000000000'),
    targetAmountUSD: 125000,
    currentAmountUSD: 118750,
    creator: CREATORS.LANEKSA,
    creatorStake: BigInt('20000000000000000000000'),
    designatedCreator: CREATORS.LANEKSA.address,
    creatorOptedIn: true,
    createdAt: now - 28 * DAY_MS,
    deadline: now + 2 * DAY_MS,
    status: StrategyStatus.ENDING_SOON,
    milestones: [
      createMilestone('m1', 1, 'Protocol Beta', 'NBA Beta launch with 100 fans', MilestoneStatus.COMPLETED),
      createMilestone('m2', 2, 'Mainnet Bridge', 'NBA Bridge to Base Mainnet', MilestoneStatus.IN_PROGRESS),
    ],
    currentMilestone: 1,
    contributors: [],
    contributorCount: 234,
    topContributors: [],
    automation: { autoUnwindEnabled: true, slippageLimit: 2, cooldownPeriod: 3600, liquidityCheckEnabled: true },
    signalCount: 15,
    hasActiveSignals: true,
    tags: ['nba', 'base', 'bridge'],
    imageUrl: TOKENS.LANEKSA.logoUrl,
    castCount: 156,
    trending: true,
    fundingPercentage: 95,
    timeRemaining: 2 * DAY_MS,
    daysRemaining: 2,
    milestonesCompleted: 1,
    milestonesTotal: 2,
  },

  // Strategy 4: Pending Creator - New Idea
  {
    id: '0x9f2e9be9b199c874bd403f1b70fcaa9f11f47b96c',
    title: 'Farcaster Frame Factory for Athletes',
    description: 'A no-code tool for athletes to launch their own Farcaster Frames for merchandise and fan interaction. Pending Lane Rettig approval and stake.',
    category: StrategyCategory.TECH,
    token: TOKENS.LANEKSA,
    targetAmount: BigInt('50000000000000000000000'),
    currentAmount: BigInt('0'),
    targetAmountUSD: 62500,
    currentAmountUSD: 0,
    creator: CREATORS.PAPAJAMS,
    creatorStake: BigInt('10000000000000000000000'),
    designatedCreator: CREATORS.LANEKSA.address,
    creatorOptedIn: false,
    createdAt: now - 1 * DAY_MS,
    deadline: now + 29 * DAY_MS,
    status: StrategyStatus.PENDING_CREATOR,
    milestones: [
      createMilestone('m1', 1, 'Frame Builder V1', 'Initial no-code frame builder', MilestoneStatus.PENDING),
    ],
    currentMilestone: 0,
    contributors: [],
    contributorCount: 0,
    topContributors: [],
    automation: { autoUnwindEnabled: true, slippageLimit: 5, cooldownPeriod: 86400, liquidityCheckEnabled: true },
    signalCount: 0,
    hasActiveSignals: false,
    tags: ['frames', 'no-code', 'athletes'],
    imageUrl: TOKENS.LANEKSA.logoUrl,
    castCount: 5,
    trending: false,
    fundingPercentage: 0,
    timeRemaining: 29 * DAY_MS,
    daysRemaining: 29,
    milestonesCompleted: 0,
    milestonesTotal: 1,
  },

  // Strategy 5: Completed Success
  {
    id: '0xa111be9b199c874bd403f1b70fcaa9f11f47b96c',
    title: 'Base Paint Integration for Creators',
    description: 'Successful integration of Base Paint canvas for top Farcaster creators. All milestones verified by protocol signals.',
    category: StrategyCategory.TECH,
    token: TOKENS.PAPAJAMS,
    targetAmount: BigInt('20000000000000000000000'),
    currentAmount: BigInt('20000000000000000000000'),
    targetAmountUSD: 1600,
    currentAmountUSD: 1600,
    creator: CREATORS.PAPAJAMS,
    creatorStake: BigInt('2000000000000000000000'),
    designatedCreator: CREATORS.PAPAJAMS.address,
    creatorOptedIn: true,
    createdAt: now - 60 * DAY_MS,
    deadline: now - 30 * DAY_MS,
    status: StrategyStatus.COMPLETED_SUCCESS,
    milestones: [
      createMilestone('m1', 1, 'Base Paint API', 'Integration with Base Paint API', MilestoneStatus.COMPLETED),
      createMilestone('m2', 2, 'Creator Dashboard', 'Dashboard for creators to view their canvas', MilestoneStatus.COMPLETED),
    ],
    currentMilestone: 2,
    contributors: [],
    contributorCount: 89,
    topContributors: [],
    automation: { autoUnwindEnabled: true, slippageLimit: 1, cooldownPeriod: 0, liquidityCheckEnabled: true },
    signalCount: 42,
    hasActiveSignals: false,
    tags: ['basepaint', 'farcaster', 'integration'],
    imageUrl: TOKENS.PAPAJAMS.logoUrl,
    castCount: 432,
    trending: false,
    fundingPercentage: 100,
    timeRemaining: 0,
    daysRemaining: 0,
    milestonesCompleted: 2,
    milestonesTotal: 2,
  },
]

export default STRATEGIES
