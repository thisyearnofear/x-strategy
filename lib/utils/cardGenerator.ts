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
   * Profile-focused design: Large creator avatar with minimal text overlay
   */
  async generateCard(strategy: Strategy): Promise<string> {
    const ctx = this.ctx
    const style = STATUS_STYLES[strategy.status]

    // Clear canvas
    ctx.clearRect(0, 0, 512, 512)

    // Draw creator profile image as main visual (like album art)
    if (strategy.creator.avatarUrl) {
      await this.drawProfileImage(strategy.creator.avatarUrl)
    } else {
      // Fallback gradient if no avatar
      this.drawBackground(style)
    }

    // Subtle gradient overlay at bottom for text
    this.drawBottomOverlay(style)

    // Small token logo badge in corner
    if (strategy.token.logoUrl && strategy.token.logoUrl !== strategy.creator.avatarUrl) {
      await this.drawTokenBadge(strategy.token.logoUrl)
    }

    // Minimal text at bottom
    this.drawMinimalInfo(strategy, style)

    // Status indicator (border glow - will be enhanced by shader)
    this.drawStatusBorder(strategy.status, style)

    // Return as data URL
    return this.canvas.toDataURL('image/png')
  }

  /**
   * Draw full-bleed profile image
   */
  private async drawProfileImage(url: string) {
    try {
      const img = await this.loadImage(url)
      const ctx = this.ctx

      // Draw image to fill canvas (cover behavior)
      const scale = Math.max(512 / img.width, 512 / img.height)
      const x = (512 - img.width * scale) / 2
      const y = (512 - img.height * scale) / 2

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
    } catch (err) {
      console.warn('Failed to load profile image:', url)
      // Draw fallback
      const gradient = this.ctx.createLinearGradient(0, 0, 512, 512)
      gradient.addColorStop(0, '#1e3a8a')
      gradient.addColorStop(1, '#3b82f6')
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, 512, 512)
    }
  }

  /**
   * Draw subtle gradient overlay at bottom for readability
   */
  private drawBottomOverlay(style: CardStyle) {
    const ctx = this.ctx
    const gradient = ctx.createLinearGradient(0, 350, 0, 512)
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 350, 512, 162)
  }

  /**
   * Draw token logo as small badge
   */
  private async drawTokenBadge(url: string) {
    try {
      const img = await this.loadImage(url)
      const ctx = this.ctx

      // Small circular badge in bottom-right
      const size = 48
      const x = 512 - size - 16
      const y = 512 - size - 16

      ctx.save()
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, x, y, size, size)
      ctx.restore()

      // Border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.stroke()
    } catch (err) {
      console.warn('Failed to load token badge:', url)
    }
  }

  /**
   * Draw minimal info text at bottom
   */
  private drawMinimalInfo(strategy: Strategy, style: CardStyle) {
    const ctx = this.ctx

    // Title (truncated)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'left'
    const title = strategy.title.length > 35 ? strategy.title.substring(0, 32) + '...' : strategy.title
    ctx.fillText(title, 20, 460)

    // Creator + Stats
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '16px Aeonik, Arial, sans-serif'
    ctx.fillText(`by ${strategy.creator.username}`, 20, 485)

    // Quick stats
    const stats = `💰 ${strategy.fundingPercentage}%`
    ctx.fillText(stats, 20, 505)
  }

  /**
   * Draw status border (subtle, shader will enhance)
   */
  private drawStatusBorder(status: StrategyStatus, style: CardStyle) {
    const ctx = this.ctx
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, 509, 509)
  }

  private drawBackground(style: CardStyle) {
    const ctx = this.ctx
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, style.bgGradient[0])
    gradient.addColorStop(1, style.bgGradient[1])

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
  }

  private drawBorder(style: CardStyle) {
    const ctx = this.ctx
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, 508, 508)
  }

  private async drawTokenLogo(url: string) {
    try {
      const img = await this.loadImage(url)
      const ctx = this.ctx

      // Draw circular token logo
      ctx.save()
      ctx.beginPath()
      ctx.arc(256, 100, 60, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, 196, 40, 120, 120)
      ctx.restore()

      // Draw circle border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(256, 100, 60, 0, Math.PI * 2)
      ctx.stroke()
    } catch (err) {
      console.warn('Failed to load token logo:', url)
    }
  }

  private async drawCreatorAvatar(url: string) {
    try {
      const img = await this.loadImage(url)
      const ctx = this.ctx

      // Draw small circular avatar overlapping token logo
      ctx.save()
      ctx.beginPath()
      ctx.arc(306, 140, 30, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, 276, 110, 60, 60)
      ctx.restore()

      // Draw circle border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(306, 140, 30, 0, Math.PI * 2)
      ctx.stroke()
    } catch (err) {
      console.warn('Failed to load creator avatar:', url)
    }
  }

  private drawTitle(title: string, style: CardStyle) {
    const ctx = this.ctx
    ctx.fillStyle = style.textColor
    ctx.font = 'bold 28px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'center'

    // Wrap text if too long
    const maxWidth = 460
    const words = title.split(' ')
    let line = ''
    let y = 200

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 256, y)
        line = words[i] + ' '
        y += 32
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 256, y)
  }

  private drawCreator(username: string, style: CardStyle) {
    const ctx = this.ctx
    ctx.fillStyle = style.accentColor
    ctx.font = '20px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`by ${username}`, 256, 270)
  }

  private drawCountdown(strategy: Strategy, style: CardStyle) {
    const ctx = this.ctx
    let text = ''
    let icon = '⏱️'

    if (strategy.status === StrategyStatus.ACTIVE || strategy.status === StrategyStatus.ENDING_SOON) {
      if (strategy.daysRemaining !== undefined && strategy.daysRemaining > 0) {
        text = `${strategy.daysRemaining}d remaining`
      } else if (strategy.hoursRemaining !== undefined) {
        text = `${strategy.hoursRemaining}h remaining`
        icon = '⚠️'
      }
    } else if (strategy.status === StrategyStatus.COMPLETED_SUCCESS) {
      icon = '✅'
      text = 'Completed'
    } else if (strategy.status === StrategyStatus.COMPLETED_FAILURE) {
      icon = '❌'
      text = 'Failed'
    }

    ctx.fillStyle = strategy.isEndingSoon ? '#fca5a5' : style.textColor
    ctx.font = 'bold 24px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${icon} ${text}`, 256, 310)
  }

  private drawProgressBar(strategy: Strategy, style: CardStyle) {
    const ctx = this.ctx
    const barWidth = 400
    const barHeight = 20
    const x = 56
    const y = 330
    const progress = strategy.fundingPercentage || 0

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(x, y, barWidth, barHeight)

    // Progress fill
    const fillWidth = (barWidth * progress) / 100
    const gradient = ctx.createLinearGradient(x, y, x + fillWidth, y)
    gradient.addColorStop(0, style.accentColor)
    gradient.addColorStop(1, style.borderColor)
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, fillWidth, barHeight)

    // Border
    ctx.strokeStyle = style.borderColor
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, barWidth, barHeight)

    // Percentage text
    ctx.fillStyle = style.textColor
    ctx.font = 'bold 18px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(progress)}%`, 256, y + 15)
  }

  private drawStats(strategy: Strategy, style: CardStyle) {
    const ctx = this.ctx
    ctx.fillStyle = style.textColor
    ctx.font = '18px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'center'

    // Funding amount
    const fundingText = strategy.currentAmountUSD && strategy.targetAmountUSD
      ? `💰 $${this.formatNumber(strategy.currentAmountUSD)} / $${this.formatNumber(strategy.targetAmountUSD)}`
      : `💰 ${strategy.fundingPercentage}% funded`

    ctx.fillText(fundingText, 256, 375)

    // Contributors count
    ctx.fillText(`👥 ${strategy.contributorCount} contributors`, 256, 400)
  }

  private drawMilestones(strategy: Strategy, style: CardStyle) {
    const ctx = this.ctx
    const completed = strategy.milestonesCompleted || 0
    const total = strategy.milestonesTotal || 0

    if (total === 0) return

    const spacing = 30
    const startX = 256 - (total * spacing) / 2
    const y = 430

    for (let i = 0; i < total; i++) {
      const x = startX + i * spacing

      // Draw circle
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)

      if (i < completed) {
        ctx.fillStyle = style.borderColor
        ctx.fill()
      } else {
        ctx.strokeStyle = style.accentColor
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    // Milestone text
    ctx.fillStyle = style.accentColor
    ctx.font = '16px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`🎯 ${completed}/${total} milestones`, 256, 460)
  }

  private drawStatusBadges(strategy: Strategy, style: CardStyle) {
    const ctx = this.ctx
    const badges: string[] = []

    if (strategy.trending) badges.push('🔥 TRENDING')
    if (strategy.isEndingSoon) badges.push('⚡ ENDING SOON')
    if (strategy.hasActiveSignals) badges.push('🛰️ SIGNALS')
    if (strategy.creatorOptedIn) badges.push('✓ OPTED IN')

    if (badges.length === 0) return

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.font = 'bold 14px Aeonik, Arial, sans-serif'
    ctx.textAlign = 'center'

    badges.forEach((badge, i) => {
      const y = 490 - (badges.length - 1 - i) * 20
      ctx.fillText(badge, 256, y)
    })
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
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
