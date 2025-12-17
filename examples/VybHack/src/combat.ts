/**
 * Combat system for roguelike game
 */

/**
 * Calculate damage dealt in combat
 * @param attack - Attacker's power
 * @param defense - Defender's defense
 * @returns Damage dealt (minimum 1)
 */
export function calculateDamage(attack: number, defense: number): number {
  const damage = attack - defense;
  return Math.max(damage, 1); // Minimum damage is always 1
}

/**
 * Apply critical hit multiplier
 * @param damage - Base damage
 * @param isCritical - Whether this is a critical hit
 * @returns Final damage (doubled if critical)
 */
export function applyCritical(damage: number, isCritical: boolean): number {
  return isCritical ? damage * 2 : damage;
}

// CommonJS exports for Vyb
module.exports = {
  calculateDamage,
  applyCritical,
};
