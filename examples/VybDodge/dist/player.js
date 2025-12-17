"use strict";
// Player module for Space Dodge
// Implements player creation and movement
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayer = createPlayer;
exports.movePlayer = movePlayer;
exports.clampToScreen = clampToScreen;
function createPlayer(x, y) {
    return {
        x,
        y,
        width: 40,
        height: 40,
        speed: 300
    };
}
function movePlayer(player, direction, dt) {
    return {
        ...player,
        x: player.x + (direction * player.speed * dt)
    };
}
function clampToScreen(player, screenWidth) {
    const minX = 0;
    const maxX = screenWidth - player.width;
    return {
        ...player,
        x: Math.max(minX, Math.min(maxX, player.x))
    };
}
