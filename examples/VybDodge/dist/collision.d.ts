export interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare function checkCollision(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean;
export declare function entityCollision(a: Entity, b: Entity): boolean;
export interface Asteroid {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}
export declare function createAsteroid(x: number, y: number): Asteroid;
export declare function moveAsteroid(asteroid: Asteroid, dt: number): Asteroid;
export declare function isOffScreen(asteroid: Asteroid, screenHeight: number): boolean;
