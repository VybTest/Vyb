/**
 * Player system for roguelike game
 */

/**
 * Apply damage to player
 * @param currentHP - Current hit points
 * @param damage - Damage amount
 * @returns New HP after damage
 */
export function takeDamage(currentHP: number, damage: number): number {
  return currentHP - damage;
}

/**
 * Check if player is alive
 * @param hp - Current hit points
 * @returns True if HP > 0
 */
export function isAlive(hp: number): boolean {
  return hp > 0;
}

/**
 * Heal player
 * @param currentHP - Current hit points
 * @param amount - Heal amount
 * @param maxHP - Maximum hit points
 * @returns New HP (capped at maxHP)
 */
export function heal(currentHP: number, amount: number, maxHP: number): number {
  return Math.min(currentHP + amount, maxHP);
}

// CommonJS exports for Vyb
module.exports = {
  takeDamage,
  isAlive,
  heal,
};
