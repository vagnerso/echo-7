import { useEffect, useRef } from 'react';

import { TouchControls } from '@/components/TouchControls/TouchControls';
import { MEMORY_FRAGMENTS } from '@/content/fragments';
import { FRAGMENT_COLOR, ITEM_TYPE_COLORS } from '@/content/itemColors';
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
// Mesmo tom da lente/glow (PLAYER_LENS_GLOW) - o "sinal" do radar sai do
// mesmo sensor que ja e ciano, em vez de introduzir uma terceira cor de
// identidade so para o scanner.
const ANTENNA_SIGNAL_RING_COLOR = '94, 230, 200';
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
const EXIT_COLOR = 'rgba(150, 170, 240, 0.8)';
const SWITCH_COLOR = 'rgba(170, 120, 230, 0.6)';
const SWITCH_ACTIVE_COLOR = 'rgba(200, 160, 255, 0.95)';
const HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.9)';
const SCANNABLE_COLOR = 'rgba(120, 170, 255, 0.7)';

// Contorno + brilho especular reutilizados em todo objeto do mundo (porta,
// coletavel, switch, fragmento, scannable) - mesma tecnica ja usada na lente
// do robo (renderPlayer): shadowBlur na cor do proprio objeto + um ponto
// branco translucido simulando reflexo. Unifica o "material" de tudo que e
// placeholder vetorial (ainda sem arte de verdade) sob uma unica linguagem
// visual, em vez de cada forma ter um tratamento diferente.
const OBJECT_OUTLINE_COLOR = 'rgba(8, 9, 12, 0.85)';
const OBJECT_HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.75)';

const HAZARD_STRIPE_COLOR = 'rgba(230, 120, 90, 0.5)';
const SEALED_LOCK_COLOR = 'rgba(210, 170, 255, 0.9)';
const WALL_BEVEL_LIGHT = 'rgba(164, 245, 226, 0.25)';
const WALL_BEVEL_DARK = 'rgba(5, 6, 10, 0.35)';

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
  'region-4': {
    // Buried Cache: deposito subterraneo humano - terra/madeira escura, sem
    // nada alienigena (contraste deliberado com as outras 3 paletas), com um
    // acento ambar quente lembrando luz de emergencia/equipamento antigo.
    skyTop: '#1a140f',
    skyBottom: '#0f0b08',
    speckleColors: ['rgba(140, 110, 70, 0.28)', 'rgba(100, 80, 60, 0.22)'],
    crackColor: 'rgba(70, 55, 40, 0.4)',
    accentColor: 'rgba(230, 180, 90, 0.16)',
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
  isScannerActive: boolean,
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
  // ficam simetricos e parados quando o robo esta parado. Contorno +
  // friso claro (em vez de so um retangulo solido) para "destacar" o pe
  // como peca mecanica propria, no mesmo espirito do contorno do chassi.
  const legSwing = isMoving ? Math.sin(walkPhase) * 3 : 0;
  const legY = centerY + halfH - 3;
  const legWidth = 11;
  const legHeight = 8;
  for (const [legCenterX, swing] of [
    [centerX - halfW * 0.7, legSwing],
    [centerX + halfW * 0.7, -legSwing],
  ] as const) {
    const legTop = legY + swing;
    ctx.fillStyle = palette.leg;
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legCenterX - legWidth / 2, legTop, legWidth, legHeight, 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = palette.light;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(legCenterX - legWidth / 2 + 2, legTop + legHeight * 0.4);
    ctx.lineTo(legCenterX + legWidth / 2 - 2, legTop + legHeight * 0.4);
    ctx.stroke();
  }

  // Bracos: pequenos estabilizadores nas laterais, balancando em contrafase
  // com as pernas (contrapeso natural de quem anda) - parados quando o robo
  // esta parado. Desenhados antes do chassi de proposito: a silhueta do
  // corpo cobre a "junta" do ombro, entao so o toco externo do braco fica
  // visivel, como se estivesse encaixado no chassi.
  const armSwing = isMoving ? Math.sin(walkPhase + Math.PI) * 2 : 0;
  const armY = centerY - halfH * 0.2;
  const armWidth = 6;
  const armHeight = 12;
  for (const armCenterX of [
    centerX - halfW - armWidth / 2 + 1,
    centerX + halfW + armWidth / 2 - 1,
  ]) {
    ctx.fillStyle = palette.leg;
    ctx.strokeStyle = palette.outline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(
      armCenterX - armWidth / 2,
      armY + armSwing - armHeight / 2,
      armWidth,
      armHeight,
      2,
    );
    ctx.fill();
    ctx.stroke();
  }

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

  // Sinal de radar: com o scanner ligado, a ponta da antena emite aneis
  // concentricos que se expandem e desaparecem - deixa claro, so olhando pro
  // robo, que ele esta "escaneando", sem precisar olhar so pro painel do
  // scanner no canto da tela. Dois aneis defasados (metade do periodo um do
  // outro) para nunca ter um instante sem nenhum aro visivel na tela.
  if (isScannerActive) {
    const RING_PERIOD_MS = 900;
    const RING_MAX_RADIUS = 16;
    ctx.save();
    ctx.lineWidth = 1.5;
    for (const phaseOffset of [0, RING_PERIOD_MS / 2]) {
      const progress =
        ((animationTime + phaseOffset) % RING_PERIOD_MS) / RING_PERIOD_MS;
      const radius = 3 + progress * RING_MAX_RADIUS;
      const alpha = 0.6 * (1 - progress);
      ctx.strokeStyle = `rgba(${ANTENNA_SIGNAL_RING_COLOR}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(centerX, antennaTipY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

type TileDecorator = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) => void;

function renderTiles(
  ctx: CanvasRenderingContext2D,
  tiles: readonly AABB[],
  fillColor: string,
  borderColor: string,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
  decorate?: TileDecorator,
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
    decorate?.(
      ctx,
      screenTopLeft.x,
      screenTopLeft.y,
      tile.width,
      tile.height,
    );
  }
}

/**
 * Bisel simples (aresta clara + aresta escura) sobre o retangulo translucido
 * da parede - da uma leve sensacao de volume/painel tecnico em vez de uma
 * cor solida chapada, sem custo de shadowBlur (paredes se repetem muito:
 * todo o perimetro de cada regiao).
 */
function decorateWallTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.lineWidth = 1;
  ctx.strokeStyle = WALL_BEVEL_LIGHT;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + height - 1);
  ctx.lineTo(x + 1, y + 1);
  ctx.lineTo(x + width - 1, y + 1);
  ctx.stroke();

  ctx.strokeStyle = WALL_BEVEL_DARK;
  ctx.beginPath();
  ctx.moveTo(x + width - 1, y + 1);
  ctx.lineTo(x + width - 1, y + height - 1);
  ctx.lineTo(x + 1, y + height - 1);
  ctx.stroke();
}

/**
 * Faixas diagonais tipo "fita de risco" sobre o tile de hazard - a cor
 * translucida sozinha nao comunicava perigo de forma tao imediata quanto um
 * padrao de listras, linguagem visual ja convencionada para zona de risco.
 */
function decorateHazardTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  ctx.strokeStyle = HAZARD_STRIPE_COLOR;
  ctx.lineWidth = 5;
  const step = 12;
  for (let offset = -height; offset < width + height; offset += step) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y + height);
    ctx.lineTo(x + offset + height, y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Icone de cadeado centralizado no tile selado - comunica "trancado ate
 * resolver o puzzle" de forma muito mais direta do que uma cor translucida
 * generica igual as demais.
 */
function decorateSealedTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  ctx.save();
  ctx.shadowColor = SEALED_LOCK_COLOR;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = SEALED_LOCK_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 4, 6, Math.PI, 0);
  ctx.stroke();

  ctx.fillStyle = SEALED_LOCK_COLOR;
  ctx.beginPath();
  ctx.roundRect(centerX - 9, centerY - 4, 18, 14, 2);
  ctx.fill();
  ctx.restore();
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
  solvedPuzzles: ReadonlySet<string>,
  hasDeepScanner: boolean,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  for (const object of objects) {
    if (!object.interactable) continue;
    // Mesmo gate de scannables (systems/scannerSystem.ts): um objeto oculto
    // atras do Deep Scanner nao pode renderizar aqui so porque tambem e
    // interactable (bug corrigido - buried-cache-entrance vazava um retangulo
    // de "porta" bem visivel mesmo antes do upgrade, denunciando a entrada
    // secreta da Buried Cache).
    if (object.requiresDeepScanner && !hasDeepScanner) continue;

    const screenPosition = worldToScreen(
      object.position,
      camera,
      canvasWidth,
      canvasHeight,
    );

    // Objeto que exige um puzzle ainda nao resolvido nao responde a
    // interacao (ver systems/interactionSystem.ts) - sem isso ele renderiza
    // identico a um igual ja liberado, e o jogador nao tem nenhuma pista de
    // por que a tecla E "nao faz nada" nele.
    const isLocked =
      object.requiresPuzzleSolved !== undefined &&
      !solvedPuzzles.has(object.requiresPuzzleSolved);
    ctx.globalAlpha = isLocked ? 0.35 : 1;

    if (object.id === nearestId) {
      ctx.strokeStyle = HIGHLIGHT_COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPosition.x, screenPosition.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (object.exit) {
      // Retangulo tipo "porta" - placeholder ate existir arte de verdade,
      // com glow + vinco central sugerindo duas folhas (ver comentario do
      // OBJECT_OUTLINE_COLOR acima: mesma tecnica de brilho da lente do robo).
      const doorX = screenPosition.x - 8;
      const doorY = screenPosition.y - 12;
      ctx.save();
      ctx.shadowColor = EXIT_COLOR;
      ctx.shadowBlur = 8;
      ctx.fillStyle = EXIT_COLOR;
      ctx.strokeStyle = OBJECT_OUTLINE_COLOR;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(doorX, doorY, 16, 24, 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = OBJECT_OUTLINE_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenPosition.x, doorY + 2);
      ctx.lineTo(screenPosition.x, doorY + 22);
      ctx.stroke();
      continue;
    }

    if (object.collectible) {
      // Item coletavel: quadrado, para diferenciar de um interagivel fixo
      // (console) - placeholder ate existir arte de verdade. Cor vem de
      // content/itemColors.ts (mesma fonte usada no painel de inventario),
      // para resource/component terem uma identidade visual consistente
      // entre o chao e o inventario.
      const collectibleColor = ITEM_TYPE_COLORS[object.collectible.type];
      ctx.save();
      ctx.shadowColor = collectibleColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = collectibleColor;
      ctx.strokeStyle = OBJECT_OUTLINE_COLOR;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(
        screenPosition.x - 8,
        screenPosition.y - 8,
        16,
        16,
        3,
      );
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = OBJECT_HIGHLIGHT_COLOR;
      ctx.beginPath();
      ctx.arc(screenPosition.x - 3, screenPosition.y - 3, 1.6, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    if (object.puzzleSwitch) {
      const progress = getPuzzleProgress(object.puzzleSwitch.puzzleId);
      const isActive = progress.includes(object.puzzleSwitch.switchId);
      const color = isActive ? SWITCH_ACTIVE_COLOR : SWITCH_COLOR;

      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = isActive ? 10 : 5;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(screenPosition.x, screenPosition.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = OBJECT_OUTLINE_COLOR;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(screenPosition.x, screenPosition.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = OBJECT_HIGHLIGHT_COLOR;
      ctx.beginPath();
      ctx.arc(screenPosition.x - 3, screenPosition.y - 3, 1.8, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    if (object.memoryFragment) {
      // Triangulo: diferencia visualmente de todo o resto - placeholder ate existir arte de verdade.
      ctx.save();
      ctx.shadowColor = FRAGMENT_COLOR;
      ctx.shadowBlur = 8;
      ctx.fillStyle = FRAGMENT_COLOR;
      ctx.strokeStyle = OBJECT_OUTLINE_COLOR;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(screenPosition.x, screenPosition.y - 10);
      ctx.lineTo(screenPosition.x + 9, screenPosition.y + 7);
      ctx.lineTo(screenPosition.x - 9, screenPosition.y + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = OBJECT_HIGHLIGHT_COLOR;
      ctx.beginPath();
      ctx.arc(screenPosition.x - 2, screenPosition.y - 1, 1.4, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    const color = activated.get(object.id)
      ? INTERACTABLE_ACTIVATED_COLOR
      : INTERACTABLE_COLOR;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenPosition.x, screenPosition.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = OBJECT_OUTLINE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(screenPosition.x, screenPosition.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Restaura para nao vazar opacidade reduzida para o que for desenhado
  // depois (scannables, particulas, o proprio robo).
  ctx.globalAlpha = 1;
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
    ctx.save();
    ctx.shadowColor = SCANNABLE_COLOR;
    ctx.shadowBlur = 8;
    ctx.fillStyle = SCANNABLE_COLOR;
    ctx.strokeStyle = OBJECT_OUTLINE_COLOR;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(screenPosition.x, screenPosition.y - 10);
    ctx.lineTo(screenPosition.x + 10, screenPosition.y);
    ctx.lineTo(screenPosition.x, screenPosition.y + 10);
    ctx.lineTo(screenPosition.x - 10, screenPosition.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = OBJECT_HIGHLIGHT_COLOR;
    ctx.beginPath();
    ctx.arc(screenPosition.x - 2, screenPosition.y - 2, 1.4, 0, Math.PI * 2);
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
  'region-4': { x: 256, y: 384 },
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
  // Tamanho do canvas em pixels CSS (nao em pixels de buffer - ver
  // computeCanvasSize/resize abaixo). O mundo e desenhado em unidades de
  // pixel CSS (1 tile = 64 dessas unidades); o buffer real e maior em telas
  // de alta densidade (devicePixelRatio > 1), entao o render() precisa desse
  // valor para centralizar a camera e aplicar o ctx.setTransform correto.
  const canvasCssSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
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
      canvasCssSizeRef.current = { width: styleWidth, height: styleHeight };
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
        useGameStore.getState().installedUpgrades.has('deep-scanner'),
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

      // O mundo (tiles, objetos, robo) e desenhado inteiro em unidades de
      // pixel CSS - o buffer do canvas e maior nas telas de alta densidade
      // (ver computeCanvasSize/resize). Sem este setTransform, cada unidade
      // de mundo ocupava so 1 pixel de buffer em vez de `scaleX/scaleY`
      // pixels - em celulares (devicePixelRatio 2-3) isso fazia tudo
      // desenhar em 1/2 ou 1/3 do tamanho devido, com a camera parecendo
      // "muito longe" do robo. setTransform (nao scale) porque e chamado
      // toda vez no inicio do frame - reseta qualquer transform anterior em
      // vez de acumular.
      const cssSize = canvasCssSizeRef.current;
      if (cssSize.width === 0 || cssSize.height === 0) return;
      const scaleX = canvas.width / cssSize.width;
      const scaleY = canvas.height / cssSize.height;
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      const canvasWidth = cssSize.width;
      const canvasHeight = cssSize.height;

      // So aparece nas bordas do mapa, quando a camera mostra alem dos
      // limites do mundo - o resto da tela e coberto pela textura de chao.
      ctx.fillStyle = VOID_COLOR;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

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
        canvasWidth,
        canvasHeight,
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
        canvasWidth,
        canvasHeight,
        decorateWallTile,
      );
      renderTiles(
        ctx,
        regionData.hazards,
        HAZARD_COLOR,
        HAZARD_BORDER_COLOR,
        camera,
        canvasWidth,
        canvasHeight,
        decorateHazardTile,
      );
      renderTiles(
        ctx,
        regionData.sealed,
        SEALED_COLOR,
        SEALED_BORDER_COLOR,
        camera,
        canvasWidth,
        canvasHeight,
        decorateSealedTile,
      );
      renderDecorations(
        ctx,
        activeObjects,
        camera,
        canvasWidth,
        canvasHeight,
      );
      renderInteractables(
        ctx,
        activeObjects,
        activatedInteractablesRef.current,
        nearestInteractableRef.current?.id ?? null,
        (puzzleId) => puzzleProgressRef.current.get(puzzleId) ?? [],
        useGameStore.getState().solvedPuzzles,
        useGameStore.getState().installedUpgrades.has('deep-scanner'),
        camera,
        canvasWidth,
        canvasHeight,
      );
      renderScannables(
        ctx,
        activeObjects,
        nearestScannableRef.current?.id ?? null,
        useGameStore.getState().installedUpgrades.has('deep-scanner'),
        camera,
        canvasWidth,
        canvasHeight,
      );
      renderParticles(
        ctx,
        particlesRef.current,
        camera,
        canvasWidth,
        canvasHeight,
      );

      const screenPosition = worldToScreen(
        renderPosition,
        camera,
        canvasWidth,
        canvasHeight,
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
        useUiStore.getState().isScannerActive,
      );

      const transition = transitionRef.current;
      if (transition.phase !== 'idle') {
        const fadeAlpha =
          transition.phase === 'out'
            ? Math.min(transition.progress, 1)
            : Math.max(1 - transition.progress, 0);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    },
  });

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <TouchControls inputRef={inputRef} />
    </div>
  );
}
