import { GameState } from "../core/GameState";

export type CountdownState = "START" | "3" | "2" | "1" | "RUN";

export class Countdown {
  private gameState: GameState;
  private countdownEl: HTMLDivElement | null = null;
  private currentState: CountdownState = "START";
  private timer: number = 0;
  private lastUpdate: number = 0;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.initialize();
  }

  private initialize() {
    // Create countdown overlay
    this.countdownEl = document.createElement("div");
    this.countdownEl.style.position = "absolute";
    this.countdownEl.style.top = "40%";
    this.countdownEl.style.left = "50%";
    this.countdownEl.style.transform = "translate(-50%, -50%)";
    this.countdownEl.style.fontSize = "80px";
    this.countdownEl.style.fontFamily = "Arial, sans-serif";
    this.countdownEl.style.color = "white";
    this.countdownEl.style.pointerEvents = "none";
    this.countdownEl.style.zIndex = "1000";
    document.body.appendChild(this.countdownEl);

    // Start countdown when phase transitions
    this.gameState.transitionPhase.addListener?.("COUNTDOWN", () => {
      this.startCountdown();
    });
  }

  private startCountdown() {
    this.currentState = "3";
    this.timer = 0;
  }

  update(dt: number) {
    if (this.currentState === "START") {
      return;
    }

    this.timer += dt;

    // Update every second
    if (this.timer >= 1) {
      this.timer = 0;
      switch (this.currentState) {
        case "3":
          this.currentState = "2";
          this.countdownEl!.textContent = "2";
          break;
        case "2":
          this.currentState = "1";
          this.countdownEl!.textContent = "1";
          break;
        case "1":
          this.currentState = "RUN";
          this.countdownEl!.textContent = "RUN";
          // Schedule transition to RUNNING phase
          setTimeout(() => {
            this.gameState.transitionPhase("RUNNING");
          }, 1000);
          break;
        case "RUN":
          // Countdown complete, hide and allow input
          this.countdownEl!.style.display = "none";
          this.currentState = "START";
          break;
      }
    }
  }

  getState(): CountdownState {
    return this.currentState;
  }
}
