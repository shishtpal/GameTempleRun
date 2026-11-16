import { GameState } from "./GameState";

/**
 * LocalStorage persistence for game state.
 * Saves/loads versioned schema with defensive parsing.
 */

const STORAGE_KEY = "sky-relic-runner-v1";
const VERSION = 1;

export class Persistence {
  /** Load game state from localStorage */
  static load(gameState: GameState): GameState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return gameState; // Return defaults if no saved data

      const parsed = JSON.parse(raw);

      // Validate version
      if (parsed.version !== VERSION) {
        console.warn(`Storage version mismatch: expected ${VERSION}, got ${parsed.version}`);
        // Migrate or reset
        return gameState;
      }

      // Load with defaults merge
      if (parsed.run) {
        gameState.run = {
          seed: parsed.run.seed || gameState.run.seed,
          elapsedSeconds: parsed.run.elapsedSeconds || 0,
          distance: parsed.run.distance || 0,
          speed: parsed.run.speed || 10,
          score: parsed.run.score || 0,
          relics: parsed.run.relics || 0,
          multiplier: parsed.run.multiplier || 1,
        };
      }

      if (parsed.player) {
        gameState.player = {
          lane: parsed.player.lane !== undefined ? parsed.player.lane : 0,
          lateralOffset:
            parsed.player.lateralOffset !== undefined ? parsed.player.lateralOffset : 0,
          forwardDistance: parsed.player.forwardDistance || 0,
          y: parsed.player.y !== undefined ? parsed.player.y : 0,
          verticalVelocity:
            parsed.player.verticalVelocity !== undefined ? parsed.player.verticalVelocity : 0,
          posture: parsed.player.posture || "RUNNING",
          slideRemaining:
            parsed.player.slideRemaining !== undefined ? parsed.player.slideRemaining : 0,
          protectedByShield: parsed.player.protectedByShield || false,
        };
      }

      if (parsed.track) {
        gameState.track = parsed.track;
      }

      if (parsed.seed !== undefined) {
        gameState.run.seed = parsed.seed;
      }
    } catch (e) {
      console.error("Failed to load game state from localStorage", e);
      // Return defaults on error - don't crash
    }

    return gameState;
  }

  /** Save game state to localStorage */
  static save(gameState: GameState) {
    try {
      const data = {
        version: VERSION,
        run: {
          seed: gameState.run.seed,
          elapsedSeconds: gameState.elapsedSeconds,
          distance: gameState.run.distance,
          speed: gameState.run.speed,
          score: gameState.run.score,
          relics: gameState.run.relics,
          multiplier: gameState.run.multiplier,
        },
        player: {
          lane: gameState.player.lane,
          lateralOffset: gameState.player.lateralOffset,
          forwardDistance: gameState.player.forwardDistance,
          y: gameState.player.y,
          verticalVelocity: gameState.player.verticalVelocity,
          posture: gameState.player.posture,
          slideRemaining: gameState.player.slideRemaining,
          protectedByShield: gameState.player.protectedByShield,
        },
        track: gameState.track,
        seed: gameState.run.seed,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save game state to localStorage", e);
    }
  }
}
