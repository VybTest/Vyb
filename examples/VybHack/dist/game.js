"use strict";
/**
 * Game state management
 * Handles dungeon, player, enemies, and game logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = createGame;
exports.getGameWidth = getGameWidth;
exports.getGameHeight = getGameHeight;
exports.getPlayer = getPlayer;
exports.addEnemy = addEnemy;
exports.getEnemyCount = getEnemyCount;
exports.isTileWalkable = isTileWalkable;
exports.getTileAt = getTileAt;
exports.canPlayerMove = canPlayerMove;
exports.setTileAt = setTileAt;
/**
 * Create game state with dungeon
 */
function createGame(width, height, playerX, playerY) {
    // Create tiles (all walls - rooms/corridors will carve out floors)
    const tiles = [];
    for (let y = 0; y < height; y++) {
        tiles[y] = [];
        for (let x = 0; x < width; x++) {
            tiles[y][x] = 1; // wall (will be carved by room generation)
        }
    }
    // Import entity module functions (will be available at runtime)
    const { createPlayer } = require("./entity");
    const player = createPlayer(playerX, playerY, 50); // Balanced challenge
    return {
        width,
        height,
        player,
        enemies: [],
        items: [],
        tiles,
        rooms: [],
    };
}
/**
 * Get dungeon width
 */
function getGameWidth(game) {
    return game.width;
}
/**
 * Get dungeon height
 */
function getGameHeight(game) {
    return game.height;
}
/**
 * Get player from game state
 */
function getPlayer(game) {
    return game.player;
}
/**
 * Add enemy to game state
 */
function addEnemy(game, enemy) {
    return {
        ...game,
        enemies: [...game.enemies, enemy],
    };
}
/**
 * Get enemy count
 */
function getEnemyCount(game) {
    return game.enemies.length;
}
/**
 * Check if tile type is walkable
 */
function isTileWalkable(tileType) {
    return tileType === 0; // 0 = floor (walkable), 1 = wall (not walkable)
}
/**
 * Get tile at position
 */
function getTileAt(game, x, y) {
    if (y < 0 || y >= game.height || x < 0 || x >= game.width) {
        return 1; // Out of bounds = wall
    }
    return game.tiles[y][x];
}
/**
 * Check if player can move to position
 */
function canPlayerMove(game, x, y) {
    // Check bounds
    if (x < 0 || x >= game.width || y < 0 || y >= game.height) {
        return false;
    }
    // Check if tile is walkable
    const tile = getTileAt(game, x, y);
    if (!isTileWalkable(tile)) {
        return false;
    }
    return true;
}
// CommonJS exports for Vyb
module.exports = {
    createGame,
    getGameWidth,
    getGameHeight,
    getPlayer,
    addEnemy,
    getEnemyCount,
    isTileWalkable,
    getTileAt,
    canPlayerMove,
};
/**
 * Set tile at position (for testing/dungeon generation)
 */
function setTileAt(game, x, y, tileType) {
    if (y < 0 || y >= game.height || x < 0 || x >= game.width) {
        return game;
    }
    const newTiles = game.tiles.map((row) => [...row]);
    newTiles[y][x] = tileType;
    return {
        ...game,
        tiles: newTiles,
    };
}
// Update exports
module.exports = {
    createGame,
    getGameWidth,
    getGameHeight,
    getPlayer,
    addEnemy,
    getEnemyCount,
    isTileWalkable,
    getTileAt,
    canPlayerMove,
    setTileAt,
};
