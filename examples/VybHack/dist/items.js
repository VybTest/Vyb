"use strict";
/**
 * Item system for roguelike
 * Health potions and other pickups
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthPotion = createHealthPotion;
exports.getItemX = getItemX;
exports.getItemY = getItemY;
exports.getItemHealAmount = getItemHealAmount;
exports.canPickupItem = canPickupItem;
exports.useHealthPotion = useHealthPotion;
exports.markItemUsed = markItemUsed;
exports.isItemUsed = isItemUsed;
/**
 * Create health potion item
 */
function createHealthPotion(x, y, healAmount) {
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
function getItemX(item) {
    return item.x;
}
/**
 * Get item Y position
 */
function getItemY(item) {
    return item.y;
}
/**
 * Get heal amount from item
 */
function getItemHealAmount(item) {
    return item.healAmount;
}
/**
 * Check if player can pickup item (same position)
 */
function canPickupItem(player, item) {
    return player.x === item.x && player.y === item.y && !item.used;
}
/**
 * Use health potion on player
 */
function useHealthPotion(player, item) {
    const newHP = Math.min(player.hp + item.healAmount, player.maxHP);
    return {
        ...player,
        hp: newHP,
    };
}
/**
 * Mark item as used
 */
function markItemUsed(item) {
    return {
        ...item,
        used: true,
    };
}
/**
 * Check if item is used
 */
function isItemUsed(item) {
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
