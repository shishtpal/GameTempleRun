import {Audio, AudioLoader, AudioListener} from 'three'

/**
 * Audio manager for Sky Relic Runner.
 * Locally shipped SFX with graceful Web Audio API fallback.
 * All audio is bundled/ship-ped; no runtime CDN requests.
 */

export class AudioManager {
  private listener: AudioListener
  private audioContext: AudioContext | null = null
  private howl: any | null = null // Howl for HTML5 audio fallback
  private isInitialized: boolean = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      // Create Three.js audio listener
      this.listener = new AudioListener()
      ;(this.listener as any).getAudioContext = () => {
        return new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      this.isInitialized = true
    } catch (e) {
      console.warn('AudioContext not available', e)
      this.isInitialized = false
    }
  }

  /** Load a sound from a local URL */
  loadSound(url: string, volume: number = 1.0): Audio | null {
    if (!this.isInitialized || !this.listener) return null

    try {
      const sound = new Audio(this.listener)
      const loader = new AudioLoader()
      loader.load(url, (buffer) => {
        sound.setBuffer(buffer)
        sound.setLoop(false)
        sound.setVolume(volume)
      })
      return sound
    } catch (e) {
      console.warn('Failed to load sound', url, e)
      return null
    }
  }

  /** Play a sound once */
  playSound(url: string, volume: number = 1.0): void {
    const sound = this.loadSound(url, volume)
    if (sound) {
      sound.play()
    }
  }

  /** Play UI click sound */
  playUIClick(): void {
    this.playSound('/assets/audio/click.mp3', 0.8)
  }

  /** Play footstep sound */
  playFootstep(): void {
    this.playSound('/assets/audio/footstep.mp3', 0.5)
  }

  /** Play jump sound */
  playJump(): void {
    this.playSound('/assets/audio/jump.mp3', 0.9)
  }

  /** Play slide sound */
  playSlide(): void {
    this.playSound('/assets/audio/slide.mp3', 0.7)
  }

  /** Play power-up activation sound */
  playPowerUp(type: 'shield' | 'magnet' | 'multiplier'): void {
    const urls: Record<'shield' | 'magnet' | 'multiplier', string> = {
      shield: '/assets/audio/shield.mp3',
      magnet: '/assets/audio/magnet.mp3',
      multiplier: '/assets/audio/multiplier.mp3',
    }
    this.playSound(type.urls[type], 0.8)
  }

  /** Play collision sound */
  playCollision(): void {
    this.playSound('/assets/audio/collision.mp3', 1.0)
  }

  /** Check if Web Audio API is available */
  isSupported(): boolean {
    try {
      return !!window.AudioContext || !!window.webkitAudioContext
    } catch (e) {
      return false
    }
  }

  /** Dispose all audio resources */
  dispose(): void {
    this.isInitialized = false
    if (this.howl) {
      this.howl.stop()
    }
  }
}