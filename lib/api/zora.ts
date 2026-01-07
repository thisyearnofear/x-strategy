/**
 * Zora API Integration
 * Fetch real profile data, creator coins, and metadata from Zora
 */

export interface ZoraProfile {
  address: string
  username?: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  coverImageUrl?: string
  socialLinks?: {
    twitter?: string
    farcaster?: string
    instagram?: string
    website?: string
  }
}

export interface ZoraToken {
  address: string
  name: string
  symbol: string
  totalSupply?: string
  creatorAddress?: string
}

const ZORA_API_BASE = 'https://zora.co/api'

/**
 * Fetch Zora profile by address
 */
export async function getZoraProfile(address: string): Promise<ZoraProfile | null> {
  try {
    // Zora public API endpoints
    const response = await fetch(`${ZORA_API_BASE}/user/${address}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`Failed to fetch Zora profile for ${address}`)
      return null
    }

    const data = await response.json()
    
    return {
      address,
      username: data.username || data.handle,
      displayName: data.displayName || data.name,
      bio: data.bio || data.description,
      avatarUrl: data.avatar?.url || data.profileImageUrl || `${ZORA_API_BASE}/avatar/${address}`,
      coverImageUrl: data.coverImage?.url,
      socialLinks: {
        twitter: data.twitter,
        farcaster: data.farcaster,
        instagram: data.instagram,
        website: data.website,
      },
    }
  } catch (error) {
    console.error(`Error fetching Zora profile for ${address}:`, error)
    // Fallback to avatar URL
    return {
      address,
      avatarUrl: `${ZORA_API_BASE}/avatar/${address}`,
    }
  }
}

/**
 * Fetch multiple Zora profiles
 */
export async function getZoraProfiles(addresses: string[]): Promise<Map<string, ZoraProfile>> {
  const profiles = new Map<string, ZoraProfile>()
  
  await Promise.all(
    addresses.map(async (address) => {
      const profile = await getZoraProfile(address)
      if (profile) {
        profiles.set(address, profile)
      }
    })
  )
  
  return profiles
}

/**
 * Get avatar URL for an address (fallback-safe)
 */
export function getZoraAvatarUrl(address: string): string {
  return `${ZORA_API_BASE}/avatar/${address}`
}

/**
 * Fetch tokens created by an address
 */
export async function getCreatorTokens(creatorAddress: string): Promise<ZoraToken[]> {
  try {
    const response = await fetch(`${ZORA_API_BASE}/tokens?creator=${creatorAddress}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    
    return data.tokens?.map((token: any) => ({
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      totalSupply: token.totalSupply,
      creatorAddress: token.creator,
    })) || []
  } catch (error) {
    console.error(`Error fetching creator tokens for ${creatorAddress}:`, error)
    return []
  }
}

/**
 * Verify if an address has launched a token on Zora
 */
export async function hasLaunchedToken(address: string): Promise<boolean> {
  const tokens = await getCreatorTokens(address)
  return tokens.length > 0
}

/**
 * Enrich strategy data with live Zora profile information
 */
export async function enrichStrategyWithZoraData(strategy: any) {
  const profile = await getZoraProfile(strategy.creator.address)
  
  if (profile) {
    return {
      ...strategy,
      creator: {
        ...strategy.creator,
        username: profile.username || strategy.creator.username,
        displayName: profile.displayName || strategy.creator.displayName,
        avatarUrl: profile.avatarUrl || strategy.creator.avatarUrl,
        bio: profile.bio || strategy.creator.bio,
        socialLinks: {
          ...strategy.creator.socialLinks,
          ...profile.socialLinks,
        },
      },
      token: {
        ...strategy.token,
        logoUrl: profile.avatarUrl || strategy.token.logoUrl,
      },
    }
  }
  
  return strategy
}

/**
 * Batch enrich strategies with Zora data
 */
export async function enrichStrategiesWithZoraData(strategies: any[]) {
  return Promise.all(strategies.map(enrichStrategyWithZoraData))
}
