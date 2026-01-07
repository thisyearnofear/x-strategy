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

    const { instanceId, originalPosition, originalRotation, originalScale } = this.focusedCard

    // Animate back to original state
    this.animateUnfocus(instanceId, originalPosition, originalRotation, originalScale)

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

    // Step 1: Fade other cards (0-200ms)
    timeline.to(this, {
      otherCardsOpacity: 0.3,
      duration: 0.2,
      ease: 'power2.out',
      onUpdate: () => {
        this.updateOtherCardsOpacity(instanceId)
      },
    })

    // Step 2: Move camera closer to card (200-600ms)
    const targetCameraZ = this.camera.position.z + 10
    timeline.to(
      this.camera.position,
      {
        z: targetCameraZ,
        duration: 0.4,
        ease: 'power2.inOut',
      },
      '<0.1' // Start slightly after fade
    )

    // Step 3: Scale up card (300-700ms)
    const targetScale = dummy.scale.x * 2.0
    timeline.to(
      dummy.scale,
      {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: 0.4,
        ease: 'back.out(1.2)',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<0.1'
    )

    // Step 4: Move card forward in Z (to prevent clipping)
    const targetZ = dummy.position.z + 5
    timeline.to(
      dummy.position,
      {
        z: targetZ,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<'
    )

    // Step 5: Center card in view (if not already centered)
    const targetX = 0
    const targetY = 0
    timeline.to(
      dummy.position,
      {
        x: targetX,
        y: targetY,
        duration: 0.4,
        ease: 'power2.inOut',
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

    // Reverse the focus animation
    timeline.to(
      dummy.position,
      {
        x: originalPosition.x,
        y: originalPosition.y,
        z: originalPosition.z,
        duration: 0.3,
        ease: 'power2.inOut',
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
        duration: 0.3,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.updateCardMatrix(instanceId, dummy)
        },
      },
      '<'
    )

    timeline.to(
      this.camera.position,
      {
        z: this.camera.position.z - 10,
        duration: 0.3,
        ease: 'power2.inOut',
      },
      '<'
    )

    timeline.to(
      this,
      {
        otherCardsOpacity: 1.0,
        duration: 0.2,
        ease: 'power2.out',
        onUpdate: () => {
          this.updateOtherCardsOpacity(instanceId)
        },
      },
      '<0.1'
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
