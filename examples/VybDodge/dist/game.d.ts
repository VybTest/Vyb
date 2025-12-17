export interface GameState {
    score: number;
    lives: number;
    gameOver: boolean;
    width: number;
    height: number;
}
export declare function createGame(width: number, height: number): GameState;
export declare function addScore(game: GameState, points: number): GameState;
export declare function loseLife(game: GameState): GameState;
