/**
 * X-Strategy Type Definitions
 * Core domain models for outcome-backed capital coordination
 */

// ============================================================================
// Enums
// ============================================================================

export enum StrategyStatus {
  PENDING_CREATOR = 'pending_creator',
  DRAFT = 'draft',
  FUNDING = 'funding', // Raising funds to hit threshold
  ACTIVE = 'active', // Threshold hit, execution phase
  ENDING_SOON = 'ending_soon', // < 48h remaining
  COMPLETED_SUCCESS = 'completed_success',
  COMPLETED_FAILURE = 'completed_failure',
  UNWINDING = 'unwinding',
  CANCELLED = 'cancelled',
}

export enum CommitmentLevel {
  CLAIMED = 0,     // Creator claims they'll deliver (lowest trust)
  SIGNALED = 1,    // Targets liked/shared/commented on strategy
  CONFIRMED = 2,   // Targets explicitly opted-in on-chain or signed message
  ESCROWED = 3     // Targets put up their own stake (highest trust)
}

export enum ExitStrategy {
  AUTO_SELL = 'auto_sell',           // Automatic liquidation at deadline
  GOVERNANCE_VOTE = 'governance_vote', // Contributors vote on exit
  CREATOR_CHOICE = 'creator_choice'    // Creator decides (with veto protection)
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TokenType {
  CREATOR_COIN = 'creator_coin',
  APP_COIN = 'app_coin',
  COMMUNITY_TOKEN = 'community_token',
  MEME_COIN = 'meme_coin',
}

export enum StrategyCategory {
  SPORTS = 'sports',
  ART = 'art',
  MUSIC = 'music',
  TECH = 'tech',
  COMMUNITY = 'community',
  ENTERTAINMENT = 'entertainment',
  OTHER = 'other',
}

// ============================================================================
// Core Types
// ============================================================================

export interface Token {
  address: string // Contract address
  symbol: string // e.g. "ZORA"
  name: string // e.g. "Zora"
  logoUrl: string
  type: TokenType
  marketCap?: bigint
  liquidity?: bigint
  priceUSD?: number
  chain: string // 'ethereum', 'base', 'zora', etc.
}

export interface Creator {
  address: string // Wallet or ENS
  username: string // @laneksa
  displayName?: string
  avatarUrl?: string
  bio?: string
  reputationScore: number // 0-100
  strategiesCreated: number
  strategiesCompleted: number
  signalAccuracy?: number // 0-100 (for signal streams)
  socialLinks?: {
    twitter?: string
    farcaster?: string
    lens?: string
  }
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate?: number // Unix timestamp
  order: number // 1, 2, 3...
  status: MilestoneStatus
  completedAt?: number // Unix timestamp
  verificationUrl?: string // Link to proof (tweet, transaction, etc.)
  unlockPercentage?: number // % of tokens to unlock on completion (e.g. 33)
}

export interface Contributor {
  address: string
  username?: string
  avatarUrl?: string
  amountContributed: bigint
  contributedAt: number // Unix timestamp
  tokensReceived?: bigint
  isStaking?: boolean
  reputationScore?: number
}

export interface SignalStream {
  id: string
  creatorAddress: string
  title: string
  content: string
  publishedAt: number // Unix timestamp
  revealAt?: number // For time-locked signals
  requiredStake: bigint // Minimum tokens to access
  verified?: boolean // Was the signal accurate?
  category?: string // 'launch', 'partnership', 'milestone', etc.
}

// ============================================================================
// Simplified Strategy Interface (Party Protocol Inspired)
// ============================================================================

export interface SimplifiedStrategy {
  // Identity
  id: string
  contractAddress?: string

  // Group Coordination Target
  targetDescription: string // "3 professional footballers to Zora"
  targetCount: number
  targetPlatform: string

  // Commitment & Trust
  commitmentLevel: CommitmentLevel
  commitmentProof?: string // URL to tweet, video, etc.
  targetCommitments?: string[] // Addresses/usernames of committed targets

  // Investment Coordination
  targetToken: string // Existing token address only
  fundingThreshold: bigint // Must hit this to launch (e.g. 1 ETH)
  targetAmount: bigint // Total goal (>= threshold)
  currentAmount: bigint

  // Creator Skin in the Game
  creatorNativeTokenStake: bigint // Platform token staked
  creatorETHStake: bigint // ETH staked
  creatorAddress: string
  creatorOptedIn: boolean

  // Timeline & Governance
  fundingDeadline: number // Time to hit threshold
  executionDeadline: number // Time to complete coordination
  exitStrategy: ExitStrategy

  // Status & Participants
  status: StrategyStatus
  contributors: Contributor[]
  contributorCount: number

  // Post-Launch Features
  chatEnabled: boolean
  signalStreamEnabled: boolean
  governanceEnabled: boolean

  // Computed Fields
  fundingPercentage?: number
  timeRemaining?: number
  isEndingSoon?: boolean
  tier?: 1 | 2 | 3 | 4 // Based on commitment level
}

// ============================================================================
// Token Economics & Fees
// ============================================================================

export interface TokenRequirements {
  stakeAmount: bigint // Locked during strategy, returned on success
  burnAmount: bigint // Burned immediately for spam prevention
}

export interface FeeStructure {
  baseFee: number // % of total funding on success
  commitmentDiscount: number // Discount based on commitment level
  failedStrategyFee: number // Fee on failed strategies (usually 0)
  gasRefund: boolean // Platform covers gas on failures
}

export interface StrategyTier {
  level: 1 | 2 | 3 | 4
  maxFunding: bigint
  fee: number
  features: string[]
  commitmentRequired: CommitmentLevel
}

export interface Strategy {
  // Identity
  id: string // Unique strategy ID
  contractAddress?: string // Deployed contract address

  // Core Details
  title: string
  description: string
  category: StrategyCategory

  // Token & Financial
  token: Token
  targetAmount: bigint // Target buy amount in token decimals
  currentAmount: bigint // Current funded amount
  targetAmountUSD?: number // For display purposes
  currentAmountUSD?: number

  // Creator
  creator: Creator
  creatorStake: bigint // Creator's refundable stake
  designatedCreator: string // Address of creator (who must opt-in)
  creatorOptedIn: boolean

  // Timeline
  createdAt: number // Unix timestamp
  deadline: number // Unix timestamp
  startedAt?: number // When funding began
  completedAt?: number // When objective was met (or failed)

  // Status
  status: StrategyStatus

  // Milestones
  milestones: Milestone[]
  currentMilestone?: number // Index of current milestone

  // Participants
  contributors: Contributor[]
  contributorCount: number
  topContributors?: Contributor[] // Top 3-5 for display

  // Automated Protection
  automation: {
    autoUnwindEnabled: boolean
    slippageLimit: number // e.g. 5 (for 5%)
    cooldownPeriod: number // in seconds
    liquidityCheckEnabled: boolean
  }

  // Signal Streams
  signalStreams?: SignalStream[]
  signalCount?: number
  hasActiveSignals?: boolean

  // Social & Discovery
  tags?: string[]
  imageUrl?: string // Strategy card image
  backedByFriends?: string[] // Farcaster addresses
  castCount?: number // Times shared on Farcaster
  trending?: boolean

  // Reputation Impact
  expectedReputationGain?: number // For creator if successful
  reputationAtRisk?: number // For creator if failed

  // Computed Fields (for UI)
  fundingPercentage?: number // 0-100
  timeRemaining?: number // Seconds until deadline
  daysRemaining?: number
  hoursRemaining?: number
  isEndingSoon?: boolean // < 48h
  isFullyFunded?: boolean
  milestonesCompleted?: number
  milestonesTotal?: number
}

// ============================================================================
// UI-Specific Types
// ============================================================================

export interface StrategyCardData {
  strategy: Strategy
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  opacity: number
  highlighted?: boolean
  textureUrl: string // Generated card texture
}

export interface StrategyFilter {
  status?: StrategyStatus[]
  category?: StrategyCategory[]
  tokenType?: TokenType[]
  minFunding?: number
  maxFunding?: number
  creatorAddress?: string
  backedByFriends?: boolean
  trending?: boolean
  search?: string
}

export interface StrategySort {
  field: 'deadline' | 'created' | 'funding' | 'reputation' | 'contributors'
  direction: 'asc' | 'desc'
}

// ============================================================================
// Action Types (for state management)
// ============================================================================

export interface CreateStrategyInput {
  title: string
  description: string
  category: StrategyCategory
  tokenAddress: string
  targetAmount: bigint
  deadline: number
  milestones: Omit<Milestone, 'id' | 'status'>[]
  creatorStake: bigint
  tags?: string[]
}

export interface JoinStrategyInput {
  strategyId: string
  amount: bigint
  stakeTokens?: boolean // Opt-in to signal streams
}

export interface UpdateStrategyInput {
  strategyId: string
  milestoneId?: string
  newStatus?: MilestoneStatus
  verificationUrl?: string
}

export interface PublishSignalInput {
  strategyId: string
  title: string
  content: string
  revealAt?: number
  requiredStake: bigint
  category?: string
}

// ============================================================================
// API Response Types
// ============================================================================

export interface StrategiesResponse {
  strategies: Strategy[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface StrategyDetailResponse {
  strategy: Strategy
  contributors: Contributor[]
  signalStreams?: SignalStream[]
  relatedStrategies?: Strategy[]
}

// ============================================================================
// Contract Event Types
// ============================================================================

export interface StrategyCreatedEvent {
  strategyId: string
  creator: string
  tokenAddress: string
  targetAmount: bigint
  deadline: number
  timestamp: number
}

export interface ContributionEvent {
  strategyId: string
  contributor: string
  amount: bigint
  totalRaised: bigint
  timestamp: number
}

export interface MilestoneCompletedEvent {
  strategyId: string
  milestoneId: string
  timestamp: number
  tokensUnlocked?: bigint
}

export interface StrategyCompletedEvent {
  strategyId: string
  success: boolean
  finalAmount: bigint
  timestamp: number
}

export interface UnwindInitiatedEvent {
  strategyId: string
  reason: string
  estimatedRefund: bigint
  timestamp: number
}

// ============================================================================
// Utility Types
// ============================================================================

export type PartialStrategy = Partial<Strategy> & Pick<Strategy, 'id' | 'title' | 'token'>

export type StrategyWithSocial = Strategy & {
  backedByFriends: Array<{
    address: string
    username: string
    avatarUrl: string
  }>
  mutualBackers: number
}

export type StrategyStats = {
  totalStrategies: number
  activeStrategies: number
  totalValueLocked: bigint
  totalContributors: number
  successRate: number
  averageCompletion: number // days
}
