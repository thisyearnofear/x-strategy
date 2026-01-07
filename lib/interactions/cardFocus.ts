/**
 * Card Focus System
 * Handles click → center → zoom → interact flow for strategy cards
 */

import * as THREE from 'three'
import gsap from 'gsap'
import type Planes from '../planes'

export interface FocusedCardState {
  instanceId: number
  originalPosition: THREE.Vector3
  originalRotation: THREE.Euler
  originalScale: number
  isFocused: boolean
}

export class CardFocusManager {
  private planes: Planes
  private camera: THREE.PerspectiveCamera
  private focusedCard: FocusedCardState | null = null
  private otherCardsOpacity: number = 1.0
  private onFocusCallback?: (instanceId: number) => void
  private onUnfocusCallback?: () => void

  constructor(
    planes: Planes,
    camera: THREE.PerspectiveCamera
  ) {
    this.planes = planes
    this.camera = camera
  }

  /**
   * Focus on a specific card
   */
  focusCard(instanceId: number) {
    if (this.focusedCard?.instanceId === instanceId) {
      return // Already focused
    }

    // Unfocus previous card if any
    if (this.focusedCard) {
      this.unfocusCard()
    }

    // Get card's current position
    const dummy = new THREE.Object3D()
    this.planes.mesh.getMatrixAt(instanceId, dummy.matrix)
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

    // Store original state
    this.focusedCard = {
      instanceId,
      originalPosition: dummy.position.clone(),
      originalRotation: new THREE.Euler().setFromQuaternion(dummy.quaternion),
      originalScale: dummy.scale.x,
      isFocused: true,
    }

    // Disable gallery interactions
    this.planes.setPaused(true)

    // Animate focus
    this.animateFocus(instanceId, dummy)

    // Trigger callback
    if (this.onFocusCallback) {
      this.onFocusCallback(instanceId)
    }
  }

  /**
   * Unfocus current card
   */
  unfocusCard() {
    if (!this.focusedCard) return

    const { instanceId, originalPosition, originalRotation, originalScale } =
      this.focusedCard

    // Re-enable gallery interactions
    this.planes.setPaused(false)

    // Animate back to original state
    this.animateUnfocus(
      instanceId,
      originalPosition,
      originalRotation,
      originalScale
    )

    this.focusedCard = null

    // Trigger callback
    if (this.onUnfocusCallback) {
      this.onUnfocusCallback()
    }
  }

  /**
   * Animate card focus sequence
   */
  private animateFocus(instanceId: number, dummy: THREE.Object3D) {
    const timeline = gsap.timeline()

    // Step 1: Fade other cards
    timeline.to(this, {
      otherCardsOpacity: 0.15, // Deeper dimming
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: () => {
        this.updateOtherCardsOpacity(instanceId)
      },
    })

    // Step 2: Scale up and move to "Hero Position" (left-center)
    const targetScale = 2.5 // Larger focus
    const heroX = -this.planes.sizes.width * 0.2 // 20% to the left
    const heroY = 0
    const heroZ = dummy.position.z + 8 // Bring forward significantly

    timeline.to(
      dummy.scale,
      {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 0.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<'
    )

    timeline.to(
      dummy.position,
      {
        x: heroX,
        y: heroY,
        z: heroZ,
        duration: 0.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<'
    )

    // Step 3: Subtle rotation for depth
    timeline.to(
      dummy.rotation,
      {
        y: 0.15, // Slight tilt towards the UI
        duration: 0.8,
        ease: 'power3.inOut',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<'
    )
  }

  /**
   * Animate card unfocus sequence
   */
  private animateUnfocus(
    instanceId: number,
    originalPosition: THREE.Vector3,
    originalRotation: THREE.Euler,
    originalScale: number
  ) {
    const dummy = new THREE.Object3D()
    this.planes.mesh.getMatrixAt(instanceId, dummy.matrix)
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

    const timeline = gsap.timeline()

    // Step 1: Restore position and scale
    timeline.to(
      dummy.position,
      {
        x: originalPosition.x,
        y: originalPosition.y,
        z: originalPosition.z,
        duration: 0.6,
        ease: 'power3.inOut',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      }
    )

    timeline.to(
      dummy.scale,
      {
        x: originalScale,
        y: originalScale,
        z: originalScale,
        duration: 0.6,
        ease: 'power3.inOut',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<'
    )

    // Step 2: Restore rotation
    timeline.to(
      dummy.rotation,
      {
        y: originalRotation.y,
        duration: 0.6,
        ease: 'power3.inOut',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<'
    )

    // Step 3: Fade in other cards
    timeline.to(
      this,
      {
        otherCardsOpacity: 1.0,
        duration: 0.4,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.updateOtherCardsOpacity(instanceId)
        },
      },
      '-=0.2'
    )
  }

  /**
   * Update card's transformation matrix
   */
  private updateCardMatrix(instanceId: number, dummy: THREE.Object3D) {
    dummy.updateMatrix()
    this.planes.mesh.setMatrixAt(instanceId, dummy.matrix)
    this.planes.mesh.instanceMatrix.needsUpdate = true
  }

  /**
   * Update opacity of non-focused cards
   */
  private updateOtherCardsOpacity(focusedInstanceId: number) {
    // This would ideally be done in the shader
    // For now, we can update a uniform that the shader reads
    if (this.planes.material.uniforms.uFocusedCard) {
      this.planes.material.uniforms.uFocusedCard.value = focusedInstanceId
      this.planes.material.uniforms.uOtherCardsOpacity.value = this.otherCardsOpacity
    }
  }

  /**
   * Check if a card is currently focused
   */
  isFocused(): boolean {
    return this.focusedCard !== null
  }

  /**
   * Get focused card ID
   */
  getFocusedCardId(): number | null {
    return this.focusedCard?.instanceId ?? null
  }

  /**
   * Register callback for when card is focused
   */
  onFocus(callback: (instanceId: number) => void) {
    this.onFocusCallback = callback
  }

  /**
   * Register callback for when card is unfocused
   */
  onUnfocus(callback: () => void) {
    this.onUnfocusCallback = callback
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate positions if card is focused
    if (this.focusedCard) {
      // Could adjust target positions based on new viewport size
    }
  }
}

/**
 * Add focus management to planes
 */
export function addFocusSystem(planes: Planes, camera: THREE.PerspectiveCamera): CardFocusManager {
  const focusManager = new CardFocusManager(planes, camera)

  // Store reference on planes object
  ;(planes as any).focusManager = focusManager

  return focusManager
}
