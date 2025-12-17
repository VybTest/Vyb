/**
 * Game state management
 * Handles dungeon, player, enemies, and game logic
 */

import { Entity } from "./entity";
import { Room } from "./dungeon-gen";
import { Item } from "./items";

export interface GameState {
  width: number;
  height: number;
  player: Entity;
  enemies: Entity[];
  items: Item[];
  tiles: number[][]; // 0 = floor, 1 = wall
  rooms: Room[];
}

/**
 * Create game state with dungeon
 */
export function createGame(
  width: number,
  height: number,
  playerX: number,
  playerY: number
): GameState {
  // Create tiles (all walls - rooms/corridors will carve out floors)
  const tiles: number[][] = [];
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
export function getGameWidth(game: GameState): number {
  return game.width;
}

/**
 * Get dungeon height
 */
export function getGameHeight(game: GameState): number {
  return game.height;
}

/**
 * Get player from game state
 */
export function getPlayer(game: GameState): Entity {
  return game.player;
}

/**
 * Add enemy to game state
 */
export function addEnemy(game: GameState, enemy: Entity): GameState {
  return {
    ...game,
    enemies: [...game.enemies, enemy],
  };
}

/**
 * Get enemy count
 */
export function getEnemyCount(game: GameState): number {
  return game.enemies.length;
}

/**
 * Check if tile type is walkable
 */
export function isTileWalkable(tileType: number): boolean {
  return tileType === 0; // 0 = floor (walkable), 1 = wall (not walkable)
}

/**
 * Get tile at position
 */
export function getTileAt(game: GameState, x: number, y: number): number {
  if (y < 0 || y >= game.height || x < 0 || x >= game.width) {
    return 1; // Out of bounds = wall
  }
  return game.tiles[y][x];
}

/**
 * Check if player can move to position
 */
export function canPlayerMove(game: GameState, x: number, y: number): boolean {
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
export function setTileAt(
  game: GameState,
  x: number,
  y: number,
  tileType: number
): GameState {
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
