/**
 * Dungeon and movement system for roguelike game
 */

/**
 * Move north (decrease Y)
 * @param currentY - Current Y coordinate
 * @returns New Y coordinate
 */
export function moveNorth(currentY: number): number {
  return currentY - 1;
}

/**
 * Move south (increase Y)
 * @param currentY - Current Y coordinate
 * @returns New Y coordinate
 */
export function moveSouth(currentY: number): number {
  return currentY + 1;
}

/**
 * Move east (increase X)
 * @param currentX - Current X coordinate
 * @returns New X coordinate
 */
export function moveEast(currentX: number): number {
  return currentX + 1;
}

/**
 * Move west (decrease X)
 * @param currentX - Current X coordinate
 * @returns New X coordinate
 */
export function moveWest(currentX: number): number {
  return currentX - 1;
}

/**
 * Check if tile is walkable
 * @param tileType - Tile type (0 = floor, 1 = wall)
 * @returns True if walkable
 */
export function isWalkable(tileType: number): boolean {
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
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
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
export function isInBounds(
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Calculate room area
 * @param width - Room width
 * @param height - Room height
 * @returns Area of room
 */
export function calculateRoomArea(width: number, height: number): number {
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
