"use strict";
/**
 * Player system for roguelike game
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeDamage = takeDamage;
exports.isAlive = isAlive;
exports.heal = heal;
/**
 * Apply damage to player
 * @param currentHP - Current hit points
 * @param damage - Damage amount
 * @returns New HP after damage
 */
function takeDamage(currentHP, damage) {
    return currentHP - damage;
}
/**
 * Check if player is alive
 * @param hp - Current hit points
 * @returns True if HP > 0
 */
function isAlive(hp) {
    return hp > 0;
}
/**
 * Heal player
 * @param currentHP - Current hit points
 * @param amount - Heal amount
 * @param maxHP - Maximum hit points
 * @returns New HP (capped at maxHP)
 */
function heal(currentHP, amount, maxHP) {
    return Math.min(currentHP + amount, maxHP);
}
// CommonJS exports for Vyb
module.exports = {
    takeDamage,
    isAlive,
    heal,
};
