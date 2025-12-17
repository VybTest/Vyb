"use strict";
/**
 * Inventory system for roguelike game
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addItem = addItem;
exports.removeItem = removeItem;
exports.isInventoryFull = isInventoryFull;
/**
 * Add item to inventory
 * @param currentCount - Current item count
 * @returns New item count
 */
function addItem(currentCount) {
    return currentCount + 1;
}
/**
 * Remove item from inventory
 * @param currentCount - Current item count
 * @returns New item count
 */
function removeItem(currentCount) {
    return currentCount - 1;
}
/**
 * Check if inventory is full
 * @param currentCount - Current item count
 * @param maxCapacity - Maximum capacity
 * @returns True if inventory is at max capacity
 */
function isInventoryFull(currentCount, maxCapacity) {
    return currentCount >= maxCapacity;
}
// CommonJS exports for Vyb
module.exports = {
    addItem,
    removeItem,
    isInventoryFull,
};
