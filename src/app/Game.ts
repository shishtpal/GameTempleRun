import { GameState } from "../core/GameState";
import { PlayerController } from "../gameplay/PlayerController";
import { CollisionSystem } from "../gameplay/CollisionSystem";
import { ScoreSystem } from "../gameplay/ScoreSystem";
import { PowerUpSystem } from "../gameplay/PowerUpSystem";
import { TrackGenerator } from "../world/TrackGenerator";

export class Game {
  private state: GameState;
  private playerController: PlayerController;
  private collisionSystem: CollisionSystem;
  private scoreSystem: ScoreSystem;
  private powerUpSystem: PowerUpSystem;
  private trackGenerator: TrackGenerator;
  private lastTime: number = 0;
  private accumulatedTime: number = 0;
  private static FIXED_TIME_STEP = 1 / 60; // 60 FPS
  private static MAX_ACCUMULATED_TIME = 100 / 1000; // 100ms

  constructor() {
    // Initialize game state
    this.state = new GameState();

    // Initialize subsystems
    this.playerController = new PlayerController(this.state);
    this.collisionSystem = new CollisionSystem(this.state);
    this.scoreSystem = new ScoreSystem(this.state);
    this.powerUpSystem = new PowerUpSystem(this.state);
    this.trackGenerator = new TrackGenerator(this.state);
  }

  start() {
    console.log("Sky Relic Runner - Game started");
    this.gameLoop(0);
  }

  private gameLoop(currentTime: number) {
    const deltaTime = (currentTime - this.lastTime) / 1000; // convert to seconds
    this.lastTime = currentTime;

    // Clamp delta time to prevent spiral of death
    const clampedDelta = Math.min(deltaTime, 100 / 1000); // 100ms max
    this.accumulatedTime += deltaTime;

    // Process fixed-step updates
    while (this.accumulatedTime >= Game.FIXED_TIME_STEP) {
      this.update(Game.FIXED_TIME_STEP);
      this.accumulatedTime -= Game.FIXED_TIME_STEP;
    }

    // Render request
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(dt: number) {
    // Update track generation
    this.trackGenerator.update(dt);

    // Update input
    this.playerController.update(dt);

    // Update game systems
    this.collisionSystem.update(dt);
    this.scoreSystem.update(dt);
    this.powerUpSystem.update(dt);

    // Update game state (timers, phase transitions, etc.)
    this.state.update(dt);
  }

  render() {
    // Rendering will be handled by the Three.js scene
    // This is called after fixed-step updates
  }

  resize() {
    // Handle canvas resize
    console.log("Window resized");
  }
}
