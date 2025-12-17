/**
 * Entity system for roguelike game
 * Handles players, enemies, and items
 */

export interface Entity {
  id: string;
  type: "player" | "enemy" | "item";
  x: number;
  y: number;
  hp: number;
  maxHP: number;
  attack: number;
  defense: number;
}

/**
 * Create a player entity
 */
export function createPlayer(x: number, y: number, maxHP: number): Entity {
  return {
    id: "player",
    type: "player",
    x,
    y,
    hp: maxHP,
    maxHP,
    attack: 15, // Balanced for challenge
    defense: 3,
  };
}

/**
 * Create an enemy entity
 */
export function createEnemy(
  x: number,
  y: number,
  hp: number,
  attack: number,
  defense: number
): Entity {
  return {
    id: `enemy_${x}_${y}`,
    type: "enemy",
    x,
    y,
    hp,
    maxHP: hp,
    attack,
    defense,
  };
}

/**
 * Get entity HP
 */
export function getEntityHP(entity: Entity): number {
  return entity.hp;
}

/**
 * Get entity X position
 */
export function getEntityX(entity: Entity): number {
  return entity.x;
}

/**
 * Get entity Y position
 */
export function getEntityY(entity: Entity): number {
  return entity.y;
}

/**
 * Get entity attack power
 */
export function getEntityAttack(entity: Entity): number {
  return entity.attack;
}

/**
 * Get entity defense power
 */
export function getEntityDefense(entity: Entity): number {
  return entity.defense;
}

/**
 * Move entity to new position
 */
export function moveEntity(entity: Entity, newX: number, newY: number): Entity {
  return {
    ...entity,
    x: newX,
    y: newY,
  };
}

/**
 * Check if position is occupied by entity
 */
export function isPositionOccupied(
  entity: Entity,
  x: number,
  y: number
): boolean {
  return entity.x === x && entity.y === y;
}

/**
 * Apply damage to entity
 */
export function applyDamageToEntity(entity: Entity, damage: number): Entity {
  return {
    ...entity,
    hp: Math.max(0, entity.hp - damage),
  };
}

/**
 * Check if entity is alive
 */
export function isEntityAlive(entity: Entity): boolean {
  return entity.hp > 0;
}

/**
 * Heal entity
 */
export function healEntity(
  entity: Entity,
  amount: number,
  maxHP: number
): Entity {
  return {
    ...entity,
    hp: Math.min(entity.hp + amount, maxHP),
  };
}

// CommonJS exports for Vyb
module.exports = {
  createPlayer,
  createEnemy,
  getEntityHP,
  getEntityX,
  getEntityY,
  getEntityAttack,
  getEntityDefense,
  moveEntity,
  isPositionOccupied,
  applyDamageToEntity,
  isEntityAlive,
  healEntity,
};
