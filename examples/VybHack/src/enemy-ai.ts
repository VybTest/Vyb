/**
 * Enemy AI system
 * Simple pathfinding toward player
 */

import { Entity } from "./entity";

/**
 * Get AI's next X move toward player
 */
export function getAIMoveX(enemy: Entity, player: Entity): number {
  if (enemy.x < player.x) {
    return enemy.x + 1; // Move right
  } else if (enemy.x > player.x) {
    return enemy.x - 1; // Move left
  }
  return enemy.x; // Stay
}

/**
 * Get AI's next Y move toward player
 */
export function getAIMoveY(enemy: Entity, player: Entity): number {
  if (enemy.y < player.y) {
    return enemy.y + 1; // Move down
  } else if (enemy.y > player.y) {
    return enemy.y - 1; // Move up
  }
  return enemy.y; // Stay
}

/**
 * Get primary movement direction (0 = horizontal, 1 = vertical)
 * Prioritize axis with greater distance
 */
export function getAIPrimaryDirection(enemy: Entity, player: Entity): number {
  const dx = Math.abs(enemy.x - player.x);
  const dy = Math.abs(enemy.y - player.y);
  return dx >= dy ? 0 : 1; // 0 = horizontal priority, 1 = vertical
}

/**
 * Check if enemy is adjacent to player (attack range)
 */
export function isAdjacentTo(enemy: Entity, player: Entity): boolean {
  const dx = Math.abs(enemy.x - player.x);
  const dy = Math.abs(enemy.y - player.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/**
 * Get Manhattan distance to player
 */
export function getDistanceToPlayer(enemy: Entity, player: Entity): number {
  return Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
}

// CommonJS exports
module.exports = {
  getAIMoveX,
  getAIMoveY,
  getAIPrimaryDirection,
  isAdjacentTo,
  getDistanceToPlayer,
};
