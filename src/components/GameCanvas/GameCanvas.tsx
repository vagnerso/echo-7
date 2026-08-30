import { useEffect, useRef } from 'react';

import { MEMORY_FRAGMENTS } from '@/content/fragments';
import { PUZZLES } from '@/content/puzzles';
import { REGIONS } from '@/content/regions';
import {
  type RobotPalette,
  ROBOT_COLOR_PALETTES,
} from '@/content/robotColors';
import {
  playFootstepSound,
  playInteractSound,
  playPickupSound,
  playPuzzleSolvedSound,
  playScannerToggleSound,
} from '@/engine/audio';
import {
  type Camera,
  createCamera,
  updateCameraFollow,
  worldToScreen,
} from '@/engine/camera';
import { computeCanvasSize } from '@/engine/canvasSize';
import { InputManager } from '@/engine/inputManager';
import {
  type Particle,
  spawnParticles,
  updateParticles,
} from '@/engine/particleSystem';
import type { MemoryFragment } from '@/entities/memoryFragment';
import { createPlayer, type Player, type Vector2 } from '@/entities/player';
import type { Puzzle } from '@/entities/puzzle';
import { useGameLoop } from '@/hooks/useGameLoop';
import type { AABB } from '@/systems/collisionSystem';
import { resolveCollisions } from '@/systems/collisionSystem';
import { findNearestInteractable } from '@/systems/interactionSystem';
import { updatePlayerMovement } from '@/systems/movementSystem';
import { activateSwitch } from '@/systems/puzzleSystem';
import {
  createDiscoveryFromObject,
  findNearestScannable,
} from '@/systems/scannerSystem';
import { findInstallableUpgrades } from '@/systems/upgradeSystem';
import { DEFAULT_ROBOT_COLOR } from '@/i18n';
import { saveGame } from '@/save/saveGame';
import { useGameStore } from '@/state/gameStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useUiStore } from '@/state/uiStore';
import type { Region, WorldObject } from '@/world/region';
import {
  getHazardTiles,
  getRegionObstacles,
  getRegionSize,
  getSealedTiles,
} from '@/world/worldLoader';

import styles from './GameCanvas.module.css';

interface RegionData {
  region: Region;
  walls: readonly AABB[];
  hazards: readonly AABB[];
  sealed: readonly AABB[];
}

const REGION_DATA: Record<string, RegionData> = Object.fromEntries(
  Object.values(REGIONS).map((region) => [
    region.id,
    {
      region,
      walls: getRegionObstacles(region),
      hazards: getHazardTiles(region),
      sealed: getSealedTiles(region),
    },
  ]),
);

const PUZZLES_BY_ID: Record<string, Puzzle> = Object.fromEntries(
  PUZZLES.map((puzzle) => [puzzle.id, puzzle]),
);

const FRAGMENTS_BY_ID: Record<string, MemoryFragment> = Object.fromEntries(
  MEMORY_FRAGMENTS.map((fragment) => [fragment.id, fragment]),
);

// So existe um puzzle no MVP - o tile 'sealed' sempre se refere a ele (ver
// nota em world/region.ts). Um segundo puzzle exigiria tiles 'sealed' com
// metadado por tile em vez desta constante fixa.
const SEALED_TILE_PUZZLE_ID = 'ruins-puzzle-01';

const FOOTSTEP_INTERVAL_MS = 260;
const FOOTSTEP_PARTICLE_COLOR = 'rgba(94, 230, 200, 0.6)';
/** Duracao de cada metade (fade-out, fade-in) da transicao entre regioes. */
const TRANSITION_DURATION_MS = 250;

interface TransitionState {
  phase: 'idle' | 'out' | 'in';
  progress: number;
  pendingExit: NonNullable<WorldObject['exit']> | null;
}

// Chassi/pernas variam com a cor escolhida em Settings (content/robotColors.ts,
// RobotPalette) - so o sensor (lente/glow) e a antena ficam fixos abaixo,
// como "identidade" do ECHO-7 independente da cor.
const PLAYER_LENS_COLOR = '#08090c';
const PLAYER_LENS_GLOW = 'rgba(94, 230, 200, 0.9)';
const PLAYER_ANTENNA_COLOR = 'rgba(216, 219, 226, 0.8)';
const PLAYER_ANTENNA_TIP_COLOR = '#ffcf7a';
const WALL_COLOR = 'rgba(94, 230, 200, 0.12)';
const WALL_BORDER_COLOR = 'rgba(94, 230, 200, 0.4)';
const HAZARD_COLOR = 'rgba(230, 120, 90, 0.18)';
const HAZARD_BORDER_COLOR = 'rgba(230, 120, 90, 0.6)';
const SEALED_COLOR = 'rgba(170, 120, 230, 0.18)';
const SEALED_BORDER_COLOR = 'rgba(170, 120, 230, 0.6)';
const ROCK_CLUSTER_COLORS = [
  'rgba(150, 100, 80, 0.55)',
  'rgba(120, 80, 110, 0.5)',
  'rgba(180, 160, 130, 0.45)',
];
const INTERACTABLE_COLOR = 'rgba(230, 170, 94, 0.7)';
const INTERACTABLE_ACTIVATED_COLOR = 'rgba(94, 230, 140, 0.8)';
const COLLECTIBLE_COLOR = 'rgba(240, 210, 90, 0.85)';
const EXIT_COLOR = 'rgba(150, 170, 240, 0.8)';
const SWITCH_COLOR = 'rgba(170, 120, 230, 0.6)';
const SWITCH_ACTIVE_COLOR = 'rgba(200, 160, 255, 0.95)';
const HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.9)';
const SCANNABLE_COLOR = 'rgba(120, 170, 255, 0.7)';
const MEMORY_FRAGMENT_COLOR = 'rgba(230, 130, 200, 0.85)';

/** Preenchimento visivel so fora dos limites do mundo (camera perto das bordas). */
const VOID_COLOR = '#05060a';

interface GroundPalette {
  skyTop: string;
  skyBottom: string;
  speckleColors: readonly string[];
  crackColor: string;
  accentColor: string;
  /** Se definido, desenha uma grade tecnologica em vez de rachaduras organicas (piso de instalacao). */
  gridSpacing?: number;
}

// Uma paleta por regiao, para que cada uma pareca um lugar distinto do mesmo
// planeta (a narrativa ja separa Landing Zone / Ancient Ruins / Signal Core
// como locais tematicamente diferentes - ver content/regions.ts).
const REGION_GROUND_PALETTES: Record<string, GroundPalette> = {
  'region-1': {
    // Landing Zone: solo rochoso alienigena, tons de ferrugem e roxo.
    skyTop: '#241a2e',
    skyBottom: '#140f1c',
    speckleColors: [
      'rgba(150, 100, 80, 0.3)',
      'rgba(120, 80, 110, 0.28)',
      'rgba(90, 70, 100, 0.22)',
    ],
    crackColor: 'rgba(60, 40, 70, 0.35)',
    accentColor: 'rgba(230, 140, 90, 0.16)',
  },
  'region-2': {
    // Ancient Ruins: pedra antiga, tons dourados e verde-musgo.
    skyTop: '#211f14',
    skyBottom: '#14130c',
    speckleColors: ['rgba(160, 145, 90, 0.28)', 'rgba(120, 140, 100, 0.24)'],
    crackColor: 'rgba(80, 90, 60, 0.4)',
    accentColor: 'rgba(180, 210, 150, 0.14)',
  },
  'region-3': {
    // Signal Core: piso metalico de instalacao, azul tecnologico - grade em
    // vez de rachaduras organicas, ecoando a estetica de "computador de bordo".
    skyTop: '#0f1a24',
    skyBottom: '#0a121a',
    speckleColors: ['rgba(90, 130, 160, 0.14)'],
    crackColor: 'rgba(60, 100, 130, 0.2)',
    accentColor: 'rgba(94, 230, 200, 0.2)',
    gridSpacing: 64,
  },
};

const DEFAULT_GROUND_PALETTE: GroundPalette = REGION_GROUND_PALETTES[
  'region-1'
]!;

/**
 * Gera, uma unica vez por regiao, uma textura de chao (canvas offscreen do
 * tamanho do mundo inteiro) com gradiente + ruido procedural. So e desenhada
 * (drawImage) a cada frame depois - gerar as manchas/rachaduras de novo a
 * cada frame seria caro e o padrao nunca muda, entao nao ha ganho visual.
 */
function createGroundTexture(
  region: Region,
  palette: GroundPalette,
): HTMLCanvasElement {
  const { width, height } = getRegionSize(region);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(width, 1);
  canvas.height = Math.max(height, 1);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.skyTop);
  gradient.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (palette.gridSpacing) {
    ctx.strokeStyle = palette.crackColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += palette.gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += palette.gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else {
    // Rachaduras organicas: poucos segmentos curtos e irregulares.
    const crackCount = Math.floor((width * height) / 12_000);
    ctx.strokeStyle = palette.crackColor;
    ctx.lineWidth = 1;
    for (let i = 0; i < crackCount; i += 1) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const segments = 2 + Math.floor(Math.random() * 3);
      for (let s = 0; s < segments; s += 1) {
        x += (Math.random() - 0.5) * 24;
        y += (Math.random() - 0.5) * 24;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  // Manchas/pedras dispersas - da textura organica ao solo.
  const speckleCount = Math.floor((width * height) / 1600);
  for (let i = 0; i < speckleCount; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 2 + Math.random() * 5;
    ctx.fillStyle =
      palette.speckleColors[
        Math.floor(Math.random() * palette.speckleColors.length)
      ]!;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Destaques de acento (veios de energia / luzes de status), esparsos.
  const accentCount = Math.floor((width * height) / 22_000);
  ctx.fillStyle = palette.accentColor;
  for (let i = 0; i < accentCount; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

/**
 * Cache por regiao num Map (mantido pelo componente, nao em modulo) - criar
 * HTMLCanvasElement exige `document`, entao so pode acontecer em runtime de
 * navegador, nunca no import do modulo (isso quebraria se este arquivo
 * algum dia fosse importado sob o ambiente de teste `node` do Vitest).
 */
function getGroundTexture(
  cache: Map<string, HTMLCanvasElement>,
  region: Region,
): HTMLCanvasElement {
  const cached = cache.get(region.id);
  if (cached) return cached;

  const palette = REGION_GROUND_PALETTES[region.id] ?? DEFAULT_GROUND_PALETTE;
  const texture = createGroundTexture(region, palette);
  cache.set(region.id, texture);
  return texture;
}

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  screenPosition: Vector2,
  facing: Player['facing'],
  size: Vector2,
  animationTime: number,
  isMoving: boolean,
  palette: RobotPalette,
): void {
  // Fase da passada quando andando; parado, usa um seno mais lento como
  // flutuacao/respiracao sutil - deixa o robo "vivo" mesmo parado.
  const walkPhase = animationTime / 130;
  const hover = isMoving
    ? Math.abs(Math.sin(walkPhase)) * 2
    : Math.sin(animationTime / 500) * 1.2;

  const centerX = screenPosition.x;
  const centerY = screenPosition.y - hover;
  const halfW = size.x / 2;
  const halfH = size.y / 2;

  // Esteiras/pes: alternam verticalmente durante o movimento (passada);
  // ficam simetricos e parados quando o robo esta parado.
  const legSwing = isMoving ? Math.sin(walkPhase) * 3 : 0;
  const legY = centerY + halfH - 3;
  ctx.fillStyle = palette.leg;
  ctx.beginPath();
  ctx.roundRect(centerX - halfW * 0.7 - 5, legY + legSwing, 10, 7, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(centerX + halfW * 0.7 - 5, legY - legSwing, 10, 7, 2);
  ctx.fill();

  // Chassi: retangulo arredondado com gradiente vertical para dar volume
  // sem depender de sprite/imagem (decisao da Fase 0: sem pipeline de assets).
  const bodyTop = centerY - halfH;
  const bodyHeight = size.y * 0.85;
  const bodyGradient = ctx.createLinearGradient(
    0,
    bodyTop,
    0,
    bodyTop + bodyHeight,
  );
  bodyGradient.addColorStop(0, palette.light);
  bodyGradient.addColorStop(1, palette.body);
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = palette.outline;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(centerX - halfW, bodyTop, size.x, bodyHeight, 6);
  ctx.fill();
  ctx.stroke();

  // Selo/painel: um unico traco escuro, detalhe mecanico minimo.
  ctx.strokeStyle = palette.dark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - halfW + 4, bodyTop + bodyHeight * 0.65);
  ctx.lineTo(centerX + halfW - 4, bodyTop + bodyHeight * 0.65);
  ctx.stroke();

  // Cabeca/lente desloca levemente na direcao "facing" - substitui o antigo
  // marcador solto e deixa claro para onde o ECHO-7 esta olhando.
  const lookOffset = 4;
  const headOffset: Vector2 = { x: 0, y: 0 };
  if (facing === 'up') headOffset.y = -lookOffset;
  if (facing === 'down') headOffset.y = lookOffset;
  if (facing === 'left') headOffset.x = -lookOffset;
  if (facing === 'right') headOffset.x = lookOffset;

  const headX = centerX + headOffset.x;
  const headY = bodyTop + 2 + headOffset.y;

  // Lente: nucleo escuro com glow ciano (shadowBlur) e um brilho pontual,
  // para lembrar uma lente de camera/sensor em vez de um olho generico.
  ctx.save();
  ctx.shadowColor = PLAYER_LENS_GLOW;
  ctx.shadowBlur = 6;
  ctx.fillStyle = PLAYER_LENS_COLOR;
  ctx.beginPath();
  ctx.arc(headX, headY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(headX - 1.5, headY - 1.5, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Antena: assinatura visual de "robo explorador", com ponta pulsando.
  const antennaTipY = bodyTop - 10;
  ctx.strokeStyle = PLAYER_ANTENNA_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX, bodyTop);
  ctx.lineTo(centerX, antennaTipY);
  ctx.stroke();

  const pulse = 0.5 + Math.sin(animationTime / 300) * 0.5;
  ctx.save();
  ctx.shadowColor = PLAYER_ANTENNA_TIP_COLOR;
  ctx.shadowBlur = 4 + pulse * 4;
  ctx.fillStyle = PLAYER_ANTENNA_TIP_COLOR;
  ctx.beginPath();
  ctx.arc(centerX, antennaTipY, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderTiles(
  ctx: CanvasRenderingContext2D,
  tiles: readonly AABB[],
  fillColor: string,
  borderColor: string,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = borderColor;

  for (const tile of tiles) {
    const screenTopLeft = worldToScreen(
      { x: tile.x, y: tile.y },
      camera,
      canvasWidth,
      canvasHeight,
    );
    ctx.fillRect(screenTopLeft.x, screenTopLeft.y, tile.width, tile.height);
    ctx.strokeRect(screenTopLeft.x, screenTopLeft.y, tile.width, tile.height);
  }
}

/**
 * Hash simples e estavel (mesmo id sempre gera o mesmo numero) - usado para
 * variar o agrupamento de pedras de cada decoracao sem Math.random() por
 * frame, o que faria o agrupamento "tremer" a cada render.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function renderDecorations(
  ctx: CanvasRenderingContext2D,
  objects: readonly WorldObject[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  for (const object of objects) {
    if (object.interactable || object.scannable) continue;

    const screenPosition = worldToScreen(
      object.position,
      camera,
      canvasWidth,
      canvasHeight,
    );

    // Agrupamento de pedras (3 circulos) em vez de um unico ponto generico -
    // reforca a leitura de "detrito/formacao rochosa" do terreno alienigena.
    const hash = hashString(object.id);
    for (let i = 0; i < 3; i += 1) {
      const seed = Math.abs((hash >> (i * 7)) % 1000) / 1000;
      const angle = seed * Math.PI * 2 + i * 2.1;
      const distance = 3 + seed * 5;
      const radius = 3 + ((hash >> (i * 3 + 2)) % 4);

      ctx.fillStyle = ROCK_CLUSTER_COLORS[i % ROCK_CLUSTER_COLORS.length]!;
      ctx.beginPath();
      ctx.arc(
        screenPosition.x + Math.cos(angle) * distance,
        screenPosition.y + Math.sin(angle) * distance,
        radius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

function renderInteractables(
  ctx: CanvasRenderingContext2D,
  objects: readonly WorldObject[],
  activated: ReadonlyMap<string, boolean>,
  nearestId: string | null,
  getPuzzleProgress: (puzzleId: string) => readonly string[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  for (const object of objects) {
    if (!object.interactable) continue;

    const screenPosition = worldToScreen(
      object.position,
      camera,
      canvasWidth,
      canvasHeight,
    );

    if (object.id === nearestId) {
      ctx.strokeStyle = HIGHLIGHT_COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPosition.x, screenPosition.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (object.exit) {
      // Retangulo tipo "porta", para diferenciar de todo o resto - placeholder ate existir arte de verdade.
      ctx.fillStyle = EXIT_COLOR;
      ctx.fillRect(screenPosition.x - 8, screenPosition.y - 12, 16, 24);
      continue;
    }

    if (object.collectible) {
      // Item coletavel: quadrado, para diferenciar de um interagivel fixo (console) - placeholder ate existir arte de verdade.
      ctx.fillStyle = COLLECTIBLE_COLOR;
      ctx.fillRect(screenPosition.x - 8, screenPosition.y - 8, 16, 16);
      continue;
    }

    if (object.puzzleSwitch) {
      const progress = getPuzzleProgress(object.puzzleSwitch.puzzleId);
      const isActive = progress.includes(object.puzzleSwitch.switchId);
      ctx.fillStyle = isActive ? SWITCH_ACTIVE_COLOR : SWITCH_COLOR;
      ctx.beginPath();
      ctx.arc(screenPosition.x, screenPosition.y, 10, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    if (object.memoryFragment) {
      // Triangulo: diferencia visualmente de todo o resto - placeholder ate existir arte de verdade.
      ctx.fillStyle = MEMORY_FRAGMENT_COLOR;
      ctx.beginPath();
      ctx.moveTo(screenPosition.x, screenPosition.y - 10);
      ctx.lineTo(screenPosition.x + 9, screenPosition.y + 7);
      ctx.lineTo(screenPosition.x - 9, screenPosition.y + 7);
      ctx.closePath();
      ctx.fill();
      continue;
    }

    ctx.fillStyle = activated.get(object.id)
      ? INTERACTABLE_ACTIVATED_COLOR
      : INTERACTABLE_COLOR;
    ctx.beginPath();
    ctx.arc(screenPosition.x, screenPosition.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderScannables(
  ctx: CanvasRenderingContext2D,
  objects: readonly WorldObject[],
  nearestId: string | null,
  hasDeepScanner: boolean,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  for (const object of objects) {
    if (!object.scannable) continue;
    // Objeto "oculto" nao deveria ter marcador visivel antes do upgrade -
    // senao o jogador veria o losango no mapa mesmo com o scanner
    // acusando "NO SIGNAL" ali do lado, o que seria inconsistente.
    if (object.requiresDeepScanner && !hasDeepScanner) continue;

    const screenPosition = worldToScreen(
      object.position,
      camera,
      canvasWidth,
      canvasHeight,
    );

    if (object.id === nearestId) {
      ctx.strokeStyle = HIGHLIGHT_COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPosition.x, screenPosition.y, 16, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Losango em vez de circulo: diferencia visualmente de interactable - placeholder ate existir arte de verdade.
    ctx.fillStyle = SCANNABLE_COLOR;
    ctx.beginPath();
    ctx.moveTo(screenPosition.x, screenPosition.y - 10);
    ctx.lineTo(screenPosition.x + 10, screenPosition.y);
    ctx.lineTo(screenPosition.x, screenPosition.y + 10);
    ctx.lineTo(screenPosition.x - 10, screenPosition.y);
    ctx.closePath();
    ctx.fill();
  }
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: readonly Particle[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  for (const particle of particles) {
    const screenPosition = worldToScreen(
      particle.position,
      camera,
      canvasWidth,
      canvasHeight,
    );
    const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));

    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(screenPosition.x, screenPosition.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const INITIAL_SPAWN: Vector2 = { x: 200, y: 200 };

// Ponto de entrada de cada regiao, para quando o jogador "continua" um save
// que nao esta na Landing Zone. Precisam bater com os spawnPosition dos
// exits correspondentes em content/regions.ts - a posicao exata do jogador
// nao entra no save (fica fora da gameStore por performance, ver
// docs/DECISIONS.md), entao ao continuar ele reaparece na entrada da regiao,
// nao no pixel exato de onde saiu.
const REGION_SPAWN_POINTS: Record<string, Vector2> = {
  'region-1': INITIAL_SPAWN,
  'region-2': { x: 128, y: 448 },
  'region-3': { x: 320, y: 512 },
};

function resolveSpawnPoint(): Vector2 {
  const regionId = useGameStore.getState().currentRegionId;
  return REGION_SPAWN_POINTS[regionId] ?? INITIAL_SPAWN;
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player>(createPlayer(resolveSpawnPoint()));
  const previousPositionRef = useRef<Vector2>({ ...resolveSpawnPoint() });
  const cameraRef = useRef<Camera>(createCamera(resolveSpawnPoint()));
  const inputRef = useRef<InputManager | null>(null);
  const nearestInteractableRef = useRef<WorldObject | null>(null);
  const nearestScannableRef = useRef<WorldObject | null>(null);
  const activatedInteractablesRef = useRef<Map<string, boolean>>(new Map());
  // Ids de objetos coletaveis ja recolhidos - somem do mundo (nao renderizam,
  // nao contam mais para interacao/scan). Content/regions.ts continua
  // imutavel; isso e estado de sessao, nao de conteudo. Unico Set global
  // (nao por regiao) porque os ids de objeto sao unicos entre regioes.
  const collectedItemsRef = useRef<Set<string>>(new Set());
  // Progresso parcial de cada puzzle (quais switches ja ativados nesta
  // tentativa) - diferente de "resolvido" (gameStore.solvedPuzzles), que e
  // permanente. Perder o progresso parcial ao recarregar e aceitavel.
  const puzzleProgressRef = useRef<Map<string, string[]>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const footstepTimerRef = useRef<number>(FOOTSTEP_INTERVAL_MS);
  // Acumulador de tempo so para animacao do robo (passada/flutuacao/pulso da
  // antena) - modulo alto evita perda de precisao de ponto flutuante em
  // sessoes longas, sem afetar a suavidade dos senos usados no render.
  const animationTimeRef = useRef<number>(0);
  const isMovingRef = useRef<boolean>(false);
  const groundTexturesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const transitionRef = useRef<TransitionState>({
    phase: 'idle',
    progress: 0,
    pendingExit: null,
  });

  const applyExit = (exit: NonNullable<WorldObject['exit']>) => {
    const { toRegionId, spawnPosition } = exit;
    useGameStore.getState().setCurrentRegion(toRegionId);

    playerRef.current.position.x = spawnPosition.x;
    playerRef.current.position.y = spawnPosition.y;
    previousPositionRef.current = { ...spawnPosition };
    cameraRef.current = createCamera(spawnPosition);

    if (toRegionId === 'region-2') {
      useGameStore.getState().setObjective('investigateAncientRuins');
    } else if (toRegionId === 'region-3') {
      useGameStore.getState().setObjective('activateSignalCore');
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const { width, height, styleWidth, styleHeight } = computeCanvasSize(
        container.clientWidth,
        container.clientHeight,
        window.devicePixelRatio,
      );

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${styleWidth}px`;
      canvas.style.height = `${styleHeight}px`;
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const input = new InputManager();
    inputRef.current = input;
    return () => input.destroy();
  }, []);

  useEffect(() => {
    // Autosave: a gameStore so muda em eventos discretos de progresso (nunca
    // a cada frame - ver docs/DECISIONS.md), entao salvar a cada mudanca e
    // barato e nao precisa de debounce.
    return useGameStore.subscribe(() => {
      saveGame();
    });
  }, []);

  useGameLoop({
    update: (dt) => {
      const input = inputRef.current;
      if (!input) return;

      particlesRef.current = updateParticles(particlesRef.current, dt);

      const transition = transitionRef.current;
      if (transition.phase !== 'idle') {
        transition.progress += dt / TRANSITION_DURATION_MS;

        if (transition.progress >= 1) {
          if (transition.phase === 'out' && transition.pendingExit) {
            applyExit(transition.pendingExit);
            transition.phase = 'in';
            transition.progress = 0;
            transition.pendingExit = null;
          } else {
            transition.phase = 'idle';
            transition.progress = 0;
          }
        }

        // Ainda consome os toques de tecla acumulados durante a transicao,
        // para nao "vazar" uma interacao que o jogador segurou durante o
        // fade para o instante em que o jogo volta a responder.
        input.clearJustPressed();
        return;
      }

      const regionId = useGameStore.getState().currentRegionId;
      const regionData = REGION_DATA[regionId];
      if (!regionData) return;

      const player = playerRef.current;
      const beforeMove = { ...player.position };
      previousPositionRef.current = beforeMove;

      updatePlayerMovement(player, input, dt);

      const hasMagneticBoots = useGameStore
        .getState()
        .installedUpgrades.has('magnetic-boots');
      const puzzleSolved = useGameStore
        .getState()
        .solvedPuzzles.has(SEALED_TILE_PUZZLE_ID);
      const obstacles = [
        ...regionData.walls,
        ...(hasMagneticBoots ? [] : regionData.hazards),
        ...(puzzleSolved ? [] : regionData.sealed),
      ];

      const resolved = resolveCollisions(
        beforeMove,
        player.position,
        player.size,
        obstacles,
      );
      player.position.x = resolved.x;
      player.position.y = resolved.y;

      const isMoving =
        Math.abs(player.velocity.x) > 0.001 ||
        Math.abs(player.velocity.y) > 0.001;
      isMovingRef.current = isMoving;
      animationTimeRef.current = (animationTimeRef.current + dt) % 100_000;

      if (isMoving) {
        footstepTimerRef.current += dt;

        if (footstepTimerRef.current >= FOOTSTEP_INTERVAL_MS) {
          footstepTimerRef.current = 0;
          playFootstepSound();

          // Particula nasce um pouco atras do jogador (oposto de para onde
          // ele esta olhando), como uma pequena poeira de passo.
          const behindOffset = player.size.x / 2;
          const spawnPosition: Vector2 = { ...player.position };
          if (player.facing === 'up') spawnPosition.y += behindOffset;
          if (player.facing === 'down') spawnPosition.y -= behindOffset;
          if (player.facing === 'left') spawnPosition.x += behindOffset;
          if (player.facing === 'right') spawnPosition.x -= behindOffset;

          particlesRef.current = spawnParticles(particlesRef.current, [
            {
              position: spawnPosition,
              velocity: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
              },
              life: 350,
              maxLife: 350,
              color: FOOTSTEP_PARTICLE_COLOR,
              size: 3,
            },
          ]);
        }
      } else {
        // Assim que o jogador voltar a andar, o proximo passo toca na hora,
        // em vez de esperar o intervalo inteiro de novo.
        footstepTimerRef.current = FOOTSTEP_INTERVAL_MS;
      }

      const activeObjects = regionData.region.objects.filter(
        (object) => !collectedItemsRef.current.has(object.id),
      );

      const nearestInteractable = findNearestInteractable(
        player.position,
        activeObjects,
        undefined,
        useGameStore.getState().solvedPuzzles,
      );
      nearestInteractableRef.current = nearestInteractable;

      if (nearestInteractable && input.wasActionJustPressed('interact')) {
        if (nearestInteractable.exit) {
          playInteractSound();
          transitionRef.current = {
            phase: 'out',
            progress: 0,
            pendingExit: nearestInteractable.exit,
          };
          nearestInteractableRef.current = null;
          nearestScannableRef.current = null;
        } else if (nearestInteractable.triggersEnding) {
          playPuzzleSolvedSound();
          useGameStore.getState().triggerEnding();
        } else if (nearestInteractable.puzzleSwitch) {
          const { puzzleId, switchId } = nearestInteractable.puzzleSwitch;
          const puzzle = PUZZLES_BY_ID[puzzleId];

          if (puzzle) {
            const currentProgress =
              puzzleProgressRef.current.get(puzzleId) ?? [];
            const result = activateSwitch(puzzle, currentProgress, switchId);
            puzzleProgressRef.current.set(puzzleId, result.progress);

            if (result.solved) {
              playPuzzleSolvedSound();
              useGameStore.getState().markPuzzleSolved(puzzleId);

              if (puzzleId === 'ruins-puzzle-01') {
                useGameStore.getState().setObjective('findWayToSignalCore');
              } else if (puzzleId === 'signal-core-puzzle') {
                useGameStore.getState().setObjective('approachCore');
              }
            } else {
              playInteractSound();
            }
          }
        } else if (nearestInteractable.memoryFragment) {
          const fragmentId = nearestInteractable.memoryFragment;
          const fragment = FRAGMENTS_BY_ID[fragmentId];

          playPickupSound();
          collectedItemsRef.current.add(nearestInteractable.id);
          nearestInteractableRef.current = null;
          useGameStore.getState().collectFragment(fragmentId);
          if (fragment) {
            useUiStore.getState().setActiveFragmentReveal(fragment);
          }
        } else if (nearestInteractable.collectible) {
          const added = useGameStore
            .getState()
            .addItem(nearestInteractable.collectible);
          if (added) {
            playPickupSound();
            collectedItemsRef.current.add(nearestInteractable.id);
            nearestInteractableRef.current = null;

            // Instala automaticamente qualquer upgrade que o componente
            // recem-coletado tenha tornado possivel (ver Fase 6 em
            // docs/DECISIONS.md - sem tecla dedicada para isso). Reavalia a
            // lista apos cada instalacao (getState() de novo, nao um
            // snapshot unico) porque instalar um upgrade consome o
            // componente - sem isso, uma unica unidade de componente
            // poderia "pagar" por dois upgrades que exigem 1 cada.
            let installable = findInstallableUpgrades(
              useGameStore.getState().inventory,
              useGameStore.getState().installedUpgrades,
            );
            while (installable.length > 0) {
              const upgrade = installable[0]!;
              useGameStore
                .getState()
                .removeItem(
                  upgrade.requiredComponent.id,
                  upgrade.requiredComponent.quantity,
                );
              useGameStore.getState().installUpgrade(upgrade.id);

              installable = findInstallableUpgrades(
                useGameStore.getState().inventory,
                useGameStore.getState().installedUpgrades,
              );
            }
          }
        } else {
          playInteractSound();
          const activated = activatedInteractablesRef.current;
          activated.set(
            nearestInteractable.id,
            !activated.get(nearestInteractable.id),
          );
        }
      }

      if (input.wasActionJustPressed('scanner')) {
        playScannerToggleSound();
        useUiStore.getState().toggleScanner();
      }

      if (input.wasActionJustPressed('inventory')) {
        useUiStore.getState().toggleInventory();
      }

      const isScannerActive = useUiStore.getState().isScannerActive;
      const hasDeepScanner = useGameStore
        .getState()
        .installedUpgrades.has('deep-scanner');
      const nearestScannable = isScannerActive
        ? findNearestScannable(
            player.position,
            activeObjects,
            undefined,
            hasDeepScanner,
          )
        : null;
      nearestScannableRef.current = nearestScannable;

      // So escreve na store quando o alvo realmente muda - evita disparar
      // re-render dos componentes inscritos a cada um dos ~60 passos por
      // segundo (mesmo raciocinio ja aplicado a outras leituras de estado).
      const previousTarget = useUiStore.getState().currentScanTarget;
      const newTargetId = nearestScannable?.id ?? null;
      if (previousTarget?.objectId !== newTargetId) {
        if (nearestScannable) {
          const discovery = createDiscoveryFromObject(
            nearestScannable,
            regionData.region.id,
          );
          useUiStore.getState().setCurrentScanTarget(discovery);
          if (discovery) {
            useGameStore.getState().addDiscovery(discovery);
          }
        } else {
          useUiStore.getState().setCurrentScanTarget(null);
        }
      }

      input.clearJustPressed();
    },
    render: (alpha) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const regionData = REGION_DATA[useGameStore.getState().currentRegionId];
      if (!regionData) return;

      // So aparece nas bordas do mapa, quando a camera mostra alem dos
      // limites do mundo - o resto da tela e coberto pela textura de chao.
      ctx.fillStyle = VOID_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const player = playerRef.current;
      const previous = previousPositionRef.current;
      const renderPosition: Vector2 = {
        x: previous.x + (player.position.x - previous.x) * alpha,
        y: previous.y + (player.position.y - previous.y) * alpha,
      };

      const camera = cameraRef.current;
      updateCameraFollow(camera, renderPosition);

      const groundTexture = getGroundTexture(
        groundTexturesRef.current,
        regionData.region,
      );
      const worldOrigin = worldToScreen(
        { x: 0, y: 0 },
        camera,
        canvas.width,
        canvas.height,
      );
      ctx.drawImage(groundTexture, worldOrigin.x, worldOrigin.y);

      const activeObjects = regionData.region.objects.filter(
        (object) => !collectedItemsRef.current.has(object.id),
      );

      renderTiles(
        ctx,
        regionData.walls,
        WALL_COLOR,
        WALL_BORDER_COLOR,
        camera,
        canvas.width,
        canvas.height,
      );
      renderTiles(
        ctx,
        regionData.hazards,
        HAZARD_COLOR,
        HAZARD_BORDER_COLOR,
        camera,
        canvas.width,
        canvas.height,
      );
      renderTiles(
        ctx,
        regionData.sealed,
        SEALED_COLOR,
        SEALED_BORDER_COLOR,
        camera,
        canvas.width,
        canvas.height,
      );
      renderDecorations(
        ctx,
        activeObjects,
        camera,
        canvas.width,
        canvas.height,
      );
      renderInteractables(
        ctx,
        activeObjects,
        activatedInteractablesRef.current,
        nearestInteractableRef.current?.id ?? null,
        (puzzleId) => puzzleProgressRef.current.get(puzzleId) ?? [],
        camera,
        canvas.width,
        canvas.height,
      );
      renderScannables(
        ctx,
        activeObjects,
        nearestScannableRef.current?.id ?? null,
        useGameStore.getState().installedUpgrades.has('deep-scanner'),
        camera,
        canvas.width,
        canvas.height,
      );
      renderParticles(
        ctx,
        particlesRef.current,
        camera,
        canvas.width,
        canvas.height,
      );

      const screenPosition = worldToScreen(
        renderPosition,
        camera,
        canvas.width,
        canvas.height,
      );
      const robotColor = useSettingsStore.getState().robotColor;
      const robotPalette =
        ROBOT_COLOR_PALETTES[robotColor] ??
        ROBOT_COLOR_PALETTES[DEFAULT_ROBOT_COLOR];
      renderPlayer(
        ctx,
        screenPosition,
        player.facing,
        player.size,
        animationTimeRef.current,
        isMovingRef.current,
        robotPalette,
      );

      const transition = transitionRef.current;
      if (transition.phase !== 'idle') {
        const fadeAlpha =
          transition.phase === 'out'
            ? Math.min(transition.progress, 1)
            : Math.max(1 - transition.progress, 0);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
  });

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
