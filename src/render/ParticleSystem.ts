import {GameState} from '../core/GameState'
import {Vector3} from 'three'

/**
 * Particle system for game effects:
 * - Jump dust puff (takeoff & landing)
 * - Slide streak
 * - Shield bubble
 * - Magnet attraction lines
 * - Multiplier glow
 * - Collision impact burst
 * - Relic sparkle
 */

export class ParticleSystem {
  private gameState: GameState
  private scene: THREE.Scene
  private particles: THREE.Group
  private emitter: Vector3
  private active: boolean = false

  constructor(scene: THREE.Scene, gameState: GameState) {
    this.scene = scene
    this.gameState = gameState
    this.particles = new THREE.Group()
    this.scene.add(this.particles)
    this.emitter = new Vector3(0, 0, 0)
  }

  /** Emit particles at given position */
  emit(type: 'jump-takeoff' | 'jump-land' | 'slide' | 'shield' | 'collision' | 'magnet' | 'pickup' | 'multiplier', position: Vector3) {
    this.active = true
    this.emitter.copy(position)

    switch (type) {
      case 'jump-takeoff':
        this.emitJumpTakeoff()
        break
      case 'jump-land':
        this.emitJumpLand()
        break
      case 'slide':
        this.emitSlide()
        break
      case 'shield':
        this.emitShield()
        break
      case 'collision':
        this.emitCollision()
        break
      case 'magnet':
        this.emitMagnet()
        break
      case 'pickup':
        this.emitPickup()
        break
      case 'multiplier':
        this.emitMultiplier()
        break
    }
  }

  private emitJumpTakeoff() {
    // 4 small puff particles rising
    const color = new THREE.Color(0x64ffda)
    for (let i = 0; i < 4; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 4, 4)
      const material = new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.8})
      const particle = new THREE.Mesh(geometry, material)
      particle.position.set(
        Math.random() * 0.5 - 0.25,
        0,
        Math.random() * 0.5 - 0.25
      )
      this.particles.add(particle)

      // Animate upward
      const startY = particle.position.y
      const animate = () => {
        particle.position.y += 0.1
        particle.scale.multiplyScalar(1.01)
        if (particle.position.y > 2 || particle.scale.x > 2) {
          this.particles.remove(particle)
          this.scene.remove(particle)
        } else {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }

  private emitJumpLand() {
    // Larger burst on landing
    const color = new THREE.Color(0xff6b6b)
    const count = 12
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const speed = 0.3 + Math.random() * 0.3
      const vx = Math.cos(angle) * speed
      const vz = Math.sin(angle) * speed
      const vy = 0.5 + Math.random() * 0.5

      const geometry = new THREE.SphereGeometry(0.15, 4, 4)
      const material = new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.9})
      const particle = new THREE.Mesh(geometry, material)
      particle.position.set(
        Math.random() * 0.5 - 0.25,
        0,
        Math.random() * 0.5 - 0.25
      )
      this.particles.add(particle)

      // Store velocity for animation loop
      ;(particle as any).vx = vx
      ;(particle as any).vz = vz
      ;(particle as any).vy = vy
    }
  }

  private emitSlide() {
    // Streak behind player
    const color = new THREE.Color(0x33b5e5)
    const geometry = new THREE.BoxGeometry(0.5, 0.05, 0.05)
    const material = new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.6})
    const particle = new THREE.Mesh(geometry, material)
    particle.position.set(0, 0, 0)
    this.particles.add(particle)

    // Move backward with fade
    const startTime = performance.now()
    const animate = () => {
      const elapsed = performance.now() - startTime
      if (elapsed > 700) {
        this.particles.remove(particle)
        this.scene.remove(particle)
        return
      }
      particle.position.z -= 0.1
      particle.material.opacity -= 0.001
      particle.material.needsUpdate = true
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  private emitShield() {
    // Bubble around player
    const geometry = new THREE.SphereGeometry(1.5, 16, 16)
    const material = new THREE.MeshBasicMaterial({
      color: 0x66b2ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
    const particle = new THREE.Mesh(geometry, material)
    this.particles.add(particle)

    // Pulse animation
    const startScale = particle.scale.x
    const animate = () => {
      const t = performance.now() % 2000 / 2000
      const scale = startScale * (1 + Math.sin(t * Math.PI) * 0.2)
      particle.scale.setScalar(scale)
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  private emitCollision() {
    // Impact burst at player position
    const color = new THREE.Color(0xffd93d)
    const count = 20
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 4, 4)
      const material = new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.8})
      const particle = new THREE.Mesh(geometry, material)
      const angle = (i / count) * Math.PI * 2
      const spread = 0.5
      particle.position.set(
        Math.cos(angle) * spread,
        Math.random() * spread,
        Math.sin(angle) * spread
      )
      this.particles.add(particle)

      // Fly outward
      const startTime = performance.now()
      const animate = () => {
        const elapsed = performance.now() - startTime
        const progress = elapsed / 300 // 300ms duration
        if (progress > 1) {
          this.particles.remove(particle)
          this.scene.remove(particle)
          return
        }
        particle.position.multiplyScalar(1.02) // slowly expand
        particle.material.opacity -= 0.02
        particle.material.needsUpdate = true
        requestAnimationFrame(animate)
      }
      animate()
    }
  }

  private emitMagnet() {
    // Circular attraction lines around player
    const geometry = new THREE.RingGeometry(1, 1.2, 32)
    const material = new THREE.MeshBasicMaterial({
      color: 0x6c5ce7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    })
    const particle = new THREE.Mesh(geometry, material)
    particle.rotation.x = Math.PI / 2
    this.particles.add(particle)

    // Rotate slowly
    const startTime = performance.now()
    const animate = () => {
      const elapsed = performance.now() - startTime
      particle.rotation.z += 0.01
      particle.material.opacity = 0.4 * (1 - elapsed / 5000)
      particle.material.needsUpdate = true
      if (elapsed > 5000) {
        this.particles.remove(particle)
        this.scene.remove(particle)
        return
      }
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  private emitPickup() {
    // Sparkle when relic collected
    const geometry = new THREE.SphereGeometry(0.2, 4, 4)
    const material = new THREE.MeshBasicMaterial({color: 0xffd700, transparent: true, opacity: 0.9})
    const particle = new THREE.Mesh(geometry, material)
    particle.position.set(0, 0.5, 0) // above ground
    this.particles.add(particle)

    // Bounce and fade
    const startY = particle.position.y
    const animate = () => {
      particle.position.y = startY + Math.sin(performance.now() / 100) * 0.3
      particle.material.opacity -= 0.001
      particle.material.needsUpdate = true
      if (particle.position.y > startY + 0.5 || particle.material.opacity < 0.1) {
        this.particles.remove(particle)
        this.scene.remove(particle)
        return
      }
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  private emitMultiplier() {
    // Glowing 2x marker
    const geometry = new THREE.OctahedronGeometry(0.3)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.8,
    })
    const particle = new THREE.Mesh(geometry, material)
    this.particles.add(particle)

    // Pulse
    const animate = () => {
      const scale = 1 + Math.sin(performance.now() / 200) * 0.1
      particle.scale.setScalar(scale)
      particle.material.opacity = 0.8 + Math.sin(performance.now() / 300) * 0.1
      particle.material.needsUpdate = true
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  /** Update system each frame */
  update(dt: number) {
    if (!this.active) return

    // Fade out if no recent emissions
    // Particles are self-contained with their own animations
  }

  /** Dispose entire system */
  dispose() {
    this.particles.clear()
    this.scene.remove(this.particles)
  }
}