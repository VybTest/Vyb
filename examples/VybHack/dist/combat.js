"use strict";
/**
 * Combat system for roguelike game
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDamage = calculateDamage;
exports.applyCritical = applyCritical;
/**
 * Calculate damage dealt in combat
 * @param attack - Attacker's power
 * @param defense - Defender's defense
 * @returns Damage dealt (minimum 1)
 */
function calculateDamage(attack, defense) {
    const damage = attack - defense;
    return Math.max(damage, 1); // Minimum damage is always 1
}
/**
 * Apply critical hit multiplier
 * @param damage - Base damage
 * @param isCritical - Whether this is a critical hit
 * @returns Final damage (doubled if critical)
 */
function applyCritical(damage, isCritical) {
    return isCritical ? damage * 2 : damage;
}
// CommonJS exports for Vyb
module.exports = {
    calculateDamage,
    applyCritical,
};
