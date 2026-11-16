import {GameState} from '../core/GameState'

/**
 * Graphics quality settings for Sky Relic Runner.
 * Supports Auto, Low, Medium, High modes.
 * Adjusts shadow resolution, texture DPR, particle count, and effects quality.
 */

export type QualityMode = 'AUTO' | 'LOW' | 'MEDIUM' | 'HIGH'

export interface QualitySettings {
  mode: QualityMode
  // Texture resolution scale (1.0 = 100%, 1.5 = 150%, 2.0 = 200%)
  textureDPR: number
  // Shadow map resolution (512, 1024, 2048)
  shadowResolution: number
  // Maximum particle count
  maxParticles: number
  // Whether to enable post-processing effects
  enableEffects: boolean
  // Whether to respect prefers-reduced-motion
  respectReducedMotion: boolean
}

export class QualityManager {
  private static instance: QualityManager
  private currentMode: QualityMode = 'AUTO'
  private settings: QualitySettings
  private reducedMotion: boolean = false

  private constructor() {
    // Initialize from localStorage or defaults
    const savedMode = localStorage.getItem('qualityMode') as QualityMode | null
    const savedSettings = localStorage.getItem('qualitySettings') as string | null

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        this.settings = {
          mode: savedMode || 'AUTO',
          textureDPR: parsed.textureDPR || 1.5,
          shadowResolution: parsed.shadowResolution || 1024,
          maxParticles: parsed.maxParticles || 200,
          enableEffects: parsed.enableEffects !== undefined ? parsed.enableEffects : true,
          respectReducedMotion: parsed.respectReducedMotion || false,
        }
      } catch {
        this.settings = this.getDefaultSettings()
      }
    } else {
      this.settings = this.getDefaultSettings()
    }

    // Check for reduced-motion preference
    try {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      this.reducedMotion = false
    }

    // Apply reduced-motion immediately
    if (this.reducedMotion) {
      this.settings.mode = 'LOW'
      this.settings.enableEffects = false
    }

    this.applyMode(this.settings.mode)
  }

  static getInstance(): QualityManager {
    if (!QualityManager.instance) {
      QualityManager.instance = new QualityManager()
    }
    return QualityManager.instance
  }

  private getDefaultSettings(): QualitySettings {
    return {
      mode: 'AUTO',
      textureDPR: 1.5,
      shadowResolution: 1024,
      maxParticles: 200,
      enableEffects: true,
      respectReducedMotion: false,
    }
  }

  getSettings(): QualitySettings {
    return { ...this.settings }
  }

  /** Apply the current quality mode */
  applyMode(mode: QualityMode) {
    this.currentMode = mode

    switch (mode) {
      case 'LOW':
        this.settings.textureDPR = 1.0
        this.settings.shadowResolution = 512
        this.settings.maxParticles = 50
        this.settings.enableEffects = false
        break
      case 'MEDIUM':
        this.settings.textureDPR = 1.5
        this.settings.shadowResolution = 1024
        this.settings.maxParticles = 100
        this.settings.enableEffects = true
        break
      case 'HIGH':
        this.settings.textureDPR = 2.0
        this.settings.shadowResolution = 2048
        this.settings.maxParticles = 200
        this.settings.enableEffects = true
        break
      case 'AUTO':
        // Detect device capabilities and set mode
        const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|Mobi|Mobile|Symbian/.test(navigator.userAgent)
        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4

        if (isLowEnd || this.reducedMotion) {
          this.settings.mode = 'LOW'
          this.applyMode('LOW')
        } else if (isMobile) {
          this.settings.mode = 'MEDIUM'
          this.applyMode('MEDIUM')
        } else {
          this.settings.mode = 'HIGH'
          this.applyMode('HIGH')
        }
        break
    }

    // Save to localStorage
    try {
      localStorage.setItem('qualityMode', this.settings.mode)
      localStorage.setItem('qualitySettings', JSON.stringify(this.settings))
    } catch {
      // Ignore storage errors
    }
  }

  /** Get texture resolution for a given base size */
  getTextureResolution(baseSize: number): number {
    return Math.round(baseSize * this.settings.textureDPR)
  }

  /** Get shadow map width */
  getShadowWidth(): number {
    return this.settings.shadowResolution
  }

  /** Get maximum particle count */
  getMaxParticles(): number {
    return this.settings.maxParticles
  }

  /** Check if effects should be enabled */
  shouldEnableEffects(): boolean {
    return this.settings.enableEffects && !this.reducedMotion
  }
}