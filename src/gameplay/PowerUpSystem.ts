import { GameState, PowerUpType } from "../core/GameState";

export type PowerUpState = {
  active: boolean;
  type: PowerUpType | null;
  timer: number; // seconds remaining
};

export class PowerUpSystem {
  private state: GameState;
  private powerUps: Map<PowerUpType, PowerUpState> = new Map();

  constructor(state: GameState) {
    // Initialize power-up timers
    this.powerUps.set("SHIELD", { active: false, type: "SHIELD", timer: 0 });
    this.powerUps.set("MAGNET", { active: false, type: "MAGNET", timer: 0 });
    this.powerUps.set("MULTIPLIER", { active: false, type: "MULTIPLIER", timer: 0 });

    // Start timer decrements for active power-ups
    this.startTimers();
  }

  private startTimers() {
    // Decrement timers every second
    setInterval(() => {
      for (const [type, state] of this.powerUps) {
        if (state.active && state.timer > 0) {
          state.timer -= 1;
          // Update game state timer
          // In a real game, we'd track this differently
        }
      }
    }, 1000);
  }

  // Called when player collects a power-up
  collectPowerUp(type: PowerUpType) {
    const powerUpState = this.powerUps.get(type);
    if (powerUpState && !powerUpState.active) {
      powerUpState.active = true;
      powerUpState.timer = this.getDefaultDuration(type);

      // Apply power-up effects
      this.applyPowerUpEffects(type, powerUpState.timer);

      // Start countdown
      this.startPowerUpCountdown(type, powerUpState.timer);
    }
  }

  private getDefaultDuration(type: PowerUpType): number {
    switch (type) {
      case "SHIELD":
        return 10; // seconds - lasts at most 10s if unused
      case "MAGNET":
        return 8; // seconds
      case "MULTIPLIER":
        return 8; // seconds
      default:
        return 0;
    }
  }

  private applyPowerUpEffects(type: PowerUpType, duration: number) {
    switch (type) {
      case "SHIELD":
        // Shield activates immediately - absorbs one collision
        this.state.player.protectedByShield = true;
        // Shield auto-deactivates after 10 seconds
        setTimeout(() => {
          this.state.player.protectedByShield = false;
        }, 10000);
        break;

      case "MAGNET":
        // Collect nearby relics within ~4 units for duration
        // This would be handled in the pickup system
        break;

      case "MULTIPLIER":
        // Double relic and distance points for duration
        this.state.setMultiplier(2);
        break;
    }
  }

  private startPowerUpCountdown(type: PowerUpType, initialDuration: number) {
    // Use setInterval to decrement timer
    const durationRef = { remaining: initialDuration };

    const interval = setInterval(() => {
      duration.remaining -= 1;

      if (duration.remaining <= 0) {
        clearInterval(interval);
        // Power-up expires
        this.onPowerUpExpired(type);
      }
    }, 1000);
  }

  private onPowerUpExpired(type: PowerUpType) {
    switch (type) {
      case "SHIELD":
        // Shield already deactivated in applyPowerUpEffects
        break;

      case "MAGNET":
        // Magnet effect ends - stop attracting relics
        break;

      case "MULTIPLIER":
        // Multiplier expires - restore to 1x
        this.state.setMultiplier(1);
        break;
    }
  }

  update(dt: number) {
    // Update power-up timers with delta time
    // This is a simplified update; real implementation would use precise timing
  }
}
