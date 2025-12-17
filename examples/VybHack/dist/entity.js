"use strict";
/**
 * Entity system for roguelike game
 * Handles players, enemies, and items
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayer = createPlayer;
exports.createEnemy = createEnemy;
exports.getEntityHP = getEntityHP;
exports.getEntityX = getEntityX;
exports.getEntityY = getEntityY;
exports.getEntityAttack = getEntityAttack;
exports.getEntityDefense = getEntityDefense;
exports.moveEntity = moveEntity;
exports.isPositionOccupied = isPositionOccupied;
exports.applyDamageToEntity = applyDamageToEntity;
exports.isEntityAlive = isEntityAlive;
exports.healEntity = healEntity;
/**
 * Create a player entity
 */
function createPlayer(x, y, maxHP) {
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
function createEnemy(x, y, hp, attack, defense) {
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
function getEntityHP(entity) {
    return entity.hp;
}
/**
 * Get entity X position
 */
function getEntityX(entity) {
    return entity.x;
}
/**
 * Get entity Y position
 */
function getEntityY(entity) {
    return entity.y;
}
/**
 * Get entity attack power
 */
function getEntityAttack(entity) {
    return entity.attack;
}
/**
 * Get entity defense power
 */
function getEntityDefense(entity) {
    return entity.defense;
}
/**
 * Move entity to new position
 */
function moveEntity(entity, newX, newY) {
    return {
        ...entity,
        x: newX,
        y: newY,
    };
}
/**
 * Check if position is occupied by entity
 */
function isPositionOccupied(entity, x, y) {
    return entity.x === x && entity.y === y;
}
/**
 * Apply damage to entity
 */
function applyDamageToEntity(entity, damage) {
    return {
        ...entity,
        hp: Math.max(0, entity.hp - damage),
    };
}
/**
 * Check if entity is alive
 */
function isEntityAlive(entity) {
    return entity.hp > 0;
}
/**
 * Heal entity
 */
function healEntity(entity, amount, maxHP) {
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
