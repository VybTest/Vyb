#!/usr/bin/env node
/**
 * Main entry point for the roguelike game
 * Demonstrates TDD-tested game logic in action!
 */

import * as readline from "readline";
import { GameState, createGame, canPlayerMove, getTileAt, isTileWalkable } from "./game";
import { Entity, createPlayer, createEnemy, moveEntity, applyDamageToEntity, isEntityAlive } from "./entity";
import { calculateDamage } from "./combat";
import { FogMap, createFogMap, revealRoom, isTileExplored } from "./fog-of-war";
import { Room, createRoom, randomInt, isPointInRoom, getRoomCenterX, getRoomCenterY, doRoomsOverlap } from "./dungeon-gen";
import { render, renderGameOver } from "./renderer";
import { moveNorth, moveSouth, moveEast, moveWest } from "./dungeon";
import {
  Ladder, FloorState, createLadder, canUseLadder, createFloorState,
  advanceFloor, getFloorNumber, scaleEnemyHP, scaleEnemyAttack,
  gainXP, getPlayerXP, shouldLevelUp, levelUpPlayer
} from "./progression";

// Game state
let game: GameState;
let fogMap: FogMap;
let currentRoom: Room | null = null;
let ladder: Ladder | null = null;
let floorState: FloorState;

/**
 * Generate dungeon with random rooms
 */
function generateDungeon(floor: number): { game: GameState; rooms: Room[] } {
  const width = 60;
  const height = 20;

  const rooms: Room[] = [];
  const maxRooms = 8;

  // Generate rooms
  for (let i = 0; i < maxRooms; i++) {
    const roomWidth = randomInt(5, 10);
    const roomHeight = randomInt(4, 7);
    const x = randomInt(1, width - roomWidth - 1);
    const y = randomInt(1, height - roomHeight - 1);

    const newRoom = createRoom(x, y, roomWidth, roomHeight);

    // Check for overlaps
    let overlaps = false;
    for (const otherRoom of rooms) {
      if (doRoomsOverlap(newRoom, otherRoom)) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      rooms.push(newRoom);
    }
  }

  // Place player in first room center
  const firstRoom = rooms[0];
  const playerX = getRoomCenterX(firstRoom);
  const playerY = getRoomCenterY(firstRoom);

  const gameState = createGame(width, height, playerX, playerY);

  // Carve out rooms
  for (const room of rooms) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        gameState.tiles[y][x] = 0; // floor
      }
    }
  }

  // Carve corridors between rooms
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const curr = rooms[i];

    const prevCenterX = getRoomCenterX(prev);
    const prevCenterY = getRoomCenterY(prev);
    const currCenterX = getRoomCenterX(curr);
    const currCenterY = getRoomCenterY(curr);

    // Horizontal then vertical corridor
    for (let x = Math.min(prevCenterX, currCenterX); x <= Math.max(prevCenterX, currCenterX); x++) {
      gameState.tiles[prevCenterY][x] = 0;
    }
    for (let y = Math.min(prevCenterY, currCenterY); y <= Math.max(prevCenterY, currCenterY); y++) {
      gameState.tiles[y][currCenterX] = 0;
    }
  }

  // Place enemies in random rooms (skip first room with player)
  for (let i = 1; i < rooms.length; i++) {
    if (randomInt(0, 100) < 70) { // 70% chance of enemy
      const room = rooms[i];
      const enemyX = getRoomCenterX(room);
      const enemyY = getRoomCenterY(room);

      // Scale enemy stats by floor
      const baseHP = randomInt(20, 40);
      const baseAttack = randomInt(8, 12);
      const scaledHP = scaleEnemyHP(baseHP, floor);
      const scaledAttack = scaleEnemyAttack(baseAttack, floor);

      const enemy = createEnemy(enemyX, enemyY, scaledHP, scaledAttack, randomInt(3, 6));
      gameState.enemies.push(enemy);
    }
  }

  // Place health potions and special items
  const { createHealthPotion } = require("./items");

  // Place ladder in the last room (unless floor 10 - Source Code floor)
  if (floor < 10) {
    const lastRoom = rooms[rooms.length - 1];
    const ladderX = getRoomCenterX(lastRoom);
    const ladderY = getRoomCenterY(lastRoom) + 1;
    ladder = createLadder(ladderX, ladderY);
  } else {
    // Floor 10: Spawn the Source Code instead of ladder
    ladder = null;
    const lastRoom = rooms[rooms.length - 1];
    const sourceX = getRoomCenterX(lastRoom);
    const sourceY = getRoomCenterY(lastRoom);

    // Source Code: special item with 0 heal (used as flag)
    const sourceCode = createHealthPotion(sourceX, sourceY, 0);
    sourceCode.id = "source_code"; // Mark for special rendering
    gameState.items.push(sourceCode);
  }

  // Place health potions in random rooms
  for (let i = 1; i < rooms.length; i++) {
    if (randomInt(0, 100) < 50) { // 50% chance of potion
      const room = rooms[i];
      const itemX = getRoomCenterX(room) + randomInt(-2, 2);
      const itemY = getRoomCenterY(room) + randomInt(-1, 1);
      const potion = createHealthPotion(itemX, itemY, 20);
      gameState.items.push(potion);
    }
  }

  gameState.rooms = rooms;
  return { game: gameState, rooms };
}

/**
 * Update fog of war based on player position
 */
function updateFogOfWar(): void {
  // Find current room
  for (const room of game.rooms) {
    if (isPointInRoom(room, game.player.x, game.player.y)) {
      // Player entered a new room - reveal it and corridor entrances
      if (currentRoom !== room) {
        currentRoom = room;
        const { revealRoomWithExits } = require("./fog-of-war");
        fogMap = revealRoomWithExits(fogMap, room, game.tiles);
      }
      return;
    }
  }

  // Player in corridor - reveal just current tile
  const { revealTile } = require("./fog-of-war");
  fogMap = revealTile(fogMap, game.player.x, game.player.y);
}

/**
 * Move all enemies toward player (enemy AI turn)
 */
function moveEnemies(): void {
  const { getAIMoveX, getAIMoveY, isAdjacentTo } = require("./enemy-ai");

  for (let i = 0; i < game.enemies.length; i++) {
    const enemy = game.enemies[i];

    // Skip dead enemies
    if (enemy.hp <= 0) continue;

    // If adjacent, attack player
    if (isAdjacentTo(enemy, game.player)) {
      const damage = calculateDamage(enemy.attack, game.player.defense);
      game.player = applyDamageToEntity(game.player, damage);
      console.log(`\n💥 Enemy attacks for ${damage} damage!`);

      if (!isEntityAlive(game.player)) {
        renderGameOver(false);
        process.exit(0);
      }
      continue; // Don't move, just attacked
    }

    // Move toward player
    const newX = getAIMoveX(enemy, game.player);
    const newY = getAIMoveY(enemy, game.player);

    // Check if can move (don't move through walls or other enemies)
    const tile = getTileAt(game, newX, newY);
    if (!isTileWalkable(tile)) continue;

    // Check for other enemies at target position
    const blocked = game.enemies.some(
      (other, j) => j !== i && other.x === newX && other.y === newY && other.hp > 0
    );
    if (blocked) continue;

    // Move enemy
    game.enemies[i] = moveEntity(enemy, newX, newY);
  }
}

/**
 * Handle player movement
 */
function handleMove(direction: string): void {
  let newX = game.player.x;
  let newY = game.player.y;

  switch (direction.toLowerCase()) {
    case "w":
      newY = moveNorth(newY);
      break;
    case "s":
      newY = moveSouth(newY);
      break;
    case "a":
      newX = moveWest(newX);
      break;
    case "d":
      newX = moveEast(newX);
      break;
    default:
      return;
  }

  // Check if move is valid
  if (!canPlayerMove(game, newX, newY)) {
    return;
  }

  // Check for enemy at target position
  const enemyIndex = game.enemies.findIndex(
    (e) => e.x === newX && e.y === newY && e.hp > 0
  );

  if (enemyIndex >= 0) {
    // Attack enemy
    const enemy = game.enemies[enemyIndex];
    const damage = calculateDamage(game.player.attack, enemy.defense);
    const damagedEnemy = applyDamageToEntity(enemy, damage);
    game.enemies[enemyIndex] = damagedEnemy;

    if (!isEntityAlive(damagedEnemy)) {
      // Award XP (10 XP per enemy)
      game.player = gainXP(game.player, 10);
      const currentXP = getPlayerXP(game.player);
      console.log(`\n💀 You defeated an enemy! (${damage} damage) [+10 XP → ${currentXP} XP]`);

      // Check for level up
      if (shouldLevelUp(currentXP)) {
        game.player = levelUpPlayer(game.player);
        console.log(`\n⭐ LEVEL UP! ATK +3, Max HP +10 (Healed to full)`);
      }
    } else {
      console.log(`\n⚔️  You hit the enemy for ${damage} damage! (HP: ${damagedEnemy.hp})`);
    }

    // Enemy counterattack if alive
    if (isEntityAlive(damagedEnemy)) {
      const counterDamage = calculateDamage(enemy.attack, game.player.defense);
      game.player = applyDamageToEntity(game.player, counterDamage);
      console.log(`\n💥 Enemy counterattacks for ${counterDamage} damage!`);

      if (!isEntityAlive(game.player)) {
        renderGameOver(false);
        process.exit(0);
      }
    }

    return; // Don't move, just attacked
  }

  // Move player
  game.player = moveEntity(game.player, newX, newY);
  updateFogOfWar();

  // Check for item pickup
  const { canPickupItem, useHealthPotion, markItemUsed } = require("./items");
  const itemIndex = game.items.findIndex(
    (item) => canPickupItem(game.player, item)
  );

  if (itemIndex >= 0) {
    const item = game.items[itemIndex];

    // Check if it's the Source Code (victory item)
    if (item.id === "source_code") {
      console.clear();
      console.log("\n" + "━".repeat(50));
      console.log("💾 YOU FOUND THE SOURCE CODE! 💾");
      console.log("━".repeat(50));
      console.log("\nYou have conquered all 10 floors of VybHack!");
      console.log("The ultimate treasure has been claimed!");
      console.log("\n" + "━".repeat(50) + "\n");
      process.exit(0);
    }

    game.player = useHealthPotion(game.player, item);
    game.items[itemIndex] = markItemUsed(item);
    console.log(`\n💚 Picked up health potion! (+${item.healAmount} HP)`);
  }

  // Check for ladder - auto-descend when stepping on it
  if (ladder && canUseLadder(game.player, ladder)) {
    handleLadderUse();
    return; // Skip enemy turn on floor transition
  }

  // Enemy turn - all enemies move toward player
  moveEnemies();
}

/**
 * Handle ladder descent
 */
function handleLadderUse(): void {
  if (!ladder || !canUseLadder(game.player, ladder)) {
    return;
  }

  // Advance to next floor
  floorState = advanceFloor(floorState);
  const newFloor = getFloorNumber(floorState);

  console.log(`\n🌊 Descending to Floor ${newFloor}...`);

  // Preserve player stats before generating new dungeon
  const oldPlayer = game.player;

  // Generate new dungeon
  const { game: newGame, rooms } = generateDungeon(newFloor);
  game = newGame;

  // Restore player stats but use new position
  game.player = { ...oldPlayer, x: game.player.x, y: game.player.y };
  fogMap = createFogMap(game.width, game.height);
  currentRoom = null;

  console.log(`\nFloor ${newFloor} | ${rooms.length} rooms | ${game.enemies.length} enemies`);
  updateFogOfWar();
}

/**
 * Check win condition (floor cleared for ladder access)
 */
function checkWin(): boolean {
  return game.enemies.every((e) => e.hp <= 0);
}

/**
 * Main game loop
 */
function gameLoop(): void {
  // Setup readline for input
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  // Initial render
  updateFogOfWar();
  render(game, fogMap, getFloorNumber(floorState), ladder);

  // Handle input
  process.stdin.on("keypress", (_str, key) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      process.exit(0);
    }

    if (["w", "a", "s", "d"].includes(key.name)) {
      handleMove(key.name);
      render(game, fogMap, getFloorNumber(floorState), ladder);

      // Check floor clear (for non-floor-10 victory)
      if (checkWin() && getFloorNumber(floorState) < 10) {
        renderGameOver(true);
        process.exit(0);
      }
    }
  });
}

/**
 * Start the game
 */
function main(): void {
  console.clear();
  console.log("🌊 Welcome to VybHack!");
  console.log("A roguelike built with TDD using Vyb\n");
  console.log("Generating dungeon...");

  // Initialize floor state
  floorState = createFloorState(1);

  const { game: generatedGame, rooms } = generateDungeon(1);
  game = generatedGame;
  fogMap = createFogMap(game.width, game.height);

  console.log(`Floor 1 | ${rooms.length} rooms | ${game.enemies.length} enemies`);
  console.log("\nPress any key to start...");

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.once("keypress", () => {
    gameLoop();
  });
}

// Start the game
main();
