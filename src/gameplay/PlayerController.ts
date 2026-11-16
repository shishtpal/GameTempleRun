import { GameState } from "../core/GameState";

export class PlayerController {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  update(dt: number) {
    // Player input is handled separately; this updates posture based on state
    // Lane changes, jumps, and slides are queued in the InputController
    // and applied here with proper timing

    // Handle slide state timer
    if (this.state.player.posture === "SLIDING") {
      if (this.state.player.slideRemaining > 0) {
        this.state.player.slideRemaining -= dt;
        if (this.state.player.slideRemaining <= 0) {
          this.state.player.posture = "RUNNING";
          this.state.player.slideRemaining = 0;
          // Restore collision height after slide
        }
      }
    }

    // Handle jump state timer
    if (this.state.player.posture === "JUMPING") {
      // Apply gravity
      this.state.player.verticalVelocity -= 9.81 * dt; // gravity
      this.state.player.y += this.state.player.verticalVelocity * dt;

      // Check landing
      if (this.state.player.y <= 0) {
        this.state.player.y = 0;
        this.state.player.verticalVelocity = 0;
        this.state.player.posture = "RUNNING";
      }
    }
  }

  // Queue a lane change (called from InputController)
  changeLane(direction: -1 | 1) {
    // Queue lane change with interpolation
    const targetLane = this.state.player.lane + direction;
    if (targetLane >= -1 && targetLane <= 1) {
      this.state.setLane(targetLane);
      // Lateral offset will be interpolated in the renderer
    }
  }

  // Queue a jump (called from InputController)
  jump() {
    if (this.state.player.posture === "RUNNING") {
      this.state.player.posture = "JUMPING";
      this.state.player.verticalVelocity = 8; // initial jump velocity
    }
  }

  // Queue a slide (called from InputController)
  slide() {
    if (this.state.player.posture === "RUNNING") {
      this.state.player.posture = "SLIDING";
      this.state.player.slideRemaining = 0.75; // 0.75 seconds
      // Reduce collision height during slide
    }
  }
}
