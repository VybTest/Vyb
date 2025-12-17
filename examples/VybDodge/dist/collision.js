"use strict";
// Collision detection for Space Dodge
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCollision = checkCollision;
exports.entityCollision = entityCollision;
exports.createAsteroid = createAsteroid;
exports.moveAsteroid = moveAsteroid;
exports.isOffScreen = isOffScreen;
function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    // FIXED: >= means edge-touching counts as collision
    return (x1 < x2 + w2 &&
        x1 + w1 >= x2 &&
        y1 < y2 + h2 &&
        y1 + h1 >= y2);
}
function entityCollision(a, b) {
    return checkCollision(a.x, a.y, a.width, a.height, b.x, b.y, b.width, b.height);
}
function createAsteroid(x, y) {
    return {
        x,
        y,
        width: 30,
        height: 30,
        speed: 200
    };
}
function moveAsteroid(asteroid, dt) {
    return {
        ...asteroid,
        y: asteroid.y + (asteroid.speed * dt)
    };
}
function isOffScreen(asteroid, screenHeight) {
    return asteroid.y > screenHeight;
}
