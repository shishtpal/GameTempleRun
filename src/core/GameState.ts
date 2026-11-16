/**
 * Core game state management with typed state machine.
 * Separation between deterministic simulation and Three.js rendering.
 */

export type Lane = -1 | 0 | 1;

export type Posture = "RUNNING" | "JUMPING" | "SLIDING" | "DYING";

export type Phase =
  | "BOOT"
  | "LOADING"
  | "MENU"
  | "COUNTDOWN"
  | "RUNNING"
  | "PAUSED"
  | "DYING"
  | "GAME_OVER";

export type Action = "LEFT" | "RIGHT" | "JUMP" | "SLIDE" | "PAUSE";

export interface PlayerState {
  lane: Lane;
  lateralOffset: number;
  forwardDistance: number;
  y: number;
  verticalVelocity: number;
  posture: Posture;
  slideRemaining: number;
  protectedByShield: boolean;
}

export interface RunState {
  phase: Phase;
  seed: number;
  elapsedSeconds: number;
  distance: number;
  speed: number;
  score: number;
  relics: number;
  multiplier: number;
}

export interface TrackPiece {
  id: string;
  startDistance: number;
  length: number;
  heading: number; // quarter-turns around world up axis
  kind: "STRAIGHT" | "TURN_LEFT" | "TURN_RIGHT";
  obstacles: ObstacleSpawn[];
  pickups: PickupSpawn[];
}

export interface ObstacleSpawn {
  type: "BLOCK" | "LOW_BARRIER" | "OVERHEAD_GATE" | "GAP";
  lane: Lane;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
}

export interface PickupSpawn {
  type: "RELIC" | "POWERUP";
  position: { x: number; y: number; z: number };
  id: string;
}

export class GameState {
  public phase: Phase = "BOOT";
  public run: RunState = {
    seed: Date.now(),
    elapsedSeconds: 0,
    distance: 0,
    speed: 10, // units/sec - starts at 10, increases to 22
    score: 0,
    relics: 0,
    multiplier: 1,
  };
  public player: PlayerState = {
    lane: 0,
    lateralOffset: 0,
    forwardDistance: 0,
    y: 0,
    verticalVelocity: 0,
    posture: "RUNNING",
    slideRemaining: 0,
    protectedByShield: false,
  };
  public track: TrackPiece[] = [];
  public activeObstacles: ObstacleSpawn[] = [];
  public activePickups: PickupSpawn[] = [];

  constructor() {
    // Initialize with default values
    this.transitionPhase("LOADING");
  }

  transitionPhase(newPhase: Phase) {
    const validTransitions: Record<Phase, Phase[]> = {
      BOOT: ["LOADING"],
      LOADING: ["MENU", "COUNTDOWN"],
      MENU: ["COUNTDOWN", "BOOT"],
      COUNTDOWN: ["RUNNING"],
      RUNNING: ["PAUSED", "DYING", "GAME_OVER"],
      PAUSED: ["RUNNING", "MENU", "COUNTDOWN"],
      DYING: ["GAME_OVER"],
      GAME_OVER: ["MENU", "RESTART"],
    };

    if (validTransitions[this.phase] && validTransitions[this.phase].includes(newPhase)) {
      const oldPhase = this.phase;
      this.phase = newPhase;
      console.log(`Phase transition: ${oldPhase} → ${newPhase}`);
    } else {
      console.warn(`Invalid phase transition: ${this.phase} → ${newPhase}`);
    }
  }

  // Getters and setters for player state with validation
  getLane(): Lane {
    return this.player.lane;
  }

  setLane(lane: Lane) {
    // Clamp lane to valid range
    this.player.lane = Math.max(-1, Math.min(1, lane));
  }

  // Integer-safe distance accumulation
  addDistance(amount: number) {
    this.run.distance = Math.floor(this.run.distance + amount);
    this.player.forwardDistance = this.run.distance;
  }

  addScore(amount: number) {
    this.run.score = Math.floor(this.run.score + amount * this.run.multiplier);
  }

  addRelics(amount: number) {
    this.run.relics = Math.floor(this.run.relics + amount * this.run.multiplier);
  }

  setMultiplier(multiplier: number) {
    this.run.multiplier = Math.max(1, Math.min(2, multiplier)); // Prevent unbounded stacking
  }

  shieldActivate() {
    this.player.protectedByShield = true;
    // Shield deactivates after 10 seconds if not used
    setTimeout(() => {
      this.player.protectedByShield = false;
    }, 10000);
  }
}
