/**
 * Terminal renderer for the roguelike game
 */

import { GameState } from "./game";
import { Entity } from "./entity";
import { FogMap } from "./fog-of-war";
import { Ladder } from "./progression";

const CLEAR_SCREEN = "\x1b[2J\x1b[H";
const RESET_COLOR = "\x1b[0m";
const COLOR_PLAYER = "\x1b[32m"; // Green
const COLOR_ENEMY = "\x1b[31m";  // Red
const COLOR_ITEM = "\x1b[33m";   // Yellow
const COLOR_LADDER = "\x1b[35m"; // Magenta
const COLOR_WALL = "\x1b[90m";   // Gray
const COLOR_UNEXPLORED = "\x1b[90m"; // Dark gray

/**
 * Render the game state to terminal
 */
export function render(game: GameState, fogMap: FogMap, floor: number = 1, ladder: Ladder | null = null): void {
  // Clear screen
  process.stdout.write(CLEAR_SCREEN);

  // Render title
  console.log(`🌊 VybHack - Floor ${floor}`);
  console.log("━".repeat(game.width + 2));
  console.log();

  // Render dungeon
  for (let y = 0; y < game.height; y++) {
    let line = "";
    for (let x = 0; x < game.width; x++) {
      const tile = game.tiles[y][x];
      const explored = fogMap.explored[y][x];

      // Check if player is at this position
      if (game.player.x === x && game.player.y === y) {
        line += COLOR_PLAYER + "@" + RESET_COLOR;
        continue;
      }

      // Check if any enemy is at this position
      const enemy = game.enemies.find((e) => e.x === x && e.y === y);
      if (enemy && enemy.hp > 0 && explored) {
        const symbol = "E";
        line += COLOR_ENEMY + symbol + RESET_COLOR;
        continue;
      }

      // Check if ladder is at this position
      if (ladder && ladder.x === x && ladder.y === y && explored) {
        line += COLOR_LADDER + ">" + RESET_COLOR;
        continue;
      }

      // Check if any item is at this position
      const item = game.items.find((i) => i.x === x && i.y === y && !i.used);
      if (item && explored) {
        const symbol = item.id === "source_code" ? "$" : "!";
        line += COLOR_ITEM + symbol + RESET_COLOR;
        continue;
      }

      // Render tile based on exploration
      if (!explored) {
        line += COLOR_UNEXPLORED + " " + RESET_COLOR;
      } else if (tile === 1) {
        line += COLOR_WALL + "#" + RESET_COLOR;
      } else {
        line += ".";
      }
    }
    console.log(line);
  }

  console.log();
  console.log("━".repeat(game.width + 2));

  // Render player stats
  console.log(
    `${COLOR_PLAYER}@ Player${RESET_COLOR} | HP: ${game.player.hp}/${game.player.maxHP} | ATK: ${game.player.attack} | DEF: ${game.player.defense}`
  );

  // Render floor and enemy count
  const aliveEnemies = game.enemies.filter((e) => e.hp > 0).length;
  console.log(`Floor ${floor} | ${COLOR_ENEMY}E Enemies${RESET_COLOR}: ${aliveEnemies}`);

  console.log();
  console.log("Controls: WASD = Move | Q = Quit");
  console.log();
}

/**
 * Render game over screen
 */
export function renderGameOver(won: boolean): void {
  process.stdout.write(CLEAR_SCREEN);
  console.log();
  console.log("━".repeat(40));
  if (won) {
    console.log("🎉 VICTORY! You defeated all enemies!");
  } else {
    console.log("💀 GAME OVER! You have been defeated...");
  }
  console.log("━".repeat(40));
  console.log();
  console.log("Thanks for playing VybHack!");
  console.log();
}

// CommonJS exports
module.exports = {
  render,
  renderGameOver,
};
