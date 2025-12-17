// Player module for Space Dodge
// Implements player creation and movement

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export function createPlayer(x: number, y: number): Player {
  return {
    x,
    y,
    width: 40,
    height: 40,
    speed: 300
  };
}

export function movePlayer(player: Player, direction: number, dt: number): Player {
  return {
    ...player,
    x: player.x + (direction * player.speed * dt)
  };
}

export function clampToScreen(player: Player, screenWidth: number): Player {
  const minX = 0;
  const maxX = screenWidth - player.width;
  return {
    ...player,
    x: Math.max(minX, Math.min(maxX, player.x))
  };
}
