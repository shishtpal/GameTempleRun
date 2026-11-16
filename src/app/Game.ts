import { GameState } from "../core/GameState";
import { PlayerController } from "../gameplay/PlayerController";
import { CollisionSystem } from "../gameplay/CollisionSystem";
import { ScoreSystem } from "../gameplay/ScoreSystem";
import { PowerUpSystem } from "../gameplay/PowerUpSystem";
import { TrackGenerator } from "../world/TrackGenerator";
import { Persistence } from "../core/Persistence";

export class Game {
  private state: GameState;
  private playerController: PlayerController;
  private collisionSystem: CollisionSystem;
  private scoreSystem: ScoreSystem;
  private powerUpSystem: PowerUpSystem;
  private trackGenerator: TrackGenerator | null = null;
  private lastTime: number = 0;
  private accumulatedTime: number = 0;
  private static FIXED_TIME_STEP = 1 / 60;
  private static MAX_ACCUMULATED_TIME = 100 / 1000;

  constructor() {
    // Initialize game state and load persisted state
    this.state = Persistence.load(new GameState());

    // Initialize subsystems
    this.playerController = new PlayerController(this.state);
    this.collisionSystem = new CollisionSystem(this.state);
    this.scoreSystem = new ScoreSystem(this.state);
    this.powerUpSystem = new PowerUpSystem(this.state);
  }

  start() {
    console.log("Sky Relic Runner - Game started");
    this.gameLoop(0);
  }

  private gameLoop(currentTime: number) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta time
    const clampedDelta = Math.min(deltaTime, 100 / 1000);
    this.accumulatedTime += deltaTime;

    // Process fixed-step updates
    while (this.accumulatedTime >= Game.FIXED_TIME_STEP) {
      this.update(Game.FIXED_TIME_STEP);
      this.accumulatedTime -= Game.FIXED_TIME_STEP;
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(dt: number) {
    // Check for countdown completion
    if (this.state.phase === "COUNTDOWN") {
      // Countdown handled in main.ts - just ensure it progresses
      if (this.state.elapsedSeconds >= 3) {
        this.state.transitionPhase("RUNNING");
        this.state.elapsedSeconds = 0;
      }
      return;
    }

    // Initialize track generator when starting
    if (this.state.phase === "RUNNING" && !this.trackGenerator) {
      this.trackGenerator = new TrackGenerator(this.state);
    }

    // Update track generation
    this.trackGenerator?.update(dt);

    // Update input
    this.playerController.update(dt);

    // Update game systems
    this.collisionSystem.update(dt);
    this.scoreSystem.update(dt);
    this.powerUpSystem.update(dt);

    // Update game state timers
    this.state.update(dt);

    // Save state after each update
    Persistence.save(this.state);
  }

  render() {
    // Rendering handled elsewhere
  }

  resize() {
    console.log("Window resized");
  }
}
