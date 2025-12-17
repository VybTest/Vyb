/**
 * Item system for roguelike
 * Health potions and other pickups
 */

import { Entity } from "./entity";

export interface Item {
  id: string;
  type: "health_potion";
  x: number;
  y: number;
  healAmount: number;
  used: boolean;
}

/**
 * Create health potion item
 */
export function createHealthPotion(
  x: number,
  y: number,
  healAmount: number
): Item {
  return {
    id: `potion_${x}_${y}`,
    type: "health_potion",
    x,
    y,
    healAmount,
    used: false,
  };
}

/**
 * Get item X position
 */
export function getItemX(item: Item): number {
  return item.x;
}

/**
 * Get item Y position
 */
export function getItemY(item: Item): number {
  return item.y;
}

/**
 * Get heal amount from item
 */
export function getItemHealAmount(item: Item): number {
  return item.healAmount;
}

/**
 * Check if player can pickup item (same position)
 */
export function canPickupItem(player: Entity, item: Item): boolean {
  return player.x === item.x && player.y === item.y && !item.used;
}

/**
 * Use health potion on player
 */
export function useHealthPotion(player: Entity, item: Item): Entity {
  const newHP = Math.min(player.hp + item.healAmount, player.maxHP);
  return {
    ...player,
    hp: newHP,
  };
}

/**
 * Mark item as used
 */
export function markItemUsed(item: Item): Item {
  return {
    ...item,
    used: true,
  };
}

/**
 * Check if item is used
 */
export function isItemUsed(item: Item): boolean {
  return item.used;
}

// CommonJS exports
module.exports = {
  createHealthPotion,
  getItemX,
  getItemY,
  getItemHealAmount,
  canPickupItem,
  useHealthPotion,
  markItemUsed,
  isItemUsed,
};
