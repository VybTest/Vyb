/**
 * Inventory system for roguelike game
 */

/**
 * Add item to inventory
 * @param currentCount - Current item count
 * @returns New item count
 */
export function addItem(currentCount: number): number {
  return currentCount + 1;
}

/**
 * Remove item from inventory
 * @param currentCount - Current item count
 * @returns New item count
 */
export function removeItem(currentCount: number): number {
  return currentCount - 1;
}

/**
 * Check if inventory is full
 * @param currentCount - Current item count
 * @param maxCapacity - Maximum capacity
 * @returns True if inventory is at max capacity
 */
export function isInventoryFull(currentCount: number, maxCapacity: number): boolean {
  return currentCount >= maxCapacity;
}

// CommonJS exports for Vyb
module.exports = {
  addItem,
  removeItem,
  isInventoryFull,
};
