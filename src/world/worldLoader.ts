import type { AABB } from '@/systems/collisionSystem';

import type { Region, TileType } from './region';

/** Converte cada tile do tipo informado num AABB de colisao. */
export function getObstaclesForTileType(
  region: Region,
  tileType: TileType,
): AABB[] {
  const obstacles: AABB[] = [];

  region.tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile === tileType) {
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

export function getRegionObstacles(region: Region): AABB[] {
  return getObstaclesForTileType(region, 'wall');
}

/** Tiles 'hazard': so bloqueiam quem nao tiver o upgrade Magnetic Boots (ver Fase 6 em docs/DECISIONS.md). */
export function getHazardTiles(region: Region): AABB[] {
  return getObstaclesForTileType(region, 'hazard');
}

/** Tiles 'sealed': so bloqueiam enquanto o puzzle correspondente nao for resolvido (Fase 7). */
export function getSealedTiles(region: Region): AABB[] {
  return getObstaclesForTileType(region, 'sealed');
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
