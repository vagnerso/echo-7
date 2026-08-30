import type { Region, TileType } from '@/world/region';

const TILE_SIZE = 64;
const COLS = 20;
const ROWS = 15;

const RUINS_TILE_SIZE = 64;

// Declarado aqui (nao junto com SIGNAL_COLS/SIGNAL_ROWS, mais abaixo) porque
// a saida da Ancient Ruins para o Signal Core precisa dele antes da regiao
// Signal Core em si ser definida.
const SIGNAL_TILE_SIZE = 64;

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
    {
      id: 'fragment-pickup-01',
      interactable: true,
      position: { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE },
      memoryFragment: 'fragment-01',
    },
    {
      id: 'fragment-pickup-02',
      interactable: true,
      position: { x: 15 * TILE_SIZE, y: 5 * TILE_SIZE },
      memoryFragment: 'fragment-02',
    },
  ],
};

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
    {
      id: 'fragment-pickup-03',
      interactable: true,
      position: { x: 3 * RUINS_TILE_SIZE, y: 5 * RUINS_TILE_SIZE },
      memoryFragment: 'fragment-03',
    },
    {
      id: 'fragment-pickup-04',
      interactable: true,
      position: { x: 10 * RUINS_TILE_SIZE, y: 7 * RUINS_TILE_SIZE },
      memoryFragment: 'fragment-04',
    },
    {
      id: 'exit-to-signal-core',
      interactable: true,
      position: { x: 11 * RUINS_TILE_SIZE, y: 7 * RUINS_TILE_SIZE },
      exit: {
        toRegionId: 'region-3',
        spawnPosition: { x: 5 * SIGNAL_TILE_SIZE, y: 8 * SIGNAL_TILE_SIZE },
      },
    },
  ],
};

const SIGNAL_COLS = 12;
const SIGNAL_ROWS = 10;

function buildSignalCoreTiles(): TileType[][] {
  const tiles: TileType[][] = [];

  for (let row = 0; row < SIGNAL_ROWS; row += 1) {
    const line: TileType[] = [];
    for (let col = 0; col < SIGNAL_COLS; col += 1) {
      const isBorder =
        row === 0 ||
        row === SIGNAL_ROWS - 1 ||
        col === 0 ||
        col === SIGNAL_COLS - 1;
      line.push(isBorder ? 'wall' : 'floor');
    }
    tiles.push(line);
  }

  return tiles;
}

export const SIGNAL_CORE: Region = {
  id: 'region-3',
  name: 'Signal Core',
  tileSize: SIGNAL_TILE_SIZE,
  tiles: buildSignalCoreTiles(),
  objects: [
    {
      id: 'exit-to-ancient-ruins-from-core',
      interactable: true,
      position: { x: 5 * SIGNAL_TILE_SIZE, y: 8 * SIGNAL_TILE_SIZE },
      exit: {
        toRegionId: 'region-2',
        // Aberto, longe do nicho selado (col11-12) e dos switches.
        spawnPosition: { x: 7 * RUINS_TILE_SIZE, y: 7 * RUINS_TILE_SIZE },
      },
    },
    {
      id: 'core-node-1',
      interactable: true,
      position: { x: 2 * SIGNAL_TILE_SIZE, y: 2 * SIGNAL_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'signal-core-puzzle', switchId: 'node-1' },
    },
    {
      id: 'core-node-2',
      interactable: true,
      position: { x: 9 * SIGNAL_TILE_SIZE, y: 2 * SIGNAL_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'signal-core-puzzle', switchId: 'node-2' },
    },
    {
      id: 'core-node-3',
      interactable: true,
      position: { x: 2 * SIGNAL_TILE_SIZE, y: 7 * SIGNAL_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'signal-core-puzzle', switchId: 'node-3' },
    },
    {
      id: 'core-node-4',
      interactable: true,
      position: { x: 9 * SIGNAL_TILE_SIZE, y: 7 * SIGNAL_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'signal-core-puzzle', switchId: 'node-4' },
    },
    {
      id: 'fragment-pickup-05',
      interactable: true,
      position: { x: 3 * SIGNAL_TILE_SIZE, y: 5 * SIGNAL_TILE_SIZE },
      memoryFragment: 'fragment-05',
    },
    {
      id: 'fragment-pickup-06',
      interactable: true,
      position: { x: 8 * SIGNAL_TILE_SIZE, y: 5 * SIGNAL_TILE_SIZE },
      memoryFragment: 'fragment-06',
    },
    {
      id: 'signal-core',
      interactable: true,
      requiresPuzzleSolved: 'signal-core-puzzle',
      triggersEnding: true,
      position: { x: 5 * SIGNAL_TILE_SIZE, y: 4 * SIGNAL_TILE_SIZE },
    },
  ],
};

export const REGIONS: Record<string, Region> = {
  [LANDING_ZONE.id]: LANDING_ZONE,
  [ANCIENT_RUINS.id]: ANCIENT_RUINS,
  [SIGNAL_CORE.id]: SIGNAL_CORE,
};
