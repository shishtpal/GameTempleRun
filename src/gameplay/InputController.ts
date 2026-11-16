import { GameState } from "../core/GameState";
import { PlayerController } from "../gameplay/PlayerController";

// Input state tracking
const keyState = new Map<string, boolean>();
const swipeState = { startX: 0, startY: 0, direction: "", active: false };

// Minimum swipe distance in CSS pixels
const MIN_SWIPE_DISTANCE = 35;

export class InputController {
  private playerController: PlayerController;
  private state: GameState;
  private lastKeyPress: number = 0;
  private readonly KEY_COOLDOWN = 150; // ms between discrete actions

  constructor(state: GameState, playerController: PlayerController) {
    this.state = state;
    this.playerController = playerController;
    this.setupKeyboardListeners();
    this.setupTouchListeners();
  }

  private setupKeyboardListeners() {
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  private setupTouchListeners() {
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener("pointerdown", (e) => {
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      swipeState.active = true;
    });

    window.addEventListener("pointerup", (e) => {
      if (!swipeState.active) return;

      const deltaX = e.clientX - touchStartX;
      const deltaY = e.clientY - touchStartY;

      // Determine dominant axis
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) >= MIN_SWIPE_DISTANCE) {
          swipeState.direction = deltaX > 0 ? "RIGHT" : "LEFT";
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) >= MIN_SWIPE_DISTANCE) {
          swipeState.direction = deltaY > 0 ? "DOWN" : "UP";
        }
      }

      swipeState.active = false;
    });

    // Also handle mouse/trackpad clicks for desktop
    window.addEventListener("click", (e) => this.onMouseClick(e));
  }

  private onKeyDown(e: KeyboardEvent) {
    // Prevent default for game keys
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "KeyA",
        "KeyD",
        "Space",
        "KeyW",
        "KeyS",
      ].includes(e.code)
    ) {
      e.preventDefault();
    }

    const now = Date.now();

    // Cooldown check for discrete actions
    if (now - this.lastKeyPress < this.KEY_COOLDOWN) {
      return;
    }

    keyState.set(e.code, true);
    this.lastKeyPress = now;

    // Handle lane changes
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      if (this.canAct()) this.playerController.changeLane(-1);
    }
    if (e.code === "ArrowRight" || e.code === "KeyD") {
      if (this.canAct()) this.playerController.changeLane(1);
    }

    // Handle jump
    if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") {
      if (this.canAct()) this.playerController.jump();
    }

    // Handle slide
    if (e.code === "ArrowDown" || e.code === "KeyS") {
      if (this.canAct()) this.playerController.slide();
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    keyState.set(e.code, false);
  }

  private onMouseClick(e: MouseEvent) {
    // Start/restart - tap to start or retry
    if (this.state.phase === "MENU" || this.state.phase === "GAME_OVER") {
      this.state.transitionPhase("COUNTDOWN");
    }
    if (this.state.phase === "PAUSED") {
      this.state.transitionPhase("RUNNING");
    }
  }

  private canAct(): boolean {
    // Ignore gameplay input when player is dead or UI overlay has focus
    if (this.state.phase === "DYING" || this.state.phase === "GAME_OVER") {
      return false;
    }
    // Check cooldown
    const now = Date.now();
    if (now - this.lastKeyPress < this.KEY_COOLDOWN) {
      return false;
    }
    return true;
  }

  // Update method called each frame
  update(dt: number) {
    // Check for swipe input that was registered on pointerup
    // This is handled in the pointerup listener, but we can check state here
  }

  // Get currently pressed keys for continuous input
  isKeyDown(code: string): boolean {
    return keyState.get(code) || false;
  }
}
