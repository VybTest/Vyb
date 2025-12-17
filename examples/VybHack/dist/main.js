#!/usr/bin/env node
"use strict";
/**
 * Main entry point for the roguelike game
 * Demonstrates TDD-tested game logic in action!
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const game_1 = require("./game");
const entity_1 = require("./entity");
const combat_1 = require("./combat");
const fog_of_war_1 = require("./fog-of-war");
const dungeon_gen_1 = require("./dungeon-gen");
const renderer_1 = require("./renderer");
const dungeon_1 = require("./dungeon");
const progression_1 = require("./progression");
// Game state
let game;
let fogMap;
let currentRoom = null;
let ladder = null;
let floorState;
/**
 * Generate dungeon with random rooms
 */
function generateDungeon(floor) {
    const width = 60;
    const height = 20;
    const rooms = [];
    const maxRooms = 8;
    // Generate rooms
    for (let i = 0; i < maxRooms; i++) {
        const roomWidth = (0, dungeon_gen_1.randomInt)(5, 10);
        const roomHeight = (0, dungeon_gen_1.randomInt)(4, 7);
        const x = (0, dungeon_gen_1.randomInt)(1, width - roomWidth - 1);
        const y = (0, dungeon_gen_1.randomInt)(1, height - roomHeight - 1);
        const newRoom = (0, dungeon_gen_1.createRoom)(x, y, roomWidth, roomHeight);
        // Check for overlaps
        let overlaps = false;
        for (const otherRoom of rooms) {
            if ((0, dungeon_gen_1.doRoomsOverlap)(newRoom, otherRoom)) {
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
    const playerX = (0, dungeon_gen_1.getRoomCenterX)(firstRoom);
    const playerY = (0, dungeon_gen_1.getRoomCenterY)(firstRoom);
    const gameState = (0, game_1.createGame)(width, height, playerX, playerY);
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
        const prevCenterX = (0, dungeon_gen_1.getRoomCenterX)(prev);
        const prevCenterY = (0, dungeon_gen_1.getRoomCenterY)(prev);
        const currCenterX = (0, dungeon_gen_1.getRoomCenterX)(curr);
        const currCenterY = (0, dungeon_gen_1.getRoomCenterY)(curr);
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
        if ((0, dungeon_gen_1.randomInt)(0, 100) < 70) { // 70% chance of enemy
            const room = rooms[i];
            const enemyX = (0, dungeon_gen_1.getRoomCenterX)(room);
            const enemyY = (0, dungeon_gen_1.getRoomCenterY)(room);
            // Scale enemy stats by floor
            const baseHP = (0, dungeon_gen_1.randomInt)(20, 40);
            const baseAttack = (0, dungeon_gen_1.randomInt)(8, 12);
            const scaledHP = (0, progression_1.scaleEnemyHP)(baseHP, floor);
            const scaledAttack = (0, progression_1.scaleEnemyAttack)(baseAttack, floor);
            const enemy = (0, entity_1.createEnemy)(enemyX, enemyY, scaledHP, scaledAttack, (0, dungeon_gen_1.randomInt)(3, 6));
            gameState.enemies.push(enemy);
        }
    }
    // Place health potions and special items
    const { createHealthPotion } = require("./items");
    // Place ladder in the last room (unless floor 10 - Source Code floor)
    if (floor < 10) {
        const lastRoom = rooms[rooms.length - 1];
        const ladderX = (0, dungeon_gen_1.getRoomCenterX)(lastRoom);
        const ladderY = (0, dungeon_gen_1.getRoomCenterY)(lastRoom) + 1;
        ladder = (0, progression_1.createLadder)(ladderX, ladderY);
    }
    else {
        // Floor 10: Spawn the Source Code instead of ladder
        ladder = null;
        const lastRoom = rooms[rooms.length - 1];
        const sourceX = (0, dungeon_gen_1.getRoomCenterX)(lastRoom);
        const sourceY = (0, dungeon_gen_1.getRoomCenterY)(lastRoom);
        // Source Code: special item with 0 heal (used as flag)
        const sourceCode = createHealthPotion(sourceX, sourceY, 0);
        sourceCode.id = "source_code"; // Mark for special rendering
        gameState.items.push(sourceCode);
    }
    // Place health potions in random rooms
    for (let i = 1; i < rooms.length; i++) {
        if ((0, dungeon_gen_1.randomInt)(0, 100) < 50) { // 50% chance of potion
            const room = rooms[i];
            const itemX = (0, dungeon_gen_1.getRoomCenterX)(room) + (0, dungeon_gen_1.randomInt)(-2, 2);
            const itemY = (0, dungeon_gen_1.getRoomCenterY)(room) + (0, dungeon_gen_1.randomInt)(-1, 1);
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
function updateFogOfWar() {
    // Find current room
    for (const room of game.rooms) {
        if ((0, dungeon_gen_1.isPointInRoom)(room, game.player.x, game.player.y)) {
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
function moveEnemies() {
    const { getAIMoveX, getAIMoveY, isAdjacentTo } = require("./enemy-ai");
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];
        // Skip dead enemies
        if (enemy.hp <= 0)
            continue;
        // If adjacent, attack player
        if (isAdjacentTo(enemy, game.player)) {
            const damage = (0, combat_1.calculateDamage)(enemy.attack, game.player.defense);
            game.player = (0, entity_1.applyDamageToEntity)(game.player, damage);
            console.log(`\n💥 Enemy attacks for ${damage} damage!`);
            if (!(0, entity_1.isEntityAlive)(game.player)) {
                (0, renderer_1.renderGameOver)(false);
                process.exit(0);
            }
            continue; // Don't move, just attacked
        }
        // Move toward player
        const newX = getAIMoveX(enemy, game.player);
        const newY = getAIMoveY(enemy, game.player);
        // Check if can move (don't move through walls or other enemies)
        const tile = (0, game_1.getTileAt)(game, newX, newY);
        if (!(0, game_1.isTileWalkable)(tile))
            continue;
        // Check for other enemies at target position
        const blocked = game.enemies.some((other, j) => j !== i && other.x === newX && other.y === newY && other.hp > 0);
        if (blocked)
            continue;
        // Move enemy
        game.enemies[i] = (0, entity_1.moveEntity)(enemy, newX, newY);
    }
}
/**
 * Handle player movement
 */
function handleMove(direction) {
    let newX = game.player.x;
    let newY = game.player.y;
    switch (direction.toLowerCase()) {
        case "w":
            newY = (0, dungeon_1.moveNorth)(newY);
            break;
        case "s":
            newY = (0, dungeon_1.moveSouth)(newY);
            break;
        case "a":
            newX = (0, dungeon_1.moveWest)(newX);
            break;
        case "d":
            newX = (0, dungeon_1.moveEast)(newX);
            break;
        default:
            return;
    }
    // Check if move is valid
    if (!(0, game_1.canPlayerMove)(game, newX, newY)) {
        return;
    }
    // Check for enemy at target position
    const enemyIndex = game.enemies.findIndex((e) => e.x === newX && e.y === newY && e.hp > 0);
    if (enemyIndex >= 0) {
        // Attack enemy
        const enemy = game.enemies[enemyIndex];
        const damage = (0, combat_1.calculateDamage)(game.player.attack, enemy.defense);
        const damagedEnemy = (0, entity_1.applyDamageToEntity)(enemy, damage);
        game.enemies[enemyIndex] = damagedEnemy;
        if (!(0, entity_1.isEntityAlive)(damagedEnemy)) {
            // Award XP (10 XP per enemy)
            game.player = (0, progression_1.gainXP)(game.player, 10);
            const currentXP = (0, progression_1.getPlayerXP)(game.player);
            console.log(`\n💀 You defeated an enemy! (${damage} damage) [+10 XP → ${currentXP} XP]`);
            // Check for level up
            if ((0, progression_1.shouldLevelUp)(currentXP)) {
                game.player = (0, progression_1.levelUpPlayer)(game.player);
                console.log(`\n⭐ LEVEL UP! ATK +3, Max HP +10 (Healed to full)`);
            }
        }
        else {
            console.log(`\n⚔️  You hit the enemy for ${damage} damage! (HP: ${damagedEnemy.hp})`);
        }
        // Enemy counterattack if alive
        if ((0, entity_1.isEntityAlive)(damagedEnemy)) {
            const counterDamage = (0, combat_1.calculateDamage)(enemy.attack, game.player.defense);
            game.player = (0, entity_1.applyDamageToEntity)(game.player, counterDamage);
            console.log(`\n💥 Enemy counterattacks for ${counterDamage} damage!`);
            if (!(0, entity_1.isEntityAlive)(game.player)) {
                (0, renderer_1.renderGameOver)(false);
                process.exit(0);
            }
        }
        return; // Don't move, just attacked
    }
    // Move player
    game.player = (0, entity_1.moveEntity)(game.player, newX, newY);
    updateFogOfWar();
    // Check for item pickup
    const { canPickupItem, useHealthPotion, markItemUsed } = require("./items");
    const itemIndex = game.items.findIndex((item) => canPickupItem(game.player, item));
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
    if (ladder && (0, progression_1.canUseLadder)(game.player, ladder)) {
        handleLadderUse();
        return; // Skip enemy turn on floor transition
    }
    // Enemy turn - all enemies move toward player
    moveEnemies();
}
/**
 * Handle ladder descent
 */
function handleLadderUse() {
    if (!ladder || !(0, progression_1.canUseLadder)(game.player, ladder)) {
        return;
    }
    // Advance to next floor
    floorState = (0, progression_1.advanceFloor)(floorState);
    const newFloor = (0, progression_1.getFloorNumber)(floorState);
    console.log(`\n🌊 Descending to Floor ${newFloor}...`);
    // Preserve player stats before generating new dungeon
    const oldPlayer = game.player;
    // Generate new dungeon
    const { game: newGame, rooms } = generateDungeon(newFloor);
    game = newGame;
    // Restore player stats but use new position
    game.player = { ...oldPlayer, x: game.player.x, y: game.player.y };
    fogMap = (0, fog_of_war_1.createFogMap)(game.width, game.height);
    currentRoom = null;
    console.log(`\nFloor ${newFloor} | ${rooms.length} rooms | ${game.enemies.length} enemies`);
    updateFogOfWar();
}
/**
 * Check win condition (floor cleared for ladder access)
 */
function checkWin() {
    return game.enemies.every((e) => e.hp <= 0);
}
/**
 * Main game loop
 */
function gameLoop() {
    // Setup readline for input
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    // Initial render
    updateFogOfWar();
    (0, renderer_1.render)(game, fogMap, (0, progression_1.getFloorNumber)(floorState), ladder);
    // Handle input
    process.stdin.on("keypress", (_str, key) => {
        if (key.name === "q" || (key.ctrl && key.name === "c")) {
            process.exit(0);
        }
        if (["w", "a", "s", "d"].includes(key.name)) {
            handleMove(key.name);
            (0, renderer_1.render)(game, fogMap, (0, progression_1.getFloorNumber)(floorState), ladder);
            // Check floor clear (for non-floor-10 victory)
            if (checkWin() && (0, progression_1.getFloorNumber)(floorState) < 10) {
                (0, renderer_1.renderGameOver)(true);
                process.exit(0);
            }
        }
    });
}
/**
 * Start the game
 */
function main() {
    console.clear();
    console.log("🌊 Welcome to VybHack!");
    console.log("A roguelike built with TDD using Vyb\n");
    console.log("Generating dungeon...");
    // Initialize floor state
    floorState = (0, progression_1.createFloorState)(1);
    const { game: generatedGame, rooms } = generateDungeon(1);
    game = generatedGame;
    fogMap = (0, fog_of_war_1.createFogMap)(game.width, game.height);
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
