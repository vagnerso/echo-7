import type { Region, TileType } from '@/world/region';

const TILE_SIZE = 64;
const COLS = 20;
const ROWS = 15;

function buildLandingZoneTiles(): TileType[][] {
  const tiles: TileType[][] = [];

  for (let row = 0; row < ROWS; row += 1) {
    const line: TileType[] = [];
    for (let col = 0; col < COLS; col += 1) {
      const isBorder =
        row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;
      line.push(isBorder ? 'wall' : 'floor');
    }
    tiles.push(line);
  }

  // Obstaculo interno simples (placeholder de estrutura), ate a Fase 8
  // trazer objetos narrativos de verdade para a Landing Zone.
  for (let row = 4; row <= 8; row += 1) {
    tiles[row][12] = 'wall';
    tiles[row][13] = 'wall';
  }

  return tiles;
}

export const LANDING_ZONE: Region = {
  id: 'region-1',
  name: 'Landing Zone',
  tileSize: TILE_SIZE,
  tiles: buildLandingZoneTiles(),
  objects: [
    {
      id: 'decoration-01',
      kind: 'decoration',
      position: { x: 5 * TILE_SIZE, y: 5 * TILE_SIZE },
    },
    {
      id: 'decoration-02',
      kind: 'decoration',
      position: { x: 16 * TILE_SIZE, y: 10 * TILE_SIZE },
    },
    {
      id: 'console-01',
      kind: 'interactable',
      position: { x: 8 * TILE_SIZE, y: 10 * TILE_SIZE },
    },
  ],
};
