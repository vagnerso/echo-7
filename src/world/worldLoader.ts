import type { AABB } from '@/systems/collisionSystem';

import type { Region } from './region';

/** Converte cada tile 'wall' da regiao num AABB de colisao. */
export function getRegionObstacles(region: Region): AABB[] {
  const obstacles: AABB[] = [];

  region.tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile === 'wall') {
        obstacles.push({
          x: colIndex * region.tileSize,
          y: rowIndex * region.tileSize,
          width: region.tileSize,
          height: region.tileSize,
        });
      }
    });
  });

  return obstacles;
}

export function getRegionSize(region: Region): {
  width: number;
  height: number;
} {
  const rows = region.tiles.length;
  const cols = rows > 0 ? region.tiles[0].length : 0;

  return {
    width: cols * region.tileSize,
    height: rows * region.tileSize,
  };
}
