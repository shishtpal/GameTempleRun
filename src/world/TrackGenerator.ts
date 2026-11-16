import { GameState, TrackPiece, ObstacleSpawn, PickupSpawn } from "../core/GameState";
import { Random } from "../core/Random";
import { PatternValidator } from "./PatternValidator";

const STRAIGHT_LENGTH_MIN = 18;
const STRAIGHT_LENGTH_MAX = 28;
const TURN_SEGMENT_LENGTH = 12;

export class TrackGenerator {
  private state: GameState;
  private rng: Random;
  private validator: PatternValidator;
  private generatedDistance: number = 0;
  private aheadDistance: number = 160; // generate 160 units ahead
  private retiredDistance: number = 50; // retire behind 50 units

  constructor(state: GameState) {
    this.state = state;
    this.rng = new Random(state.run.seed);
    this.validator = new PatternValidator();
    this.initializeTrack();
  }

  private initializeTrack() {
    // Generate initial straight segments to start the game
    this.generateStraightSegment(STRAIGHT_LENGTH_MAX);
    this.generateStraightSegment(this.randomLength());
    this.generateStraightSegment(this.randomLength());
    this.state.run.distance = 0; // reset distance
  }

  private randomLength(): number {
    const length = this.rng.intInRange(STRAIGHT_LENGTH_MIN, STRAIGHT_LENGTH_MAX);
    return length;
  }

  /** Generate a straight segment at the given distance */
  private generateStraightSegment(length: number) {
    const piece: TrackPiece = this.createPiece("STRAIGHT", length);

    // Validate the piece against previous pieces
    const prevPieces = this.state.track.slice(-2); // check last 2 pieces
    const isValid = this.validatePiece(piece, prevPieces);
    if (!isValid) {
      // Reroll - generate a different pattern by adjusting obstacle positions
      this.rerollStraight(length);
    }

    this.state.track.push(piece);
    this.generatedDistance += length;
    this.state.run.distance += length;
  }

  private createPiece(kind: "STRAIGHT" | "TURN_LEFT" | "TURN_RIGHT", length: number): TrackPiece {
    const obstacles = this.generateObstacles(kind, length);
    const pickups = this.generatePickups(length);

    return {
      id: `${kind}-${this.state.run.elapsedSeconds}-${this.generatedDistance}`,
      startDistance: this.generatedDistance,
      length,
      heading: kind === "TURN_RIGHT" ? 1 : kind === "TURN_LEFT" ? 3 : 0,
      kind,
      obstacles,
      pickups,
    };
  }

  private rerollStraight() {
    // Generate a new straight segment with different obstacle pattern
    const newLength = this.rng.intInRange(STRAIGHT_LENGTH_MIN, STRAIGHT_LENGTH_MAX);
    const newPiece = this.createPiece("STRAIGHT", newLength);
    // Replace the last piece in the track
    if (this.state.track.length > 0) {
      this.state.track[this.state.track.length - 1] = newPiece;
    }
  }

  /** Generate turn segment (90° left or right) */
  private generateTurnSegment(turnDirection: number) {
    const piece = this.createPiece(
      turnDirection === 1 ? "TURN_RIGHT" : "TURN_LEFT",
      TURN_SEGMENT_LENGTH,
    );

    // Validate turn piece against previous pieces
    const prevPieces = this.state.track.slice(-2);
    const isValid = this.validatePiece(piece, prevPieces);
    if (!isValid) {
      // Reroll turn - generate different pattern
      this.rerollTurn(turnDirection);
    }

    this.state.track.push(piece);
    this.generatedDistance += TURN_SEGMENT_LENGTH;
    this.state.run.distance += TURN_SEGMENT_LENGTH;
  }

  private rerollTurn(turnDirection: number) {
    // Generate a new turn with different obstacle configuration
    const newPiece = this.createPiece(
      turnDirection === 1 ? "TURN_RIGHT" : "TURN_LEFT",
      TURN_SEGMENT_LENGTH,
    );
    // Replace the last piece
    if (this.state.track.length > 0) {
      this.state.track[this.state.track.length - 1] = newPiece;
    }
  }

  /** Generate obstacles for a segment based on type and length */
  private generateObstacles(kind: "STRAIGHT" | "TURN", segmentLength: number): ObstacleSpawn[] {
    const obstacles: ObstacleSpawn[] = [];
    const _laneCount = 3;
    const laneWidth = 2.3; // world units

    // Determine how many obstacles can fit in this segment
    const obstacleCount = Math.max(1, Math.floor(segmentLength / 7));

    for (let i = 0; i < obstacleCount; i++) {
      // Random lane (biased toward center for straight, outside for turns)
      let lane: -1 | 0 | 1;
      if (kind === "STRAIGHT") {
        const laneChoice = this.rng.float(0, 1);
        lane = laneChoice < 0.4 ? -1 : laneChoice < 0.8 ? 1 : 0;
      } else {
        // On turns, prefer outer lanes
        const laneChoice = this.rng.float(0, 1);
        lane = laneChoice < 0.7 ? turnDirection : 0;
      }

      // Position along segment
      const positionAlong = this.rng.float(0, segmentLength);
      const _worldPosition = this.generatedDistance - segmentLength / 2 + positionAlong;

      // Obstacle dimensions based on type
      let width: number;
      let height: number;
      let obsType: "BLOCK" | "LOW_BARRIER" | "OVERHEAD_GATE" | "GAP";

      const obsRand = this.rng.float(0, 1);
      if (obsRand < 0.5) {
        obsType = "BLOCK";
        width = 1;
        height = 2;
      } else if (obsRand < 0.8) {
        obsType = "LOW_BARRIER";
        width = 1.5;
        height = 1;
      } else if (obsRand < 0.9) {
        obsType = "OVERHEAD_GATE";
        width = 2;
        height = 3;
      } else {
        obsType = "GAP";
        width = laneWidth;
        height = 0;
        continue; // Skip adding GAP as obstacle
      }

      // Y position depends on obstacle type
      let yPos: number;
      switch (obsType) {
        case "BLOCK":
          yPos = height / 2; // sit on ground
          break;
        case "LOW_BARRIER":
          yPos = height / 2;
          break;
        case "OVERHEAD_GATE":
          yPos = height / 2;
          break;
        case "GAP":
          yPos = 0;
          break;
        default:
          yPos = 0;
      }

      obstacles.push({
        type: obsType,
        lane,
        position: { x: (lane * laneWidth) / 2, y: yPos },
        dimensions: { width, height },
      });
    }

    return obstacles;
  }

  /** Generate pickups for a segment */
  private generatePickups(segmentLength: number): PickupSpawn[] {
    const pickups: PickupSpawn[] = [];
    const rand = this.rng;

    // Spawn relics sparingly - about 1 per 15 units
    const relicCount = Math.max(0, Math.floor(segmentLength / 15));

    for (let i = 0; i < relicCount; i++) {
      // Random position along segment
      const positionAlong = rand.float(0, segmentLength);
      const xOffset = rand.float(-1, 1) * 0.5; // slightly above path
      const zOffset = rand.float(-0.5, 0.5);

      pickups.push({
        type: "RELIC",
        position: { x: xOffset, y: 0.5 + rand.float(0, 0.5), z: zOffset },
        id: `relic-${this.state.run.elapsedSeconds}-${this.generatedDistance}-${i}`,
      });
    }

    return pickups;
  }

  /** Update generator each frame - generates new segments ahead */
  update(dt: number) {
    const neededDistance = this.aheadDistance - this.generatedDistance;

    if (neededDistance > 0 && this.state.elapsedSeconds > 0) {
      // Calculate how many segments to generate
      const segmentLength = this.rng.intInRange(STRAIGHT_LENGTH_MIN, STRAIGHT_LENGTH_MAX);
      this.generateStraightSegment(segmentLength);
    }

    // Check if we need to retire old segments behind the camera
    if (this.generatedDistance - this.retiredDistance > this.state.run.distance) {
      // Remove segments that are too far behind
      // In a full implementation, would recycle pool objects
      // For now, just track the distance
    }
  }

  /** Get the current track pieces for rendering */
  getTrackPieces(): TrackPiece[] {
    return this.state.track.slice(); // return copy
  }

  /** Validate a new piece against the pattern validator */
  private validatePiece(newPiece: TrackPiece, previousPieces: TrackPiece[]): boolean {
    // Validate transition from previous piece
    if (previousPieces.length > 0) {
      const prevPiece = previousPieces[previousPieces.length - 1];
      if (!this.validator.validateTransition(prevPiece, newPiece)) {
        return false;
      }
    }

    // Validate obstacle pattern within the piece
    if (!this.validator.validateObstaclePattern(newPiece)) {
      return false;
    }

    return true;
  }
}
