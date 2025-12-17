"use strict";
// Game state management for Space Dodge
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = createGame;
exports.addScore = addScore;
exports.loseLife = loseLife;
function createGame(width, height) {
    return {
        score: 0,
        lives: 3,
        gameOver: false,
        width,
        height
    };
}
function addScore(game, points) {
    return {
        ...game,
        score: game.score + points
    };
}
function loseLife(game) {
    const newLives = game.lives - 1;
    return {
        ...game,
        lives: newLives,
        gameOver: newLives <= 0
    };
}
