"use strict";
/**
 * Progression system - floors, leveling, scaling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLadder = createLadder;
exports.getLadderX = getLadderX;
exports.getLadderY = getLadderY;
exports.canUseLadder = canUseLadder;
exports.createFloorState = createFloorState;
exports.getFloorNumber = getFloorNumber;
exports.advanceFloor = advanceFloor;
exports.scaleEnemyHP = scaleEnemyHP;
exports.scaleEnemyAttack = scaleEnemyAttack;
exports.setPlayerXP = setPlayerXP;
exports.gainXP = gainXP;
exports.getPlayerXP = getPlayerXP;
exports.shouldLevelUp = shouldLevelUp;
exports.levelUpPlayer = levelUpPlayer;
/**
 * Create ladder at position
 */
function createLadder(x, y) {
    return { x, y };
}
/**
 * Get ladder X position
 */
function getLadderX(ladder) {
    return ladder.x;
}
/**
 * Get ladder Y position
 */
function getLadderY(ladder) {
    return ladder.y;
}
/**
 * Check if player can use ladder
 */
function canUseLadder(player, ladder) {
    return player.x === ladder.x && player.y === ladder.y;
}
/**
 * Create floor state
 */
function createFloorState(floor) {
    return { floor };
}
/**
 * Get current floor number
 */
function getFloorNumber(state) {
    return state.floor;
}
/**
 * Advance to next floor
 */
function advanceFloor(state) {
    return { floor: state.floor + 1 };
}
/**
 * Scale enemy HP by floor (10% increase per floor)
 */
function scaleEnemyHP(baseHP, floor) {
    return Math.floor(baseHP * (1 + (floor - 1) * 0.1));
}
/**
 * Scale enemy attack by floor (10% increase per floor)
 */
function scaleEnemyAttack(baseAttack, floor) {
    return Math.floor(baseAttack * (1 + (floor - 1) * 0.1));
}
/**
 * Set player XP
 */
function setPlayerXP(player, xp) {
    const baseId = player.id.replace(/_xp\d+/, "");
    return { ...player, id: `${baseId}_xp${xp}` }; // Store XP in id for now
}
/**
 * Gain XP
 */
function gainXP(player, amount) {
    const currentXP = getPlayerXP(player);
    return setPlayerXP(player, currentXP + amount);
}
/**
 * Get player XP (parsed from ID)
 */
function getPlayerXP(player) {
    const match = player.id.match(/_xp(\d+)/);
    return match ? parseInt(match[1]) : 0;
}
/**
 * Check if should level up (100 XP threshold)
 */
function shouldLevelUp(xp) {
    return xp >= 100;
}
/**
 * Level up player (+3 ATK, +10 max HP, heal to full)
 */
function levelUpPlayer(player) {
    return {
        ...player,
        attack: player.attack + 3,
        maxHP: player.maxHP + 10,
        hp: player.maxHP + 10, // Heal to new max
    };
}
// CommonJS exports
module.exports = {
    createLadder,
    getLadderX,
    getLadderY,
    canUseLadder,
    createFloorState,
    getFloorNumber,
    advanceFloor,
    scaleEnemyHP,
    scaleEnemyAttack,
    setPlayerXP,
    gainXP,
    getPlayerXP,
    shouldLevelUp,
    levelUpPlayer,
};
