import { useEffect, useRef } from 'react';

import { MEMORY_FRAGMENTS } from '@/content/fragments';
import { PUZZLES } from '@/content/puzzles';
import { REGIONS } from '@/content/regions';
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
import { saveGame } from '@/save/saveGame';
import { useGameStore } from '@/state/gameStore';
import { useUiStore } from '@/state/uiStore';
import type { Region, WorldObject } from '@/world/region';
import {
  getHazardTiles,
  getRegionObstacles,
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

const PLAYER_COLOR = '#5ee6c8';
const WALL_COLOR = 'rgba(94, 230, 200, 0.12)';
const WALL_BORDER_COLOR = 'rgba(94, 230, 200, 0.4)';
const HAZARD_COLOR = 'rgba(230, 120, 90, 0.18)';
const HAZARD_BORDER_COLOR = 'rgba(230, 120, 90, 0.6)';
const SEALED_COLOR = 'rgba(170, 120, 230, 0.18)';
const SEALED_BORDER_COLOR = 'rgba(170, 120, 230, 0.6)';
const DECORATION_COLOR = 'rgba(216, 219, 226, 0.5)';
const INTERACTABLE_COLOR = 'rgba(230, 170, 94, 0.7)';
const INTERACTABLE_ACTIVATED_COLOR = 'rgba(94, 230, 140, 0.8)';
const COLLECTIBLE_COLOR = 'rgba(240, 210, 90, 0.85)';
const EXIT_COLOR = 'rgba(150, 170, 240, 0.8)';
const SWITCH_COLOR = 'rgba(170, 120, 230, 0.6)';
const SWITCH_ACTIVE_COLOR = 'rgba(200, 160, 255, 0.95)';
const HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.9)';
const SCANNABLE_COLOR = 'rgba(120, 170, 255, 0.7)';
const MEMORY_FRAGMENT_COLOR = 'rgba(230, 130, 200, 0.85)';

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  screenPosition: Vector2,
  facing: Player['facing'],
  size: Vector2,
): void {
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(
    screenPosition.x - size.x / 2,
    screenPosition.y - size.y / 2,
    size.x,
    size.y,
  );

  // Marcador simples indicando para onde o ECHO-7 esta olhando - placeholder
  // ate existir sprite de verdade (nenhuma fase do MVP inclui arte final;
  // ficaria para um pipeline de assets futuro, fora do escopo atual).
  const markerOffset = size.x / 2 + 6;
  const markerPosition: Vector2 = { ...screenPosition };
  if (facing === 'up') markerPosition.y -= markerOffset;
  if (facing === 'down') markerPosition.y += markerOffset;
  if (facing === 'left') markerPosition.x -= markerOffset;
  if (facing === 'right') markerPosition.x += markerOffset;

  ctx.fillStyle = '#0b0d12';
  ctx.beginPath();
  ctx.arc(markerPosition.x, markerPosition.y, 4, 0, Math.PI * 2);
  ctx.fill();
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

function renderDecorations(
  ctx: CanvasRenderingContext2D,
  objects: readonly WorldObject[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.fillStyle = DECORATION_COLOR;

  for (const object of objects) {
    if (object.interactable || object.scannable) continue;

    const screenPosition = worldToScreen(
      object.position,
      camera,
      canvasWidth,
      canvasHeight,
    );
    ctx.beginPath();
    ctx.arc(screenPosition.x, screenPosition.y, 6, 0, Math.PI * 2);
    ctx.fill();
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
    if (object.scanInfo?.requiresDeepScanner && !hasDeepScanner) continue;

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
      useGameStore.getState().setObjective('Investigate the Ancient Ruins.');
    } else if (toRegionId === 'region-3') {
      useGameStore.getState().setObjective('Activate the Signal Core.');
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
                useGameStore
                  .getState()
                  .setObjective('Find a way to the Signal Core.');
              } else if (puzzleId === 'signal-core-puzzle') {
                useGameStore.getState().setObjective('Approach the Core.');
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

      ctx.fillStyle = '#12141c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const player = playerRef.current;
      const previous = previousPositionRef.current;
      const renderPosition: Vector2 = {
        x: previous.x + (player.position.x - previous.x) * alpha,
        y: previous.y + (player.position.y - previous.y) * alpha,
      };

      const camera = cameraRef.current;
      updateCameraFollow(camera, renderPosition);

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
      renderPlayer(ctx, screenPosition, player.facing, player.size);

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
