import { GameState } from "../core/GameState";
import { InputController } from "./InputController";
import { CollisionSystem } from "./CollisionSystem";
import { ScoreSystem } from "./ScoreSystem";
import { PowerUpSystem } from "./PowerUpSystem";

export class GameLoop {
  private state: GameState;
  private input: InputController;
  private collisionSystem: CollisionSystem;
  private scoreSystem: ScoreSystem;
  private powerUpSystem: PowerUpSystem;
  private lastTime: number = 0;
  private accumulatedTime: number = 0;

  constructor(state: GameState, input: InputController) {
    this.state = state;
    this.input = input;
    this.collisionSystem = new CollisionSystem(state);
    this.scoreSystem = new ScoreSystem(state);
    this.powerUpSystem = new PowerUpSystem(state);
  }

  start(currentTime: number) {
    this.lastTime = currentTime;
    this.gameLoop(currentTime);
  }

  private gameLoop(currentTime: number) {
    const deltaTime = (currentTime - this.lastTime) / 1000; // convert to seconds
    this.lastTime = currentTime;

    // Clamp delta time
    const clampedDelta = Math.min(deltaTime, 100 / 1000); // max 100ms
    this.accumulatedTime += deltaTime;

    // Process fixed-step updates
    while (this.accumulatedTime >= 1 / 60) {
      this.update(1 / 60);
      this.accumulatedTime -= 1 / 60;
    }

    // Render request
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(dt: number) {
    // Update input state
    this.input.update(dt);

    // Update game systems
    this.collisionSystem.update(dt);
    this.scoreSystem.update(dt);
    this.powerUpSystem.update(dt);

    // Update game state (timers, phase transitions, etc.)
    this.state.update(dt);
  }

  // Getters for rendering
  getState(): GameState {
    return this.state;
  }

  getScoreSystem(): ScoreSystem {
    return this.scoreSystem;
  }

  getPowerUpSystem(): PowerUpSystem {
    return this.powerUpSystem;
  }

  getCollisionSystem(): CollisionSystem {
    return this.collisionSystem;
  }
}
