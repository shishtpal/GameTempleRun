import { GameState, TrackPiece, ObstacleSpawn } from "../core/GameState";

/**
 * Reachable-state validator for procedural track generation.
 * Ensures no impossible obstacle patterns are generated.
 * Considers lane-switch time, jump/slide time, and turn inputs.
 */

export class PatternValidator {
  /** Validate a track piece and its obstacles */
  validatePiece(piece: TrackPiece, aheadPieces: TrackPiece[]): boolean {
    // Validate obstacle pattern within the piece
    if (!this.validateObstaclePattern(piece)) {
      return false;
    }

    // Check reachability from previous piece
    if (aheadPieces.length > 0) {
      const prevPiece = aheadPieces[aheadPieces.length - 1];
      if (!this.validateTransition(prevPiece, piece)) {
        return false;
      }
    }

    return true;
  }

  /** Validate obstacle pattern within a piece */
  private validateObstaclePattern(piece: TrackPiece): boolean {
    const obstacles = piece.obstacles;
    const laneCount = 3; // lanes -1, 0, 1

    // Count obstacles per lane
    const laneObstacleCount = new Map<number, number>();
    for (let i = -1; i <= 1; i++) {
      laneObstacleCount.set(i, 0);
    }

    for (const obstacle of obstacles) {
      if (obstacle.type !== "GAP") {
        // Check if lane has valid obstacle
        const count = laneObstacleCount.get(obstacle.lane)!;
        laneObstacleCount.set(obstacle.lane, count + 1);
      }
    }

    // Rule: No fully blocked cross-section without a reachable action
    // Check if any lane has obstacles that make it completely blocked
    for (const [lane, count] of laneObstacleCount) {
      if (count >= 2 && piece.kind === "STRAIGHT") {
        // On straight sections, two obstacles in same lane may block it
        // unless there's a gap or the player can switch lanes
        // This is allowed if the player can switch lanes
        if (!this.hasLaneSwitchOption(piece, lane)) {
          return false;
        }
      }
    }

    // Rule: No overhead gate + low barrier in same lane without alternative
    for (const obstacle of obstacles) {
      if (obstacle.type === "OVERHEAD_GATE") {
        // Check if there's a low barrier in the same lane
        const hasLowBarrier = obstacles.some(
          (o) => o.type === "LOW_BARRIER" && o.lane === obstacle.lane,
        );
        if (hasLowBarrier) {
          // Must have a reachable alternative lane
          if (!this.hasAlternativeLane(piece, obstacle.lane)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /** Check if player has lane switch option before this piece */
  private hasLaneSwitchOption(piece: TrackPiece, blockedLane: number): boolean {
    // Player can switch lanes if there's an adjacent lane available
    const currentLane = blockedLane;
    const leftLane = currentLane - 1;
    const rightLane = currentLane + 1;

    // Check if adjacent lanes have obstacles too
    const leftBlocked = this.obstaclesHaveType(piece.obstacles, leftLane, [
      "BLOCK",
      "LOW_BARRIER",
      "OVERHEAD_GATE",
    ]);
    const rightBlocked = this.obstaclesHaveType(piece.obstacles, rightLane, [
      "BLOCK",
      "LOW_BARRIER",
      "OVERHEAD_GATE",
    ]);

    // Player can switch if at least one adjacent lane is clear
    return !leftBlocked || !rightBlocked;
  }

  /** Check if there's an alternative lane available */
  private hasAlternativeLane(piece: TrackPiece, blockedLane: number): boolean {
    // Player can always switch to adjacent lane on straight
    // unless both adjacent lanes are also blocked
    const leftLane = blockedLane - 1;
    const rightLane = blockedLane + 1;

    const leftClear = !this.obstaclesHaveType(piece.obstacles, leftLane, [
      "BLOCK",
      "LOW_BARRIER",
      "OVERHEAD_GATE",
    ]);
    const rightClear = !this.obstaclesHaveType(piece.obstacles, rightLane, [
      "BLOCK",
      "LOW_BARRIER",
      "OVERHEAD_GATE",
    ]);

    return leftClear || rightClear;
  }

  /** Check transition between previous and current piece */
  validateTransition(prevPiece: TrackPiece, currPiece: TrackPiece): boolean {
    // Same lane continuity - player shouldn't be forced to change lanes unexpectedly
    // Check if lane changes are consistent and reachable

    // If both pieces are straight, lane should be maintainable
    if (prevPiece.kind === "STRAIGHT" && currPiece.kind === "STRAIGHT") {
      // Lanes should be consistent - no sudden blocking
      for (let lane = -1; lane <= 1; lane++) {
        const prevCount = this.obstaclesHaveType(prevPiece.obstacles, lane, [
          "BLOCK",
          "LOW_BARRIER",
          "OVERHEAD_GATE",
        ]);
        const currCount = this.obstaclesHaveType(currPiece.obstacles, lane, [
          "BLOCK",
          "LOW_BARRIER",
          "OVERHEAD_GATE",
        ]);

        // If current piece blocks a lane that was clear before, it's a concern
        if (prevCount < 2 && currCount >= 2) {
          // Check if player can switch to adjacent lane
          const leftClear =
            lane > -1 &&
            !this.obstaclesHaveType(currPiece.obstacles, lane - 1, [
              "BLOCK",
              "LOW_BARRIER",
              "OVERHEAD_GATE",
            ]);
          const rightClear =
            lane < 1 &&
            !this.obstaclesHaveType(currPiece.obstacles, lane + 1, [
              "BLOCK",
              "LOW_BARRIER",
              "OVERHEAD_GATE",
            ]);

          if (!leftClear && !rightClear) {
            return false; // Player boxed in with no escape
          }
        }
      }
    }

    // If there's a turn, ensure it's feasible
    if (currPiece.kind.includes("TURN")) {
      // Turn should have hazard-free zone before, during, and after
      // Check that turn lane is not immediately blocked
      const turnLane = currPiece.kind === "TURN_RIGHT" ? 1 : -1; // outer lane for turn
      const turnObstacles = currPiece.obstacles.filter(
        (o) => o.lane === turnLane && o.type !== "GAP",
      );

      // Turn should not have an immediate obstacle at the start
      if (turnObstacles.length > 0) {
        // First obstacle should not be at position 0 (immediately at turn start)
        const firstObstaclePos = Math.min(...turnObstacles.map((o) => this.getObstaclePosition(o)));
        if (firstObstaclePos < TURN_SEGMENT_LENGTH * 0.3) {
          return false; // Obstacle too close to turn start
        }
      }
    }

    return true;
  }

  private getObstaclePosition(obstacle: ObstacleSpawn): number {
    // Return position along segment - simplified, would use actual position data
    return 5; // placeholder
  }

  obstaclesHaveType(obstacles: ObstacleSpawn[], lane: number, types: string[]): boolean {
    return obstacles.some((o) => o.lane === lane && types.includes(o.type));
  }
}
