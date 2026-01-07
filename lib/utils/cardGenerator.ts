/**
 * Strategy Card Generator
 * Dynamically generates 512x512px card textures from strategy data
 */

import { Strategy, StrategyStatus } from '../types/strategy'

export interface CardStyle {
  bgGradient: [string, string]
  borderColor: string
  textColor: string
  accentColor: string
  pulseEffect?: boolean
}

// Status-based visual styles
export const STATUS_STYLES: Record<StrategyStatus, CardStyle> = {
  [StrategyStatus.DRAFT]: {
    bgGradient: ['#1a1a1a', '#2d2d2d'],
    borderColor: '#444444',
    textColor: '#cccccc',
    accentColor: '#666666',
  },
  [StrategyStatus.PENDING_CREATOR]: {
    bgGradient: ['#451a03', '#78350f'],
    borderColor: '#f59e0b',
    textColor: '#ffffff',
    accentColor: '#fbbf24',
  },
  [StrategyStatus.ACTIVE]: {
    bgGradient: ['#1e3a8a', '#3b82f6'],
    borderColor: '#60a5fa',
    textColor: '#ffffff',
    accentColor: '#93c5fd',
  },
  [StrategyStatus.ENDING_SOON]: {
    bgGradient: ['#7f1d1d', '#dc2626'],
    borderColor: '#f87171',
    textColor: '#ffffff',
    accentColor: '#fca5a5',
    pulseEffect: true,
  },
  [StrategyStatus.COMPLETED_SUCCESS]: {
    bgGradient: ['#14532d', '#16a34a'],
    borderColor: '#4ade80',
    textColor: '#ffffff',
    accentColor: '#86efac',
  },
  [StrategyStatus.COMPLETED_FAILURE]: {
    bgGradient: ['#1f1f1f', '#3f3f3f'],
    borderColor: '#525252',
    textColor: '#a3a3a3',
    accentColor: '#737373',
  },
  [StrategyStatus.UNWINDING]: {
    bgGradient: ['#7c2d12', '#ea580c'],
    borderColor: '#fb923c',
    textColor: '#ffffff',
    accentColor: '#fdba74',
  },
  [StrategyStatus.CANCELLED]: {
    bgGradient: ['#1f1f1f', '#2d2d2d'],
    borderColor: '#404040',
    textColor: '#999999',
    accentColor: '#666666',
  },
}

export class StrategyCardGenerator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = 512
    this.canvas.height = 512
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    this.ctx = ctx
  }

  /**
   * Generate a card texture from strategy data
   * Protocol-native design: Modular grid, high-contrast typography
   */
  async generateCard(strategy: Strategy): Promise<string> {
    const ctx = this.ctx
    const style = STATUS_STYLES[strategy.status]

    // Clear canvas
    ctx.clearRect(0, 0, 512, 512)

    // 1. Draw Background (Modular/Brutalist)
    this.drawBackground(style)

    // 2. Top Media Section (65% of card)
    const mediaHeight = 330
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, 512, mediaHeight)
    ctx.clip()
    
    if (strategy.token.logoUrl) {
      await this.drawProfileImage(strategy.token.logoUrl)
    } else if (strategy.creator.avatarUrl) {
      await this.drawProfileImage(strategy.creator.avatarUrl)
    }
    ctx.restore()

    // 3. Status Badge (Top-Left)
    this.drawProtocolBadge(strategy.status, style)

    // 4. Metadata Block (Bottom 35%)
    this.drawMetadataBlock(strategy, style, mediaHeight)

    // 5. Final Border
    this.drawStatusBorder(strategy.status, style)

    // Return as data URL
    return this.canvas.toDataURL('image/png')
  }

  /**
   * Draw high-contrast protocol badge
   */
  private drawProtocolBadge(status: StrategyStatus, style: CardStyle) {
    const ctx = this.ctx
    const text = status.replace('_', ' ').toUpperCase()
    
    // Use Monospace for protocol feel
    ctx.font = '900 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    const metrics = ctx.measureText(text)
    const padding = 12
    const badgeWidth = metrics.width + (padding * 2)
    const badgeHeight = 24
    
    // Badge Background (Solid High Contrast)
    ctx.fillStyle = '#000000'
    ctx.fillRect(20, 20, badgeWidth, badgeHeight)
    
    // Badge Border
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = 1
    ctx.strokeRect(20, 20, badgeWidth, badgeHeight)
    
    // Badge Text
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '2px'
    ctx.fillText(text, 20 + badgeWidth / 2, 20 + badgeHeight / 2)
    ctx.letterSpacing = '0px'
  }

  /**
   * Draw modular metadata section
   */
  private drawMetadataBlock(strategy: Strategy, style: CardStyle, yStart: number) {
    const ctx = this.ctx
    
    // Section divider
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, yStart)
    ctx.lineTo(512, yStart)
    ctx.stroke()

    // Title (Bold, Uppercase, Brutalist)
    ctx.fillStyle = '#000000'
    ctx.font = '900 36px Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    const title = strategy.title.toUpperCase()
    const truncatedTitle = title.length > 18 ? title.substring(0, 15) + '...' : title
    
    // Shadow for text depth
    ctx.fillStyle = style.borderColor
    ctx.fillText(truncatedTitle, 26, yStart + 26)
    ctx.fillStyle = '#000000'
    ctx.fillText(truncatedTitle, 24, yStart + 24)

    // Creator Label (Monospace)
    ctx.font = '900 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    ctx.fillStyle = '#666666'
    ctx.letterSpacing = '3px'
    ctx.fillText('PROPOSED BY', 24, yStart + 75)
    ctx.letterSpacing = '0px'

    // Creator Name (Farcaster Style)
    ctx.font = '900 20px Arial, sans-serif'
    ctx.fillStyle = '#000000'
    ctx.fillText(`@${strategy.creator.username.toLowerCase()}`, 24, yStart + 95)

    // Stats Grid Divider
    ctx.beginPath()
    ctx.moveTo(320, yStart)
    ctx.lineTo(320, 512)
    ctx.stroke()

    // Stats: Funding (Monospace label)
    ctx.font = '900 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    ctx.fillStyle = '#666666'
    ctx.letterSpacing = '2px'
    ctx.fillText('FUNDING', 344, yStart + 24)
    ctx.letterSpacing = '0px'
    
    ctx.font = '900 42px Arial, sans-serif'
    ctx.fillStyle = '#000000'
    ctx.fillText(`${strategy.fundingPercentage || 0}%`, 344, yStart + 45)

    // Stats: Backers (Monospace label)
    ctx.font = '900 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    ctx.fillStyle = '#666666'
    ctx.letterSpacing = '2px'
    ctx.fillText('BACKERS', 344, yStart + 95)
    ctx.letterSpacing = '0px'
    
    const backers = strategy.contributorCount || 0
    ctx.font = '900 28px Arial, sans-serif'
    ctx.fillStyle = '#000000'
    ctx.fillText(backers.toString().padStart(3, '0'), 344, yStart + 115)
  }

  /**
   * Draw image to fill specific area
   */
  private async drawProfileImage(url: string) {
    try {
      const img = await this.loadImage(url)
      const ctx = this.ctx

      // Cover behavior for the top section
      const targetWidth = 512
      const targetHeight = 330
      const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
      const x = (targetWidth - img.width * scale) / 2
      const y = (targetHeight - img.height * scale) / 2

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      
      // Desaturate slightly for protocol look
      ctx.save()
      ctx.globalCompositeOperation = 'saturation'
      ctx.fillStyle = 'gray'
      ctx.fillRect(0, 0, 512, 330)
      ctx.restore()
    } catch (err) {
      console.warn('Failed to load profile image:', url)
    }
  }

  /**
   * Draw subtle gradient background
   */
  private drawBackground(style: CardStyle) {
    const ctx = this.ctx
    ctx.fillStyle = '#ffffff' // Base white
    ctx.fillRect(0, 0, 512, 512)
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, style.bgGradient[0] + '22') // Very subtle
    gradient.addColorStop(1, style.bgGradient[1] + '44')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
  }

  /**
   * Draw status border
   */
  private drawStatusBorder(status: StrategyStatus, style: CardStyle) {
    const ctx = this.ctx
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = 12 // Thicker, brutalist border
    ctx.strokeRect(6, 6, 500, 500)
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * Cleanup
   */
  dispose() {
    this.canvas.remove()
  }
}

/**
 * Convenience function to generate a card texture
 */
export async function generateStrategyCard(strategy: Strategy): Promise<string> {
  const generator = new StrategyCardGenerator()
  const dataUrl = await generator.generateCard(strategy)
  generator.dispose()
  return dataUrl
}
