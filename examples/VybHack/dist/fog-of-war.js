"use strict";
/**
 * Fog of war system
 * Tracks which tiles have been explored
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFogMap = createFogMap;
exports.isTileExplored = isTileExplored;
exports.revealTile = revealTile;
exports.revealRoom = revealRoom;
exports.revealCorridor = revealCorridor;
exports.revealRoomWithExits = revealRoomWithExits;
/**
 * Create fog map (all tiles start unexplored)
 */
function createFogMap(width, height) {
    const explored = [];
    for (let y = 0; y < height; y++) {
        explored[y] = [];
        for (let x = 0; x < width; x++) {
            explored[y][x] = false;
        }
    }
    return { width, height, explored };
}
/**
 * Check if tile is explored
 */
function isTileExplored(fogMap, x, y) {
    if (y < 0 || y >= fogMap.height || x < 0 || x >= fogMap.width) {
        return false;
    }
    return fogMap.explored[y][x];
}
/**
 * Reveal a single tile
 */
function revealTile(fogMap, x, y) {
    if (y < 0 || y >= fogMap.height || x < 0 || x >= fogMap.width) {
        return fogMap;
    }
    const newExplored = fogMap.explored.map((row) => [...row]);
    newExplored[y][x] = true;
    return {
        ...fogMap,
        explored: newExplored,
    };
}
/**
 * Reveal entire room
 */
function revealRoom(fogMap, room) {
    let result = fogMap;
    for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
            result = revealTile(result, x, y);
        }
    }
    return result;
}
/**
 * Reveal corridor tiles
 */
function revealCorridor(fogMap, corridor) {
    let result = fogMap;
    if (corridor.type === "horizontal") {
        for (let x = corridor.startX; x <= corridor.endX; x++) {
            result = revealTile(result, x, corridor.y);
        }
    }
    else {
        // vertical
        for (let y = corridor.startY; y <= corridor.endY; y++) {
            result = revealTile(result, corridor.x, y);
        }
    }
    return result;
}
// CommonJS exports for Vyb
module.exports = {
    createFogMap,
    isTileExplored,
    revealTile,
    revealRoom,
    revealCorridor,
};
/**
 * Reveal room and adjacent corridor entrances
 * Helps player see where exits are
 */
function revealRoomWithExits(fogMap, room, tiles) {
    let result = revealRoom(fogMap, room);
    // Reveal adjacent tiles that are corridors (floor tiles outside the room)
    for (let y = room.y - 1; y <= room.y + room.height; y++) {
        for (let x = room.x - 1; x <= room.x + room.width; x++) {
            // Skip tiles inside the room (already revealed)
            if (x >= room.x && x < room.x + room.width && y >= room.y && y < room.y + room.height) {
                continue;
            }
            // Check bounds
            if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[0].length) {
                continue;
            }
            // Reveal if it's a floor tile (corridor entrance)
            if (tiles[y][x] === 0) {
                result = revealTile(result, x, y);
            }
        }
    }
    return result;
}
// Update exports
module.exports = {
    createFogMap,
    isTileExplored,
    revealTile,
    revealRoom,
    revealCorridor,
    revealRoomWithExits,
};
