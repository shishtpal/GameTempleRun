import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  AmbientLight,
  DirectionalLight,
} from "three";
import { Game } from "./app/Game";
import { GameState } from "./core/GameState";
import { HTMLOverlay } from "./ui/Screens";

// Initialize game state
const gameState = new GameState();

// Initialize the game coordinator
const game = new Game();

// Initialize Three.js scene
const scene = new Scene();
scene.background = new Color(0x87ceeb); // Sky blue

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Start the game loop
game.start();

// Handle window resize
window.addEventListener("resize", () => {
  // Renderer resize handled in the game loop
});

// Game loop - also handles rendering and countdown
let gameTime = 0;
function animate(currentTime: number) {
  const deltaTime = (currentTime - gameTime) / 1000; // convert to seconds
  gameTime = currentTime;

  // Update game state elapsed time
  gameState.elapsedSeconds += deltaTime;

  // Check phase transitions
  if (gameState.phase === "COUNTDOWN") {
    // Simple countdown: 3 seconds, then start
    if (gameState.elapsedSeconds >= 3) {
      gameState.transitionPhase("RUNNING");
      gameState.elapsedSeconds = 0; // reset for gameplay
    }
  }

  // Resize renderer
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Render scene (would include player, track, etc.)
  // For now, just clear
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
