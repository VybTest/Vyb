/**
 * Progression system - floors, leveling, scaling
 */

import { Entity } from "./entity";

export interface Ladder {
  x: number;
  y: number;
}

export interface FloorState {
  floor: number;
}

/**
 * Create ladder at position
 */
export function createLadder(x: number, y: number): Ladder {
  return { x, y };
}

/**
 * Get ladder X position
 */
export function getLadderX(ladder: Ladder): number {
  return ladder.x;
}

/**
 * Get ladder Y position
 */
export function getLadderY(ladder: Ladder): number {
  return ladder.y;
}

/**
 * Check if player can use ladder
 */
export function canUseLadder(player: Entity, ladder: Ladder): boolean {
  return player.x === ladder.x && player.y === ladder.y;
}

/**
 * Create floor state
 */
export function createFloorState(floor: number): FloorState {
  return { floor };
}

/**
 * Get current floor number
 */
export function getFloorNumber(state: FloorState): number {
  return state.floor;
}

/**
 * Advance to next floor
 */
export function advanceFloor(state: FloorState): FloorState {
  return { floor: state.floor + 1 };
}

/**
 * Scale enemy HP by floor (10% increase per floor)
 */
export function scaleEnemyHP(baseHP: number, floor: number): number {
  return Math.floor(baseHP * (1 + (floor - 1) * 0.1));
}

/**
 * Scale enemy attack by floor (10% increase per floor)
 */
export function scaleEnemyAttack(baseAttack: number, floor: number): number {
  return Math.floor(baseAttack * (1 + (floor - 1) * 0.1));
}

/**
 * Set player XP
 */
export function setPlayerXP(player: Entity, xp: number): Entity {
  const baseId = player.id.replace(/_xp\d+/, "");
  return { ...player, id: `${baseId}_xp${xp}` }; // Store XP in id for now
}

/**
 * Gain XP
 */
export function gainXP(player: Entity, amount: number): Entity {
  const currentXP = getPlayerXP(player);
  return setPlayerXP(player, currentXP + amount);
}

/**
 * Get player XP (parsed from ID)
 */
export function getPlayerXP(player: Entity): number {
  const match = player.id.match(/_xp(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Check if should level up (100 XP threshold)
 */
export function shouldLevelUp(xp: number): boolean {
  return xp >= 100;
}

/**
 * Level up player (+3 ATK, +10 max HP, heal to full)
 */
export function levelUpPlayer(player: Entity): Entity {
  return {
    ...player,
    attack: player.attack + 3,
    maxHP: player.maxHP + 10,
    hp: player.maxHP + 10, // Heal to new max
  };
}

// CommonJS exports
module.exports = {
  createLadder,
  getLadderX,
  getLadderY,
  canUseLadder,
  createFloorState,
  getFloorNumber,
  advanceFloor,
  scaleEnemyHP,
  scaleEnemyAttack,
  setPlayerXP,
  gainXP,
  getPlayerXP,
  shouldLevelUp,
  levelUpPlayer,
};
