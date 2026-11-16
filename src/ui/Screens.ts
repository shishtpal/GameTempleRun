import { GameState } from "../core/GameState";

export class HTMLOverlay {
  private gameState: GameState;
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.pointerEvents = "none";
    this.container.style.zIndex = "10";
    document.body.appendChild(this.container);

    this.initializeUI();
  }

  setGameState(state: GameState) {
    this.gameState = state;
    this.updateUI();
  }

  private initializeUI() {
    // Create HUD container
    this.container.innerHTML = `
      <style>
        * { box-sizing: border-style; }
        body { margin: 0; font-family: 'Arial', sans-serif; }
        .game-container { position: relative; width: 100%; height: 100vh; overflow: hidden; background: #87CEEB; }
        .hud { position: absolute; top: 20px; left: 20px; color: white; font-size: 24px; pointer-events: none; }
        .hud span { margin-right: 20px; }
        .hud span { display: inline-block; min-width: 40px; text-align: center; }
        .menu-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: auto; color: white; transition: opacity 0.3s ease; }
        .menu-overlay.hidden { display: none; opacity: 0; }
        .menu-overlay h1 { font-size: 48px; margin-bottom: 20px; }
        .menu-overlay p { margin: 10px 0; font-size: 18px; }
        .button { padding: 15px 30px; font-size: 20px; margin: 10px; cursor: pointer; background: #ff6b6b; border: none; border-radius: 8px; color: white; transition: background 0.3s; }
        .button:hover { background: #ff5252; }
        .button:disabled { background: #ccc; cursor: not-allowed; }
        .power-up-indicator { position: absolute; top: 20px; right: 20px; display: flex; gap: 15px; pointer-events: none; }
        .power-up { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; background: #333; opacity: 0; transition: opacity 0.3s; }
        .power-up.active { opacity: 1; }
        .score-display { font-size: 28px; margin: 10px 0; }
      </style>
      <div class="hud">
        <div class="score-display">Distance: <span id="hud-distance">0m</span></div>
        <div class="score-display">Score: <span id="hud-score">0</span></div>
        <div class="score-display">Relics: <span id="hud-relics">0</span></div>
        <div class="power-up-indicator">
          <div class="power-up shield" id="shield-icon">SHLD</div>
          <div class="power-up magnet" id="magnet-icon">MAG</div>
          <div class="power-up multiplier" id="multiplier-icon">2X</div>
        </div>
      </div>
      <div class="menu-overlay" id="menu-overlay">
        <h1>Sky Relic Runner</h1>
        <button class="button" id="play-btn">Play</button>
        <button class="button" id="settings-btn">Settings</button>
        <button class="button" id="credits-btn">How to Play</button>
      </div>
    `;

    // Play button
    const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
    playBtn.addEventListener("click", () => {
      this.gameState.transitionPhase("COUNTDOWN");
    });

    // Initial UI update
    this.updateUI();
  }

  private updateUI() {
    // Update HUD display
    const distanceEl = document.getElementById("hud-distance") as HTMLSpanElement;
    const scoreEl = document.getElementById("hud-score") as HTMLSpanElement;
    const relicsEl = document.getElementById("hud-relics") as HTMLSpanElement;
    const shieldEl = document.getElementById("shield-icon") as HTMLDivElement;

    if (distanceEl) distanceEl.textContent = Math.floor(this.gameState.run.distance) + "m";
    if (scoreEl) scoreEl.textContent = Math.floor(this.gameState.run.score);
    if (relicsEl) relicsEl.textContent = Math.floor(this.gameState.run.relics);
    if (shieldEl)
      shieldEl.style.display = this.gameState.player.protectedByShield ? "block" : "none";

    // Show/hide menu overlay based on phase
    const menuOverlay = document.getElementById("menu-overlay") as HTMLDivElement;
    if (!menuOverlay) return;

    switch (this.gameState.phase) {
      case "MENU":
        menuOverlay.classList.remove("hidden");
        menuOverlay.innerHTML = `
          <h1>Sky Relic Runner</h1>
          <button class="button" id="play-btn">Play</button>
          <button class="button" id="settings-btn">Settings</button>
          <button class="button" id="credits-btn">How to Play</button>
        `;
        break;

      case "PAUSED":
        menuOverlay.classList.remove("hidden");
        menuOverlay.innerHTML = `
          <h1>Paused</h1>
          <button class="button" id="resume-btn">Resume</button>
          <button class="button" id="restart-btn">Restart</button>
          <button class="button" id="menu-btn">Main Menu</button>
        `;
        break;

      case "GAME_OVER":
        menuOverlay.classList.remove("hidden");
        const bestDist = window.localStorage.getItem("bestDistance");
        menuOverlay.innerHTML = `
          <h1>Game Over</h1>
          <p>Distance: <span id="go-distance">${Math.floor(this.gameState.run.distance)}m</span></p>
          <p>Score: <span id="go-score">${Math.floor(this.gameState.run.score)}</span></p>
          <p>Relics: <span id="go-relics">${Math.floor(this.gameState.run.relics)}</span></p>
          <p>Best Distance: <span id="best-distance">${bestDist || "0m"}</span></p>
          <button class="button" id="retry-btn">Retry</button>
          <button class="button" id="menu-btn2">Main Menu</button>
        `;
        break;

      case "RUNNING":
      case "BOOT":
      case "COUNTDOWN":
        menuOverlay.classList.add("hidden");
        break;
    }

    // Add event listeners for menu buttons after re-creating content
    this.attachMenuListeners();
  }

  private attachMenuListeners() {
    const menuOverlay = document.getElementById("menu-overlay") as HTMLDivElement;
    if (!menuOverlay || menuOverlay.dataset.listenersAttached) return;
    menuOverlay.dataset.listenersAttached = "true";

    // Play button
    const playBtn = menuOverlay.querySelector("#play-btn") as HTMLButtonElement | null;
    playBtn?.addEventListener("click", () => {
      this.gameState.transitionPhase("COUNTDOWN");
    });

    // Retry button (Game Over)
    const retryBtn = menuOverlay.querySelector("#retry-btn") as HTMLButtonElement | null;
    retryBtn?.addEventListener("click", () => {
      this.gameState.transitionPhase("BOOT");
    });

    // Main Menu button
    const menuBtn = menuOverlay.querySelector("#menu-btn") as HTMLButtonElement | null;
    const menuBtn2 = menuOverlay.querySelector("#menu-btn2") as HTMLButtonElement | null;
    menuBtn?.addEventListener("click", () => {
      this.gameState.transitionPhase("MENU");
    });
    menuBtn2?.addEventListener("click", () => {
      this.gameState.transitionPhase("MENU");
    });

    // Resume button (Paused)
    const resumeBtn = menuOverlay.querySelector("#resume-btn") as HTMLButtonElement | null;
    resumeBtn?.addEventListener("click", () => {
      this.gameState.transitionPhase("RUNNING");
    });

    // Restart button (Paused)
    const restartBtn = menuOverlay.querySelector("#restart-btn") as HTMLButtonElement | null;
    restartBtn?.addEventListener("click", () => {
      this.gameState.transitionPhase("BOOT");
    });
  }
}
