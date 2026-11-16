import { GameState } from "../core/GameState";

export class ScoreSystem {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  update(dt: number) {
    // Update elapsed time
    this.state.run.elapsedSeconds += dt;

    // Update speed - gradually increase from 10 to 22 units/sec over time
    // Speed increases smoothly; target 22 units/sec over several minutes
    const maxSpeed = 22;
    const minSpeed = 10;
    const speedIncreaseTime = 120; // seconds to reach max speed

    if (this.state.run.elapsedSeconds < speedIncreaseTime) {
      // Linear acceleration for simplicity
      const progress = this.state.run.elapsedSeconds / speedIncreaseTime;
      this.state.run.speed = minSpeed + progress * (maxSpeed - minSpeed);
    } else {
      this.state.run.speed = maxSpeed;
    }

    // Distance accumulates based on speed (fixed timestep logic)
    // In a real fixed-timestep loop, we'd add speed * dt each step
    // Here we accumulate proportionally
    const distanceIncrement = (this.state.run.speed * dt) / 60; // scaled for 60 FPS reference
    this.state.addDistance(distanceIncrement);

    // Score accumulates: floor(distance × baseDistanceRate) + relicPoints × multiplier
    // baseDistanceRate is 1 unit = 1 point for simplicity
    const baseDistanceRate = 1;
    const scoreFromDistance = Math.floor(distanceIncrement * baseDistanceRate);
    this.state.addScore(scoreFromDistance);
  }

  // Add relic points (called when relic collected)
  addRelicPoints(points: number) {
    this.state.addRelics(points);
    this.state.addScore(points);
  }

  // Apply multiplier (called when power-up collected)
  applyMultiplier() {
    this.state.setMultiplier(2);
    // Multiplier lasts 8 seconds - will decay back to 1 after expiration
    setTimeout(() => {
      this.state.setMultiplier(1);
    }, 8000);
  }
}
