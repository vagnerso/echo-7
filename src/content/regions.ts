import {
  BURIED_CHORD_PUZZLE_ID,
  THOUSAND_SPIRES_PUZZLE_ID,
} from '@/content/puzzles';
import type { Region, TileType } from '@/world/region';

const TILE_SIZE = 64;
const COLS = 20;
const ROWS = 15;

const RUINS_TILE_SIZE = 64;

// Declarado aqui (nao junto com SIGNAL_COLS/SIGNAL_ROWS, mais abaixo) porque
// a saida da Ancient Ruins para o Signal Core precisa dele antes da regiao
// Signal Core em si ser definida.
const SIGNAL_TILE_SIZE = 64;

// Mesmo motivo: a entrada oculta na Landing Zone (buried-cache-entrance)
// precisa disso antes da regiao Buried Cache (region-4) ser definida.
const CACHE_TILE_SIZE = 64;

// Mesmo motivo, para a entrada oculta em Thousand Spires
// (buried-chord-entrance) e The Buried Chord (region-6).
const CHORD_TILE_SIZE = 64;

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
  // como prova de que a area foi alcancada, e e tambem onde mora
  // exit-to-ancient-ruins: a saida da Landing Zone so existe do lado de
  // dentro da alcova de proposito, para o jogador precisar coletar um
  // ancient-component e instalar Magnetic Boots antes de poder avancar para
  // a Ancient Ruins (ver objects abaixo e docs/DECISIONS.md).
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
    // Destroços da capsula/nave do ECHO-7 (PROMPT MESTRE pedia isso na
    // Landing Zone desde o inicio, mas nunca tinha ganhado objeto/visual
    // proprio) - espalhados perto do spawn (INITIAL_SPAWN em GameCanvas.tsx
    // e ~col3/row3), como se a capsula tivesse se partido no impacto.
    {
      id: 'wreckage-01',
      decorationKind: 'wreckage',
      position: { x: 3 * TILE_SIZE, y: 1 * TILE_SIZE },
    },
    {
      id: 'wreckage-02',
      decorationKind: 'wreckage',
      position: { x: 4 * TILE_SIZE, y: 3 * TILE_SIZE },
    },
    {
      id: 'wreckage-03',
      decorationKind: 'wreckage',
      position: { x: 2 * TILE_SIZE, y: 4 * TILE_SIZE },
    },
    {
      // Antes so alternava de cor ao interagir, sem nenhum efeito - achado
      // pelo desenvolvedor como um objeto de conteudo esquecido (provavelmente
      // da Fase 3, quando o sistema de interacao foi criado). memoryFragment
      // da o proposito de lore que faltava: o console da "pequena base" da
      // Landing Zone (prevista no PROMPT MESTRE) reproduz um log da propria
      // base, nao um pickup flutuante - ver fragment-13/docs/DECISIONS.md.
      id: 'console-01',
      interactable: true,
      position: { x: 8 * TILE_SIZE, y: 10 * TILE_SIZE },
      memoryFragment: 'fragment-13',
    },
    {
      id: 'unknown-structure-01',
      scannable: true,
      position: { x: 10 * TILE_SIZE, y: 2 * TILE_SIZE },
    },
    {
      id: 'energy-cell-pickup-01',
      interactable: true,
      position: { x: 3 * TILE_SIZE, y: 10 * TILE_SIZE },
      collectible: {
        id: 'energy-cell',
        type: 'resource',
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
        stackable: true,
        quantity: 1,
      },
    },
    {
      id: 'hidden-signal-01',
      scannable: true,
      requiresDeepScanner: true,
      position: { x: 4 * TILE_SIZE, y: 6 * TILE_SIZE },
    },
    {
      // Entrada da area opcional (Buried Cache, region-4) - so aparece no
      // scanner e so responde a interacao com o Deep Scanner instalado
      // (requiresDeepScanner gateia os dois, ver systems/interactionSystem.ts
      // e systems/scannerSystem.ts). Sem isso o jogador podia tropecar na
      // entrada e entrar sem nunca ter escaneado nada.
      id: 'buried-cache-entrance',
      scannable: true,
      interactable: true,
      requiresDeepScanner: true,
      position: { x: 7 * TILE_SIZE, y: 13 * TILE_SIZE },
      exit: {
        toRegionId: 'region-4',
        spawnPosition: { x: 4 * CACHE_TILE_SIZE, y: 6 * CACHE_TILE_SIZE },
      },
    },
    {
      id: 'exit-to-ancient-ruins',
      interactable: true,
      // Dentro da alcova magnetica (linha 11, coluna 17 - interior e
      // linhas10-11/colunas16-17, decoration-02 ocupa o canto 16,10), nao em
      // piso aberto: e o gate proposital que exige Magnetic Boots (hazard em
      // 10,15) antes do jogador poder sair da Landing Zone. +TILE_SIZE/2 nos
      // dois eixos centraliza o icone na propria tile (em vez do canto),
      // senao ele vaza visualmente para as paredes vizinhas da alcova.
      position: {
        x: 17 * TILE_SIZE + TILE_SIZE / 2,
        y: 11 * TILE_SIZE + TILE_SIZE / 2,
      },
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

  // Nicho selado (Fase 7): duas celulas empilhadas (col12, linhas 6-7),
  // encostadas na parede da borda, acessiveis so pela entrada em 'sealed'
  // (col11,row6) - que so deixa de bloquear quando ruins-puzzle-01 e
  // resolvido. Bug real corrigido: a versao original tinha so uma celula
  // (row6) e exit-to-signal-core morava fora dela, em col11/row7 - uma tile
  // aberta, sem parede nenhuma lacrando aquele lado, entao dava pra alcancar
  // a porta para o Signal Core sem nunca cruzar o 'sealed' nem resolver o
  // puzzle. Agora ruins-archive (row6) e exit-to-signal-core (row7) ficam os
  // dois dentro do nicho, e col11/row7 vira parede para fechar esse lado.
  tiles[5][12] = 'wall';
  tiles[8][12] = 'wall';
  tiles[6][11] = 'sealed';
  tiles[7][11] = 'wall';

  return tiles;
}

export const ANCIENT_RUINS: Region = {
  id: 'region-2',
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
      requiresPuzzleSolved: 'ruins-puzzle-01',
      // Dentro do nicho selado (col12,row7 - ver buildAncientRuinsTiles),
      // nao mais em piso aberto. +RUINS_TILE_SIZE/2 nos dois eixos centraliza
      // o icone na propria tile, evitando o mesmo bug de clipping visual ja
      // corrigido antes na porta da Landing Zone (ver docs/DECISIONS.md).
      position: {
        x: 12 * RUINS_TILE_SIZE + RUINS_TILE_SIZE / 2,
        y: 7 * RUINS_TILE_SIZE + RUINS_TILE_SIZE / 2,
      },
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

// 10x10 (nao mais 8x8): o desenvolvedor achou a sala pequena demais para o
// que ela conta na narrativa (o acampamento secreto de escavacao do Kade) -
// interior passa de 6x6 para 8x8 tiles, dando espaco para o acampamento
// (escoramento, lanterna, terra revolvida) sem apertar os switches/fragmentos
// existentes.
const CACHE_COLS = 10;
const CACHE_ROWS = 10;

function buildBuriedCacheTiles(): TileType[][] {
  const tiles: TileType[][] = [];

  for (let row = 0; row < CACHE_ROWS; row += 1) {
    const line: TileType[] = [];
    for (let col = 0; col < CACHE_COLS; col += 1) {
      const isBorder =
        row === 0 ||
        row === CACHE_ROWS - 1 ||
        col === 0 ||
        col === CACHE_COLS - 1;
      line.push(isBorder ? 'wall' : 'floor');
    }
    tiles.push(line);
  }

  return tiles;
}

// Area opcional/secreta (v2.0): um deposito subterraneo da expedicao humana
// anterior, so alcancavel via buried-cache-entrance (Landing Zone), que exige
// o Deep Scanner. Nao faz parte do arco principal - nao muda o objetivo da
// missao (sem chamada a setObjective em GameCanvas.tsx para 'region-4') nem
// usa o tile 'sealed' (fixado a ruins-puzzle-01 desde a Fase 7) - o gate do
// premio fica so no objeto (requiresPuzzleSolved), mesmo padrao do Signal
// Core. Ver docs/DECISIONS.md.
export const BURIED_CACHE: Region = {
  id: 'region-4',
  tileSize: CACHE_TILE_SIZE,
  tiles: buildBuriedCacheTiles(),
  objects: [
    {
      id: 'exit-to-landing-zone-from-cache',
      interactable: true,
      position: { x: 5 * CACHE_TILE_SIZE, y: 7 * CACHE_TILE_SIZE },
      exit: {
        toRegionId: 'region-1',
        spawnPosition: { x: 7 * TILE_SIZE, y: 13 * TILE_SIZE },
      },
    },
    {
      id: 'buried-cache-switch-a',
      interactable: true,
      position: { x: 2 * CACHE_TILE_SIZE, y: 2 * CACHE_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'buried-cache-puzzle', switchId: 'switch-a' },
    },
    {
      id: 'buried-cache-switch-b',
      interactable: true,
      position: { x: 7 * CACHE_TILE_SIZE, y: 2 * CACHE_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'buried-cache-puzzle', switchId: 'switch-b' },
    },
    {
      id: 'buried-cache-switch-c',
      interactable: true,
      position: { x: 5 * CACHE_TILE_SIZE, y: 4 * CACHE_TILE_SIZE },
      puzzleSwitch: { puzzleId: 'buried-cache-puzzle', switchId: 'switch-c' },
    },
    {
      id: 'fragment-pickup-07',
      interactable: true,
      requiresPuzzleSolved: 'buried-cache-puzzle',
      position: { x: 1 * CACHE_TILE_SIZE, y: 6 * CACHE_TILE_SIZE },
      memoryFragment: 'fragment-07',
    },
    {
      id: 'fragment-pickup-08',
      interactable: true,
      requiresPuzzleSolved: 'buried-cache-puzzle',
      position: { x: 8 * CACHE_TILE_SIZE, y: 6 * CACHE_TILE_SIZE },
      memoryFragment: 'fragment-08',
    },
    // Acampamento de escavacao do Kade (decoracao, ver fragment-07/08): o
    // escoramento de madeira e a lanterna sugerem uma escavacao improvisada,
    // as pressas; a terra revolvida fica encostada no fragmento-08, o ponto
    // onde ele "enterrou o drive sob a crista leste".
    {
      id: 'cache-beam-01',
      decorationKind: 'campBeam',
      position: { x: 2 * CACHE_TILE_SIZE, y: 7 * CACHE_TILE_SIZE },
    },
    {
      id: 'cache-beam-02',
      decorationKind: 'campBeam',
      position: { x: 7 * CACHE_TILE_SIZE, y: 7 * CACHE_TILE_SIZE },
    },
    {
      id: 'cache-lantern-01',
      decorationKind: 'campLantern',
      position: { x: 5 * CACHE_TILE_SIZE, y: 3 * CACHE_TILE_SIZE },
    },
    {
      id: 'cache-dug-earth-01',
      decorationKind: 'dugEarth',
      position: { x: 7 * CACHE_TILE_SIZE, y: 6 * CACHE_TILE_SIZE },
    },
  ],
};

const SPIRES_COLS = 16;
const SPIRES_ROWS = 12;
const SPIRES_TILE_SIZE = 64;

function buildThousandSpiresTiles(): TileType[][] {
  const tiles: TileType[][] = [];

  for (let row = 0; row < SPIRES_ROWS; row += 1) {
    const line: TileType[] = [];
    for (let col = 0; col < SPIRES_COLS; col += 1) {
      const isBorder =
        row === 0 ||
        row === SPIRES_ROWS - 1 ||
        col === 0 ||
        col === SPIRES_COLS - 1;
      line.push(isBorder ? 'wall' : 'floor');
    }
    tiles.push(line);
  }

  return tiles;
}

// v3.0 (ver docs/DECISIONS.md) - epilogo pos-final, alcancado pelo link
// "continuar explorando" da EndingScreen (App.tsx), nunca por um exit de
// outra regiao - e a primeira porta de entrada do epilogo. As 5 torres
// reaproveitam o puzzle 'sequence' de sempre (THOUSAND_SPIRES_PUZZLE,
// content/puzzles.ts), com um no a mais que o costume porque cada torre
// toca uma nota (ver playSpireToneSound em engine/audio.ts) - 5 nos = 5
// notas da escala. A entrada de The Buried Chord (Fase C) fica aqui dentro,
// no mesmo padrao da buried-cache-entrance (Landing Zone): scannable +
// interactable + requiresDeepScanner + exit, tudo no mesmo objeto.
export const THOUSAND_SPIRES: Region = {
  id: 'region-5',
  tileSize: SPIRES_TILE_SIZE,
  tiles: buildThousandSpiresTiles(),
  objects: [
    {
      id: 'spire-node-1',
      interactable: true,
      visualKind: 'spire',
      position: { x: 8 * SPIRES_TILE_SIZE, y: 2 * SPIRES_TILE_SIZE },
      puzzleSwitch: { puzzleId: THOUSAND_SPIRES_PUZZLE_ID, switchId: 'node-1' },
    },
    {
      id: 'spire-node-2',
      interactable: true,
      visualKind: 'spire',
      position: { x: 13 * SPIRES_TILE_SIZE, y: 5 * SPIRES_TILE_SIZE },
      puzzleSwitch: { puzzleId: THOUSAND_SPIRES_PUZZLE_ID, switchId: 'node-2' },
    },
    {
      id: 'spire-node-3',
      interactable: true,
      visualKind: 'spire',
      position: { x: 11 * SPIRES_TILE_SIZE, y: 9 * SPIRES_TILE_SIZE },
      puzzleSwitch: { puzzleId: THOUSAND_SPIRES_PUZZLE_ID, switchId: 'node-3' },
    },
    {
      id: 'spire-node-4',
      interactable: true,
      visualKind: 'spire',
      position: { x: 5 * SPIRES_TILE_SIZE, y: 9 * SPIRES_TILE_SIZE },
      puzzleSwitch: { puzzleId: THOUSAND_SPIRES_PUZZLE_ID, switchId: 'node-4' },
    },
    {
      id: 'spire-node-5',
      interactable: true,
      visualKind: 'spire',
      position: { x: 3 * SPIRES_TILE_SIZE, y: 5 * SPIRES_TILE_SIZE },
      puzzleSwitch: { puzzleId: THOUSAND_SPIRES_PUZZLE_ID, switchId: 'node-5' },
    },
    {
      id: 'fragment-pickup-09',
      interactable: true,
      position: { x: 8 * SPIRES_TILE_SIZE, y: 6 * SPIRES_TILE_SIZE },
      memoryFragment: 'fragment-09',
    },
    {
      id: 'fragment-pickup-10',
      interactable: true,
      position: { x: 13 * SPIRES_TILE_SIZE, y: 9 * SPIRES_TILE_SIZE },
      memoryFragment: 'fragment-10',
    },
    // Torres caidas (decoracao, sem nenhuma flag de comportamento) - o campo
    // se chama "Thousand Spires", mas so 5 torres ainda respondem (os
    // puzzleSwitch acima); estas reforcam que o campo continua muito alem
    // das 5 que importam para o puzzle, a maioria delas ja em ruina.
    {
      id: 'broken-spire-01',
      decorationKind: 'brokenSpire',
      position: { x: 2 * SPIRES_TILE_SIZE, y: 2 * SPIRES_TILE_SIZE },
    },
    {
      id: 'broken-spire-02',
      decorationKind: 'brokenSpire',
      position: { x: 14 * SPIRES_TILE_SIZE, y: 3 * SPIRES_TILE_SIZE },
    },
    {
      id: 'broken-spire-03',
      decorationKind: 'brokenSpire',
      position: { x: 6 * SPIRES_TILE_SIZE, y: 4 * SPIRES_TILE_SIZE },
    },
    {
      id: 'broken-spire-04',
      decorationKind: 'brokenSpire',
      position: { x: 12 * SPIRES_TILE_SIZE, y: 7 * SPIRES_TILE_SIZE },
    },
    {
      // requiresPuzzleSolved (alem do requiresDeepScanner) e o proposito: a
      // porta fica visivel (escaneavel) mas apagada/inerte (renderInteractables
      // desenha a 35% de opacidade, mesmo tratamento de fragmentPickup em
      // requiresPuzzleSolved) ate as 5 torres serem resolvidas na ordem certa
      // - resolver o puzzle e o que faz essa porta "acender" e responder a E.
      id: 'buried-chord-entrance',
      scannable: true,
      interactable: true,
      requiresDeepScanner: true,
      requiresPuzzleSolved: THOUSAND_SPIRES_PUZZLE_ID,
      position: { x: 3 * SPIRES_TILE_SIZE, y: 9 * SPIRES_TILE_SIZE },
      exit: {
        toRegionId: 'region-6',
        spawnPosition: { x: 2 * CHORD_TILE_SIZE, y: 6 * CHORD_TILE_SIZE },
      },
    },
  ],
};

const CHORD_COLS = 16;
const CHORD_ROWS = 10;

function buildBuriedChordTiles(): TileType[][] {
  const tiles: TileType[][] = [];

  for (let row = 0; row < CHORD_ROWS; row += 1) {
    const line: TileType[] = [];
    for (let col = 0; col < CHORD_COLS; col += 1) {
      const isBorder =
        row === 0 ||
        row === CHORD_ROWS - 1 ||
        col === 0 ||
        col === CHORD_COLS - 1;
      line.push(isBorder ? 'wall' : 'floor');
    }
    tiles.push(line);
  }

  // Duas divisorias (nao uma) - a entrada (col 1-4), o corredor do meio
  // (col 6-9) e a camara final com o puzzle (col 11-14) so se conectam pelos
  // tiles hazard das colunas 5 e 10, em linhas diferentes uma da outra (o
  // caminho ziguezagueia, nao e uma linha reta) - atravessar as duas exige
  // Magnetic Boots. Sala maior e labirintica de proposito (pedido do
  // desenvolvedor: "sala pequena, poderia ser maior, com uma surpresa/desafio
  // final") - o desafio final de verdade e o puzzle na camara depois da
  // segunda passagem (ver BURIED_CHORD_PUZZLE), que precisa ser resolvido
  // quase as cegas, na escuridao quase total desta regiao (ver
  // GameCanvas.tsx/systems/darknessSystem.ts).
  for (let row = 1; row < CHORD_ROWS - 1; row += 1) {
    tiles[row][5] = row === 4 ? 'hazard' : 'wall';
    tiles[row][10] = row === 6 ? 'hazard' : 'wall';
  }

  return tiles;
}

// v3.0 (ver docs/DECISIONS.md) - area secreta dentro de Thousand Spires, so
// alcancavel via buried-chord-entrance (region-5), que exige o Deep Scanner
// - mesmo padrao da Buried Cache dentro da Landing Zone. Tem puzzle proprio
// (BURIED_CHORD_PUZZLE, camara final) alem da escuridao quase total
// (renderizada em GameCanvas.tsx, logica em systems/darknessSystem.ts) - o
// pulso do scanner (Q) revela um raio maior por um tempo, desvanecendo de
// volta ao raio ambiente minimo, entao resolver o puzzle exige memorizar a
// posicao dos nos entre pulsos. Os dois fragmentos exigem
// BURIED_CHORD_PUZZLE resolvido (o puzzle desta camara, nao mais o de
// Thousand Spires - esse ja precisou ser resolvido so pra entrar aqui).
export const BURIED_CHORD: Region = {
  id: 'region-6',
  tileSize: CHORD_TILE_SIZE,
  tiles: buildBuriedChordTiles(),
  objects: [
    {
      id: 'exit-to-thousand-spires-from-chord',
      interactable: true,
      position: { x: 2 * CHORD_TILE_SIZE, y: 4 * CHORD_TILE_SIZE },
      exit: {
        toRegionId: 'region-5',
        spawnPosition: { x: 3 * SPIRES_TILE_SIZE, y: 10 * SPIRES_TILE_SIZE },
      },
    },
    {
      id: 'chord-node-1',
      interactable: true,
      position: { x: 12 * CHORD_TILE_SIZE, y: 2 * CHORD_TILE_SIZE },
      puzzleSwitch: { puzzleId: BURIED_CHORD_PUZZLE_ID, switchId: 'node-1' },
    },
    {
      id: 'chord-node-2',
      interactable: true,
      position: { x: 14 * CHORD_TILE_SIZE, y: 3 * CHORD_TILE_SIZE },
      puzzleSwitch: { puzzleId: BURIED_CHORD_PUZZLE_ID, switchId: 'node-2' },
    },
    {
      id: 'chord-node-3',
      interactable: true,
      position: { x: 13 * CHORD_TILE_SIZE, y: 6 * CHORD_TILE_SIZE },
      puzzleSwitch: { puzzleId: BURIED_CHORD_PUZZLE_ID, switchId: 'node-3' },
    },
    {
      id: 'chord-node-4',
      interactable: true,
      position: { x: 11 * CHORD_TILE_SIZE, y: 7 * CHORD_TILE_SIZE },
      puzzleSwitch: { puzzleId: BURIED_CHORD_PUZZLE_ID, switchId: 'node-4' },
    },
    {
      id: 'fragment-pickup-11',
      interactable: true,
      requiresPuzzleSolved: BURIED_CHORD_PUZZLE_ID,
      position: { x: 12 * CHORD_TILE_SIZE, y: 5 * CHORD_TILE_SIZE },
      memoryFragment: 'fragment-11',
    },
    {
      id: 'fragment-pickup-12',
      interactable: true,
      requiresPuzzleSolved: BURIED_CHORD_PUZZLE_ID,
      position: { x: 14 * CHORD_TILE_SIZE, y: 7 * CHORD_TILE_SIZE },
      memoryFragment: 'fragment-12',
    },
  ],
};

export const REGIONS: Record<string, Region> = {
  [LANDING_ZONE.id]: LANDING_ZONE,
  [ANCIENT_RUINS.id]: ANCIENT_RUINS,
  [SIGNAL_CORE.id]: SIGNAL_CORE,
  [BURIED_CACHE.id]: BURIED_CACHE,
  [THOUSAND_SPIRES.id]: THOUSAND_SPIRES,
  [BURIED_CHORD.id]: BURIED_CHORD,
};
