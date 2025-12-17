export interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}
export declare function createPlayer(x: number, y: number): Player;
export declare function movePlayer(player: Player, direction: number, dt: number): Player;
export declare function clampToScreen(player: Player, screenWidth: number): Player;
