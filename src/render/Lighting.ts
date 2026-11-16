import {Scene, Color, AmbientLight, DirectionalLight, HemisphereLight, Fog} from 'three'

/**
 * Lighting system for Sky Relic Runner.
 * Creates the atmospheric look described in PRD §6.1:
 * - Warm golden-hour lighting
 * - Weathered sandstone colors
 * - Oxidized brass accents
 * - Luminous turquoise relics
 * - Cohesive painterly low-poly aesthetic
 * - Fog/mist for depth cues
 * - Shadows on key objects only
 */

export class LightingSystem {
  private scene: THREE.Scene
  private sun: DirectionalLight
  private ambient: AmbientLight
  private hemisphere: HemisphereLight

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.initialize()
  }

  private initialize() {
    // Hemisphere light for ambient skylight (golden hour)
    this.hemisphere = new HemisphereLight(0xffd180, 0x835f33, 0.6)
    this.scene.add(this.hemisphere)

    // Ambient light
    this.ambient = new AmbientLight(0xffffff, 0.4)
    this.scene.add(this.ambient)

    // Directional light - "sun" for golden-hour look
    this.sun = new DirectionalLight(0xffb347, 0.8)
    this.sun.position.set(50, 80, 30)
    this.scene.add(this.sun)

    // Add a "rim" light for side-facing illumination
    const rimLight = new DirectionalLight(0xff6b6b, 0.3)
    rimLight.position.set(-50, 30, -30)
    this.scene.add(rimLight)

    // Fog for depth cues (PRD §6.1: "clear depth cues: mist/fog")
    this.scene.fog = new THREE.Fog(0x87CEEB, 20, 80) // sky blue fog matching background

    // directional light shadow casting
    this.sun.castShadow = true
    this.sun.shadow.mapSize.width = 1024
    this.sun.shadow.mapSize.height = 1024
    this.sun.shadow.bias = -0.0001
    this.sun.shadow.radius = 4
  }

  /** Update lighting parameters (e.g., time of day) */
  update(timeOfDay: 'sunrise' | 'day' | 'sunset' | 'evening') {
    switch (timeOfDay) {
      case 'sunrise':
        // Warm up the colors
        this.hemisphere.color.set(0xffd5a0)
        this.hemisphere.groundColor.set(0xff8c42)
        this.sun.color.set(0xff9f40)
        break
      case 'sunset':
        // Already set by default initialization
        this.hemisphere.color.set(0xff6b35)
        this.hemisphere.groundColor.set(0x4a2c2a)
        this.sun.color.set(0xff4500)
        break
      case 'evening':
        this.hemisphere.color.set(0x4a90e2)
        this.hemisphere.groundColor.set(0x2c5aa0)
        this.sun.intensity = 0.5
        break
      case 'day':
        this.hemisphere.color.set(0x87ceeb)
        this.hemisphere.groundColor.set(0x5f9ea0)
        this.sun.color.set(0x4e96d8)
        break
    }
  }

  /** Dispose all lights */
  dispose() {
    this.scene.remove(this.hemisphere)
    this.scene.remove(this.ambient)
    this.scene.remove(this.sun)
    // Remove rim light
    const idx = this.scene.children.indexOf(this.scene.children.find(c => c.type === 'DirectionalLight' && (c as any).name === 'rim'))
    if (idx > -1) this.scene.remove(this.scene.children[idx])
    this.scene.fog = undefined
  }
}