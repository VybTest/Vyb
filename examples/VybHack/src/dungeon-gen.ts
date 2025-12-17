/**
 * Dungeon generation system
 * Creates random interconnected rooms
 */

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Corridor {
  type: "horizontal" | "vertical";
  x: number;
  y: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
}

/**
 * Create a room
 */
export function createRoom(
  x: number,
  y: number,
  width: number,
  height: number
): Room {
  return { x, y, width, height };
}

/**
 * Get room X position
 */
export function getRoomX(room: Room): number {
  return room.x;
}

/**
 * Get room Y position
 */
export function getRoomY(room: Room): number {
  return room.y;
}

/**
 * Get room width
 */
export function getRoomWidth(room: Room): number {
  return room.width;
}

/**
 * Get room height
 */
export function getRoomHeight(room: Room): number {
  return room.height;
}

/**
 * Get room center X
 */
export function getRoomCenterX(room: Room): number {
  return room.x + Math.floor(room.width / 2);
}

/**
 * Get room center Y
 */
export function getRoomCenterY(room: Room): number {
  return room.y + Math.floor(room.height / 2);
}

/**
 * Check if point is inside room
 */
export function isPointInRoom(room: Room, x: number, y: number): boolean {
  return (
    x >= room.x &&
    x < room.x + room.width &&
    y >= room.y &&
    y < room.y + room.height
  );
}

/**
 * Check if two rooms overlap
 */
export function doRoomsOverlap(room1: Room, room2: Room): boolean {
  return (
    room1.x < room2.x + room2.width &&
    room1.x + room1.width > room2.x &&
    room1.y < room2.y + room2.height &&
    room1.y + room1.height > room2.y
  );
}

/**
 * Create horizontal corridor
 */
export function createHorizontalCorridor(
  x1: number,
  x2: number,
  y: number
): Corridor {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  return {
    type: "horizontal",
    x: startX,
    y,
    startX,
    endX,
  };
}

/**
 * Create vertical corridor
 */
export function createVerticalCorridor(
  y1: number,
  y2: number,
  x: number
): Corridor {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  return {
    type: "vertical",
    x,
    y: startY,
    startY,
    endY,
  };
}

/**
 * Get corridor Y (for horizontal corridors)
 */
export function getCorridorY(corridor: Corridor): number {
  return corridor.y;
}

/**
 * Get corridor X (for vertical corridors)
 */
export function getCorridorX(corridor: Corridor): number {
  return corridor.x;
}

/**
 * Get corridor start X (for horizontal corridors)
 */
export function getCorridorStartX(corridor: Corridor): number {
  return corridor.startX!;
}

/**
 * Get corridor end X (for horizontal corridors)
 */
export function getCorridorEndX(corridor: Corridor): number {
  return corridor.endX!;
}

/**
 * Get corridor start Y (for vertical corridors)
 */
export function getCorridorStartY(corridor: Corridor): number {
  return corridor.startY!;
}

/**
 * Get corridor end Y (for vertical corridors)
 */
export function getCorridorEndY(corridor: Corridor): number {
  return corridor.endY!;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// CommonJS exports for Vyb
module.exports = {
  createRoom,
  getRoomX,
  getRoomY,
  getRoomWidth,
  getRoomHeight,
  getRoomCenterX,
  getRoomCenterY,
  isPointInRoom,
  doRoomsOverlap,
  createHorizontalCorridor,
  createVerticalCorridor,
  getCorridorY,
  getCorridorX,
  getCorridorStartX,
  getCorridorEndX,
  getCorridorStartY,
  getCorridorEndY,
  randomInt,
};
