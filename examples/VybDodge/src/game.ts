// Game state management for Space Dodge

export interface GameState {
  score: number;
  lives: number;
  gameOver: boolean;
  width: number;
  height: number;
}

export function createGame(width: number, height: number): GameState {
  return {
    score: 0,
    lives: 3,
    gameOver: false,
    width,
    height
  };
}

export function addScore(game: GameState, points: number): GameState {
  return {
    ...game,
    score: game.score + points
  };
}

export function loseLife(game: GameState): GameState {
  const newLives = game.lives - 1;
  return {
    ...game,
    lives: newLives,
    gameOver: newLives <= 0
  };
}
