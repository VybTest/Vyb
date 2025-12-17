"use strict";
/**
 * Dungeon generation system
 * Creates random interconnected rooms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.getRoomX = getRoomX;
exports.getRoomY = getRoomY;
exports.getRoomWidth = getRoomWidth;
exports.getRoomHeight = getRoomHeight;
exports.getRoomCenterX = getRoomCenterX;
exports.getRoomCenterY = getRoomCenterY;
exports.isPointInRoom = isPointInRoom;
exports.doRoomsOverlap = doRoomsOverlap;
exports.createHorizontalCorridor = createHorizontalCorridor;
exports.createVerticalCorridor = createVerticalCorridor;
exports.getCorridorY = getCorridorY;
exports.getCorridorX = getCorridorX;
exports.getCorridorStartX = getCorridorStartX;
exports.getCorridorEndX = getCorridorEndX;
exports.getCorridorStartY = getCorridorStartY;
exports.getCorridorEndY = getCorridorEndY;
exports.randomInt = randomInt;
/**
 * Create a room
 */
function createRoom(x, y, width, height) {
    return { x, y, width, height };
}
/**
 * Get room X position
 */
function getRoomX(room) {
    return room.x;
}
/**
 * Get room Y position
 */
function getRoomY(room) {
    return room.y;
}
/**
 * Get room width
 */
function getRoomWidth(room) {
    return room.width;
}
/**
 * Get room height
 */
function getRoomHeight(room) {
    return room.height;
}
/**
 * Get room center X
 */
function getRoomCenterX(room) {
    return room.x + Math.floor(room.width / 2);
}
/**
 * Get room center Y
 */
function getRoomCenterY(room) {
    return room.y + Math.floor(room.height / 2);
}
/**
 * Check if point is inside room
 */
function isPointInRoom(room, x, y) {
    return (x >= room.x &&
        x < room.x + room.width &&
        y >= room.y &&
        y < room.y + room.height);
}
/**
 * Check if two rooms overlap
 */
function doRoomsOverlap(room1, room2) {
    return (room1.x < room2.x + room2.width &&
        room1.x + room1.width > room2.x &&
        room1.y < room2.y + room2.height &&
        room1.y + room1.height > room2.y);
}
/**
 * Create horizontal corridor
 */
function createHorizontalCorridor(x1, x2, y) {
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
function createVerticalCorridor(y1, y2, x) {
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
function getCorridorY(corridor) {
    return corridor.y;
}
/**
 * Get corridor X (for vertical corridors)
 */
function getCorridorX(corridor) {
    return corridor.x;
}
/**
 * Get corridor start X (for horizontal corridors)
 */
function getCorridorStartX(corridor) {
    return corridor.startX;
}
/**
 * Get corridor end X (for horizontal corridors)
 */
function getCorridorEndX(corridor) {
    return corridor.endX;
}
/**
 * Get corridor start Y (for vertical corridors)
 */
function getCorridorStartY(corridor) {
    return corridor.startY;
}
/**
 * Get corridor end Y (for vertical corridors)
 */
function getCorridorEndY(corridor) {
    return corridor.endY;
}
/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
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
