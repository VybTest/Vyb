// Collision detection for Space Dodge

import { Player } from './player';

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkCollision(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number
): boolean {
  // FIXED: >= means edge-touching counts as collision
  return (
    x1 < x2 + w2 &&
    x1 + w1 >= x2 &&
    y1 < y2 + h2 &&
    y1 + h1 >= y2
  );
}

export function entityCollision(a: Entity, b: Entity): boolean {
  return checkCollision(
    a.x, a.y, a.width, a.height,
    b.x, b.y, b.width, b.height
  );
}

export interface Asteroid {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export function createAsteroid(x: number, y: number): Asteroid {
  return {
    x,
    y,
    width: 30,
    height: 30,
    speed: 200
  };
}

export function moveAsteroid(asteroid: Asteroid, dt: number): Asteroid {
  return {
    ...asteroid,
    y: asteroid.y + (asteroid.speed * dt)
  };
}

export function isOffScreen(asteroid: Asteroid, screenHeight: number): boolean {
  return asteroid.y > screenHeight;
}
