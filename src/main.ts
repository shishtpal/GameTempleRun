import {Scene, PerspectiveCamera, WebGLRenderer, Color, AmbientLight, DirectionalLight} from 'three'
import {Game} from './app/Game'
import {GameState} from './core/GameState'
import {HTMLOverlay} from './ui/Screens'
import {LightingSystem} from './render/LightingSystem'
import {ParticleSystem} from './render/ParticleSystem'
import {AudioManager} from './audio/AudioManager'
import {QualityManager} from './render/QualityManager'

// Initialize game state
const gameState = new GameState()

// Initialize the game coordinator
const game = new Game()

// Initialize Quality Manager
const quality = QualityManager.getInstance()

// Initialize Three.js scene
const scene = new Scene()
scene.background = new Color(0x87CEEB) // Sky blue

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 5, 10)

// Initialize lighting system
const lighting = new LightingSystem(scene)

// Initialize particle system
const particles = new ParticleSystem(scene, gameState)

// Initialize audio manager
const audio = new AudioManager()

// Initialize renderer with quality settings
const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(quality.getSettings().textureDPR)
renderer.shadowMap.enabled = true // Enable shadows
document.body.appendChild(renderer.domElement)

// Lighting is handled by LightingSystem, but we also set up basic lights
// for the initial Three.js setup - the LightingSystem adds its own

// Initialize HUD overlay
const hud = new (await import('./ui/Screens')).HTMLOverlay()
hud.setGameState(gameState)

// Start the game loop
game.start()

// Handle window resize with quality adjustments
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Game loop - also handles rendering and countdown
let gameTime = 0
function animate(currentTime: number) {
  const deltaTime = (currentTime - gameTime) / 1000 // convert to seconds
  gameTime = currentTime

  // Update elapsed time
  gameState.elapsedSeconds += deltaTime

  // Check phase transitions - countdown
  if (gameState.phase === 'COUNTDOWN') {
    // 3-second countdown before RUNNING
    if (gameState.elapsedSeconds >= 3) {
      gameState.transitionPhase('RUNNING')
      gameState.elapsedSeconds = 0 // reset for gameplay
      audio.playUIClick()
    }
  }

  // Resize renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // Render scene
  renderer.render(scene, camera)

  // Update HUD
  hud.update()

  // Update particles
  particles.update(deltaTime)

  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)