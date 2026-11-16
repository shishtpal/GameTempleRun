import { GameState } from "../core/GameState";
import { PowerUpType } from "../core/GameState";

export class HUD {
  private gameState: GameState;
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "20px";
    this.container.style.left = "20px";
    this.container.style.color = "white";
    this.container.style.fontFamily = "Arial, sans-serif";
    this.container.style.pointerEvents = "none";
    this.container.style.zIndex = "100";
    document.body.appendChild(this.container);

    this.update();
  }

  setGameState(state: GameState) {
    this.gameState = state;
  }

  update() {
    if (!this.gameState) return;

    // Distance display
    const distance = this.gameState.run.distance;
    this.container.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px;">
        Distance: <span id="hud-distance">${Math.floor(distance)}m</span><br/>
        Score: <span id="hud-score">${Math.floor(this.gameState.run.score)}</span><br/>
        Relics: <span id="hud-relics">${Math.floor(this.gameState.run.relics)}
      </div>`;

    // Power-up indicators
    this.updatePowerUpIndicators();
  }

  private updatePowerUpIndicators() {
    // Shield indicator
    const shieldEl = document.getElementById("hud-shield") as HTMLDivElement | null;
    if (shieldEl) {
      shieldEl.style.display = this.gameState.player.protectedByShield ? "block" : "none";
    }

    // Multiplier indicator
    const multEl = document.getElementById("hud-multiplier") as HTMLDivElement | null;
    if (multEl) {
      multEl.style.display = this.gameState.run.multiplier > 1 ? "block" : "none";
      if (multEl.style.display === "block") {
        multEl.textContent = `2x Mul`;
      }
    }

    // Magnet indicator
    const magnetEl = document.getElementById("hud-magnet") as HTMLDivElement | null;
    if (magnetEl) {
      magnetEl.style.display = false; // Simplified - would show timer
    }
  }
}
