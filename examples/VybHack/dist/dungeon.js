"use strict";
/**
 * Dungeon and movement system for roguelike game
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveNorth = moveNorth;
exports.moveSouth = moveSouth;
exports.moveEast = moveEast;
exports.moveWest = moveWest;
exports.isWalkable = isWalkable;
exports.calculateDistance = calculateDistance;
exports.isInBounds = isInBounds;
exports.calculateRoomArea = calculateRoomArea;
/**
 * Move north (decrease Y)
 * @param currentY - Current Y coordinate
 * @returns New Y coordinate
 */
function moveNorth(currentY) {
    return currentY - 1;
}
/**
 * Move south (increase Y)
 * @param currentY - Current Y coordinate
 * @returns New Y coordinate
 */
function moveSouth(currentY) {
    return currentY + 1;
}
/**
 * Move east (increase X)
 * @param currentX - Current X coordinate
 * @returns New X coordinate
 */
function moveEast(currentX) {
    return currentX + 1;
}
/**
 * Move west (decrease X)
 * @param currentX - Current X coordinate
 * @returns New X coordinate
 */
function moveWest(currentX) {
    return currentX - 1;
}
/**
 * Check if tile is walkable
 * @param tileType - Tile type (0 = floor, 1 = wall)
 * @returns True if walkable
 */
function isWalkable(tileType) {
    return tileType === 0; // 0 = floor (walkable), 1 = wall (not walkable)
}
/**
 * Calculate distance between two points
 * @param x1 - First point X
 * @param y1 - First point Y
 * @param x2 - Second point X
 * @param y2 - Second point Y
 * @returns Euclidean distance
 */
function calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
/**
 * Check if position is within dungeon bounds
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Dungeon width
 * @param height - Dungeon height
 * @returns True if position is within bounds
 */
function isInBounds(x, y, width, height) {
    return x >= 0 && x < width && y >= 0 && y < height;
}
/**
 * Calculate room area
 * @param width - Room width
 * @param height - Room height
 * @returns Area of room
 */
function calculateRoomArea(width, height) {
    return width * height;
}
// CommonJS exports for Vyb
module.exports = {
    moveNorth,
    moveSouth,
    moveEast,
    moveWest,
    isWalkable,
    calculateDistance,
    isInBounds,
    calculateRoomArea,
};
