import { GameState, ObstacleSpawn, PlayerState } from "../core/GameState";

export class CollisionSystem {
  private state: GameState;
  private shieldActiveSince: number = 0;

  constructor(state: GameState) {
    this.state = state;
  }

  update(dt: number) {
    // Check collisions between player and active obstacles
    this.checkCollisions();
  }

  private checkCollisions() {
    const player = this.state.player;
    const obstacles = this.state.activeObstacles;

    for (const obstacle of obstacles) {
      if (this.checkObstacleCollision(obstacle)) {
        // Shield absorbs one collision
        if (player.protectedByShield) {
          // Shield absorbs the collision - mark obstacle as resolved
          // Could add temporary invulnerability here
          continue;
        }
        // Game over - player collides with unprotected obstacle
        this.state.transitionPhase("DYING");
        this.state.transitionPhase("GAME_OVER");
        return;
      }
    }
  }

  private checkObstacleCollision(obstacle: ObstacleSpawn): boolean {
    const playerLane = player.lane;

    // Check if obstacle is in the player's lane
    if (obstacle.lane !== playerLane && obstacle.lane !== 0) {
      // Obstacle in adjacent lane - check if player is near the edge
      // Simple check: if player has lateral offset, they might be in this lane
      return false;
    }

    // AABB collision check based on posture
    const playerHeight = this.getPlayerHeight();
    const playerWidth = 1; // approximate player width

    // Obstacle bounds
    const obsLeft = obstacle.position.x - obstacle.dimensions.width / 2;
    const obsRight = obstacle.position.x + obstacle.dimensions.width / 2;
    const obsTop = obstacle.position.y - obstacle.dimensions.height / 2;
    const obsBottom = obstacle.position.y + obstacle.dimensions.height / 2;

    // Player bounds (simplified capsule)
    const playerLeft = player.lateralOffset - playerWidth / 2;
    const playerRight = player.lateralOffset + playerWidth / 2;
    const playerTop = player.y + playerHeight / 2;
    const playerBottom = player.y - playerHeight / 2;

    // Check overlap
    const collisionX = playerLeft < obsRight && playerRight > obsLeft;
    const collisionY = playerTop > obsBottom && playerBottom < obsTop;

    return collisionX && collisionY;
  }

  private getPlayerHeight(): number {
    // Different heights based on posture
    // This would be used by the renderer, but we keep it here for collision logic
    switch (this.state.player.posture) {
      case "SLIDING":
        return 0.5; // crouched height
      case "JUMPING":
        return 1.5; // full height during jump
      default:
        return 1.8; // running height
    }
  }

  // Activate shield power-up
  activateShield() {
    this.state.player.protectedByShield = true;
    this.shieldActiveSince = Date.now();
    // Shield deactivates after 10 seconds if unused
    setTimeout(() => {
      this.state.player.protectedByShield = false;
    }, 10000);
  }
}
