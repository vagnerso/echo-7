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

  // Alcova magnetica (Fase 6): area de 2x2 (linhas 10-11, colunas 16-17)
  // selada por paredes, com uma unica entrada em hazard (linha10, col15) -
  // so atravessavel com o upgrade Magnetic Boots. decoration-02 fica dentro,
  // como prova de que a area foi alcancada.
  tiles[9][16] = 'wall';
  tiles[9][17] = 'wall';
  tiles[12][16] = 'wall';
  tiles[12][17] = 'wall';
  tiles[11][15] = 'wall';
  tiles[10][18] = 'wall';
  tiles[11][18] = 'wall';
  tiles[10][15] = 'hazard';

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
      position: { x: 5 * TILE_SIZE, y: 5 * TILE_SIZE },
    },
    {
      id: 'decoration-02',
      position: { x: 16 * TILE_SIZE, y: 10 * TILE_SIZE },
    },
    {
      id: 'console-01',
      interactable: true,
      position: { x: 8 * TILE_SIZE, y: 10 * TILE_SIZE },
    },
    {
      id: 'unknown-structure-01',
      scannable: true,
      position: { x: 10 * TILE_SIZE, y: 2 * TILE_SIZE },
      scanInfo: {
        label: 'UNKNOWN STRUCTURE',
        age: '~8,000 years',
        material: 'UNKNOWN',
      },
    },
    {
      id: 'energy-cell-pickup-01',
      interactable: true,
      position: { x: 3 * TILE_SIZE, y: 10 * TILE_SIZE },
      collectible: {
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
        quantity: 1,
      },
    },
    {
      id: 'energy-cell-pickup-02',
      interactable: true,
      position: { x: 17 * TILE_SIZE, y: 3 * TILE_SIZE },
      collectible: {
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
        quantity: 1,
      },
    },
    {
      id: 'ancient-component-pickup-01',
      interactable: true,
      position: { x: 14 * TILE_SIZE, y: 10 * TILE_SIZE },
      collectible: {
        id: 'ancient-component',
        type: 'component',
        name: 'Ancient Component',
        stackable: true,
        quantity: 1,
      },
    },
    {
      id: 'ancient-component-pickup-02',
      interactable: true,
      position: { x: 6 * TILE_SIZE, y: 3 * TILE_SIZE },
      collectible: {
        id: 'ancient-component',
        type: 'component',
        name: 'Ancient Component',
        stackable: true,
        quantity: 1,
      },
    },
    {
      id: 'hidden-signal-01',
      scannable: true,
      position: { x: 4 * TILE_SIZE, y: 6 * TILE_SIZE },
      scanInfo: {
        label: 'HIDDEN SIGNAL SOURCE',
        material: 'UNKNOWN',
        requiresDeepScanner: true,
      },
    },
    {
      id: 'exit-to-ancient-ruins',
      interactable: true,
      position: { x: 18 * TILE_SIZE, y: 12 * TILE_SIZE },
      exit: {
        toRegionId: 'region-2',
        spawnPosition: { x: 2 * TILE_SIZE, y: 7 * TILE_SIZE },
      },
    },
  ],
};

const RUINS_TILE_SIZE = 64;
const RUINS_COLS = 14;
const RUINS_ROWS = 10;

function buildAncientRuinsTiles(): TileType[][] {
  const tiles: TileType[][] = [];

  for (let row = 0; row < RUINS_ROWS; row += 1) {
    const line: TileType[] = [];
    for (let col = 0; col < RUINS_COLS; col += 1) {
      const isBorder =
        row === 0 ||
        row === RUINS_ROWS - 1 ||
        col === 0 ||
        col === RUINS_COLS - 1;
      line.push(isBorder ? 'wall' : 'floor');
    }
    tiles.push(line);
  }

  // Nicho selado (Fase 7): uma unica celula (col12,row6), encostada na
  // parede da borda, acessivel so pela entrada em 'sealed' (col11,row6) -
  // que so deixa de bloquear quando ruins-puzzle-01 e resolvido.
  tiles[5][12] = 'wall';
  tiles[7][12] = 'wall';
  tiles[6][11] = 'sealed';

  return tiles;
}

export const ANCIENT_RUINS: Region = {
  id: 'region-2',
  name: 'Ancient Ruins',
  tileSize: RUINS_TILE_SIZE,
  tiles: buildAncientRuinsTiles(),
  objects: [
    {
      id: 'exit-to-landing-zone',
      interactable: true,
      position: { x: 2 * RUINS_TILE_SIZE, y: 7 * RUINS_TILE_SIZE },
      exit: {
        toRegionId: 'region-1',
        // Ponto aberto, longe da alcova magnetica (cols15-18) - spawnar ali
        // sem o upgrade Magnetic Boots deixaria o jogador preso sem saida.
        spawnPosition: { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE },
      },
    },
    {
      id: 'ruins-switch-a',
      interactable: true,
      position: { x: 3 * RUINS_TILE_SIZE, y: 2 * RUINS_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'ruins-puzzle-01', switchId: 'switch-a' },
    },
    {
      id: 'ruins-switch-b',
      interactable: true,
      position: { x: 10 * RUINS_TILE_SIZE, y: 2 * RUINS_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'ruins-puzzle-01', switchId: 'switch-b' },
    },
    {
      id: 'ruins-switch-c',
      interactable: true,
      position: { x: 6 * RUINS_TILE_SIZE, y: 7 * RUINS_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'ruins-puzzle-01', switchId: 'switch-c' },
    },
    {
      id: 'ruins-archive',
      scannable: true,
      requiresPuzzleSolved: 'ruins-puzzle-01',
      position: { x: 12 * RUINS_TILE_SIZE, y: 6 * RUINS_TILE_SIZE },
      scanInfo: {
        label: 'SEALED ARCHIVE',
        age: '~8,000 years',
        material: 'UNKNOWN',
      },
    },
  ],
};

export const REGIONS: Record<string, Region> = {
  [LANDING_ZONE.id]: LANDING_ZONE,
  [ANCIENT_RUINS.id]: ANCIENT_RUINS,
};
