"use strict";
/**
 * Enemy AI system
 * Simple pathfinding toward player
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIMoveX = getAIMoveX;
exports.getAIMoveY = getAIMoveY;
exports.getAIPrimaryDirection = getAIPrimaryDirection;
exports.isAdjacentTo = isAdjacentTo;
exports.getDistanceToPlayer = getDistanceToPlayer;
/**
 * Get AI's next X move toward player
 */
function getAIMoveX(enemy, player) {
    if (enemy.x < player.x) {
        return enemy.x + 1; // Move right
    }
    else if (enemy.x > player.x) {
        return enemy.x - 1; // Move left
    }
    return enemy.x; // Stay
}
/**
 * Get AI's next Y move toward player
 */
function getAIMoveY(enemy, player) {
    if (enemy.y < player.y) {
        return enemy.y + 1; // Move down
    }
    else if (enemy.y > player.y) {
        return enemy.y - 1; // Move up
    }
    return enemy.y; // Stay
}
/**
 * Get primary movement direction (0 = horizontal, 1 = vertical)
 * Prioritize axis with greater distance
 */
function getAIPrimaryDirection(enemy, player) {
    const dx = Math.abs(enemy.x - player.x);
    const dy = Math.abs(enemy.y - player.y);
    return dx >= dy ? 0 : 1; // 0 = horizontal priority, 1 = vertical
}
/**
 * Check if enemy is adjacent to player (attack range)
 */
function isAdjacentTo(enemy, player) {
    const dx = Math.abs(enemy.x - player.x);
    const dy = Math.abs(enemy.y - player.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}
/**
 * Get Manhattan distance to player
 */
function getDistanceToPlayer(enemy, player) {
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
