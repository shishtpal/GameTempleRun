import { GameState } from "../core/GameState";

export class HTMLOverlay {
  private gameState: GameState;
  private container: HTMLDivElement;

  constructor() {
    // Create overlay container
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.pointerEvents = "none"; // Allow input through to canvas
    this.container.style.zIndex = "10";
    document.body.appendChild(this.container);

    // Initialize UI elements
    this.initializeUI();

    // Listen for game state changes
    // In a full implementation, would use an event bus
  }

  private initializeUI() {
    // Main menu elements
    this.container.innerHTML = `
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Arial', sans-serif; }
        .game-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #87CEEB;
        }
        .hud {
          position: absolute;
          top: 20px;
          left: 20px;
          color: white;
          font-size: 24px;
          pointer-events: none;
        }
        .hud span { margin-right: 20px; }
        .menu-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          color: white;
          transition: opacity 0.3s ease;
        }
        .menu-overlay.hidden { display: none; }
        .menu-overlay h1 { font-size: 48px; margin-bottom: 20px; }
        .menu-overlay p { margin: 10px 0; font-size: 18px; }
        .button {
          padding: 15px 30px;
          font-size: 20px;
          margin: 10px;
          cursor: pointer;
          background: #ff6b6b;
          border: none;
          border-radius: 8px;
          color: white;
          transition: background 0.3s;
        }
        .button:hover { background: #ff5252; }
        .button:disabled { background: #ccc; cursor: not-allowed; }
        .power-up-indicator {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 15px;
          pointer-events: none;
        }
        .power-up {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          background: #333;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .power-up.active { opacity: 1; }
      </style>
      <div class="hud">
        <span>Dist: <span id="distance">0m</span></span>
        <span>Score: <span id="score">0</span></span>
        <span>Relics: <span id="relics">0</span></span>
      </div>
      <div class="power-up-indicator">
        <div class="power-up shield" id="shield-icon">SHLD</div>
        <div class="power-up magnet" id="magnet-icon">MAG</div>
        <div class="power-up multiplier" id="multiplier-icon">2X</div>
      </div>
      <div class="menu-overlay" id="menu-overlay">
        <h1>Sky Relic Runner</h1>
        <button class="button" id="play-btn">Play</button>
        <button class="button" id="settings-btn">Settings</button>
        <button class="button" id="credits-btn">How to Play</button>
      </div>
    `;

    // Add event listeners
    const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
    playBtn.addEventListener("click", () => {
      this.gameState.transitionPhase("COUNTDOWN");
    });

    // Initialize game state reference
    // In a full implementation, would inject the game state
    (this.container as any).gameState = this.gameState;
  }

  // Update HUD display
  updateHUD() {
    const distanceEl = document.getElementById("distance") as HTMLSpanElement;
    const scoreEl = document.getElementById("score") as HTMLSpanElement;
    const relicsEl = document.getElementById("relics") as HTMLSpanElement;

    if (distanceEl) distanceEl.textContent = Math.floor(this.gameState.run.distance) + "m";
    if (scoreEl) scoreEl.textContent = Math.floor(this.gameState.run.score);
    if (relicsEl) relicsEl.textContent = Math.floor(this.gameState.run.relics);
  }

  // Update power-up indicators
  updatePowerUps() {
    // Shield indicator
    const shieldEl = document.getElementById("shield-icon") as HTMLDivElement;
    if (shieldEl) {
      shieldEl.classList.toggle("active", this.gameState.player.protectedByShield);
    }

    // Magnet and multiplier would show timers
  }

  // Show a specific screen
  showScreen(screen: "menu" | "pause" | "game-over" | "results") {
    const overlay = document.getElementById("menu-overlay") as HTMLDivElement;
    overlay.classList.remove("hidden");

    // Customize based on screen type
    switch (screen) {
      case "menu":
        overlay.innerHTML = `
          <style>
            .menu-overlay { background: rgba(0,0,0,0.8); }
            .game-container { background: #87CEEB; }
          </style>
          <h1>Sky Relic Runner</h1>
          <button class="button" id="play-btn">Play</button>
          <button class="button" id="settings-btn">Settings</button>
          <button class="button" id="credits-btn">How to Play</button>
        `;
        const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
        playBtn.addEventListener("click", () => {
          this.gameState.transitionPhase("COUNTDOWN");
          overlay.classList.add("hidden");
        });
        break;

      case "game-over":
        overlay.innerHTML = `
          <style>
            .menu-overlay { background: rgba(0,0,0,0.8); }
          </style>
          <h1>Game Over</h1>
          <p>Distance: <span id="go-distance">0m</span></p>
          <p>Score: <span id="go-score">0</span></p>
          <p>Relics: <span id="go-relics">0</span></p>
          <button class="button" id="retry-btn">Retry</button>
          <button class="button" id="menu-btn">Main Menu</button>
        `;
        const retryBtn = document.getElementById("retry-btn") as HTMLButtonElement;
        const menuBtn = document.getElementById("menu-btn") as HTMLButtonElement;

        retryBtn.addEventListener("click", () => {
          this.gameState.transitionPhase("BOOT");
          overlay.classList.add("hidden");
        });

        menuBtn.addEventListener("click", () => {
          this.gameState.transitionPhase("MENU");
          overlay.classList.add("hidden");
        });
        break;

      case "pause":
        overlay.innerHTML = `
          <style>
            .menu-overlay { background: rgba(0,0,0,0.8); }
          </style>
          <h1>Paused</h1>
          <button class="button" id="resume-btn">Resume</button>
          <button class="button" id="restart-btn">Restart</button>
          <button class="button" id="menu-btn2">Main Menu</button>
        `;
        const resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;
        const restartBtn = document.getElementById("restart-btn") as HTMLButtonElement;
        const menuBtn2 = document.getElementById("menu-btn2") as HTMLButtonElement;

        resumeBtn.addEventListener("click", () => {
          this.gameState.transitionPhase("RUNNING");
          overlay.classList.add("hidden");
        });

        restartBtn.addEventListener("click", () => {
          this.gameState.transitionPhase("BOOT");
          overlay.classList.add("hidden");
        });

        menuBtn2.addEventListener("click", () => {
          this.gameState.transitionPhase("MENU");
          overlay.classList.add("hidden");
        });
        break;

      case "results":
        overlay.innerHTML = `
          <style>
            .menu-overlay { background: rgba(0,0,0,0.8); }
          </style>
          <h1>Run Results</h1>
          <p>Distance: <span id="res-distance">0m</span></p>
          <p>Score: <span id="res-score">0</span></p>
          <p>Relics: <span id="res-relics">0</span></p>
          <p>Best Distance: <span id="best-distance">0m</span></p>
          <button class="button" id="retry-btn2">Retry</button>
          <button class="button" id="menu-btn3">Main Menu</button>
        `;
        const retryBtn2 = document.getElementById("retry-btn2") as HTMLButtonElement;
        const menuBtn3 = document.getElementById("menu-btn3") as HTMLButtonElement;

        // Save best score
        const bestDistanceEl = document.getElementById("best-distance") as HTMLSpanElement;
        if (this.gameState.run.distance > (window.localStorage.getItem("bestDistance") || 0)) {
          window.localStorage.setItem("bestDistance", this.gameState.run.distance.toString());
          if (bestDistanceEl) bestDistanceEl.textContent = this.gameState.run.distance + "m";
        }

        retryBtn2.addEventListener("click", () => {
          this.gameState.transitionPhase("COUNTDOWN");
          overlay.classList.add("hidden");
        });

        menuBtn3.addEventListener("click", () => {
          this.gameState.transitionPhase("MENU");
          overlay.classList.add("hidden");
        });
        break;
    }
  }
}
