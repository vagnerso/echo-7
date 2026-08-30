import { useEffect, useRef } from 'react';

import { LANDING_ZONE } from '@/content/regions';
import {
  type Camera,
  createCamera,
  updateCameraFollow,
  worldToScreen,
} from '@/engine/camera';
import { computeCanvasSize } from '@/engine/canvasSize';
import { InputManager } from '@/engine/inputManager';
import { createPlayer, type Player, type Vector2 } from '@/entities/player';
import { useGameLoop } from '@/hooks/useGameLoop';
import type { AABB } from '@/systems/collisionSystem';
import { resolveCollisions } from '@/systems/collisionSystem';
import { findNearestInteractable } from '@/systems/interactionSystem';
import { updatePlayerMovement } from '@/systems/movementSystem';
import {
  createDiscoveryFromObject,
  findNearestScannable,
} from '@/systems/scannerSystem';
import { findInstallableUpgrades } from '@/systems/upgradeSystem';
import { useGameStore } from '@/state/gameStore';
import { useUiStore } from '@/state/uiStore';
import type { Region, WorldObject } from '@/world/region';
import { getHazardTiles, getRegionObstacles } from '@/world/worldLoader';

import styles from './GameCanvas.module.css';

const CURRENT_REGION: Region = LANDING_ZONE;
const REGION_OBSTACLES: readonly AABB[] = getRegionObstacles(CURRENT_REGION);
const HAZARD_TILES: readonly AABB[] = getHazardTiles(CURRENT_REGION);

const PLAYER_COLOR = '#5ee6c8';
const WALL_COLOR = 'rgba(94, 230, 200, 0.12)';
const WALL_BORDER_COLOR = 'rgba(94, 230, 200, 0.4)';
const HAZARD_COLOR = 'rgba(230, 120, 90, 0.18)';
const HAZARD_BORDER_COLOR = 'rgba(230, 120, 90, 0.6)';
const DECORATION_COLOR = 'rgba(216, 219, 226, 0.5)';
const INTERACTABLE_COLOR = 'rgba(230, 170, 94, 0.7)';
const INTERACTABLE_ACTIVATED_COLOR = 'rgba(94, 230, 140, 0.8)';
const COLLECTIBLE_COLOR = 'rgba(240, 210, 90, 0.85)';
const HIGHLIGHT_COLOR = 'rgba(255, 255, 255, 0.9)';
const SCANNABLE_COLOR = 'rgba(120, 170, 255, 0.7)';

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

  // Marcador simples indicando para onde o ECHO-7 esta olhando, ate existir
  // sprite de verdade (Fase 9).
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

function renderWalls(
  ctx: CanvasRenderingContext2D,
  walls: readonly AABB[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.fillStyle = WALL_COLOR;
  ctx.strokeStyle = WALL_BORDER_COLOR;

  for (const wall of walls) {
    const screenTopLeft = worldToScreen(
      { x: wall.x, y: wall.y },
      camera,
      canvasWidth,
      canvasHeight,
    );
    ctx.fillRect(screenTopLeft.x, screenTopLeft.y, wall.width, wall.height);
    ctx.strokeRect(screenTopLeft.x, screenTopLeft.y, wall.width, wall.height);
  }
}

function renderHazards(
  ctx: CanvasRenderingContext2D,
  hazards: readonly AABB[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.fillStyle = HAZARD_COLOR;
  ctx.strokeStyle = HAZARD_BORDER_COLOR;

  for (const hazard of hazards) {
    const screenTopLeft = worldToScreen(
      { x: hazard.x, y: hazard.y },
      camera,
      canvasWidth,
      canvasHeight,
    );
    ctx.fillRect(screenTopLeft.x, screenTopLeft.y, hazard.width, hazard.height);
    ctx.strokeRect(
      screenTopLeft.x,
      screenTopLeft.y,
      hazard.width,
      hazard.height,
    );
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

    if (object.collectible) {
      // Item coletavel: quadrado, para diferenciar de um interagivel fixo (console) ate ter arte de verdade (Fase 9).
      ctx.fillStyle = COLLECTIBLE_COLOR;
      ctx.fillRect(screenPosition.x - 8, screenPosition.y - 8, 16, 16);
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

    // Losango em vez de circulo: diferencia visualmente de interactable ate existir arte de verdade (Fase 9).
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

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player>(createPlayer({ x: 200, y: 200 }));
  const previousPositionRef = useRef<Vector2>({ x: 200, y: 200 });
  const cameraRef = useRef<Camera>(createCamera({ x: 200, y: 200 }));
  const inputRef = useRef<InputManager | null>(null);
  const nearestInteractableRef = useRef<WorldObject | null>(null);
  const nearestScannableRef = useRef<WorldObject | null>(null);
  const activatedInteractablesRef = useRef<Map<string, boolean>>(new Map());
  // Ids de objetos coletaveis ja recolhidos - somem do mundo (nao renderizam,
  // nao contam mais para interacao/scan). Content/regions.ts continua
  // imutavel; isso e estado de sessao, nao de conteudo.
  const collectedItemsRef = useRef<Set<string>>(new Set());

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

  useGameLoop({
    update: (dt) => {
      const input = inputRef.current;
      if (!input) return;

      const player = playerRef.current;
      const beforeMove = { ...player.position };
      previousPositionRef.current = beforeMove;

      updatePlayerMovement(player, input, dt);

      const hasMagneticBoots = useGameStore
        .getState()
        .installedUpgrades.has('magnetic-boots');
      const obstacles = hasMagneticBoots
        ? REGION_OBSTACLES
        : [...REGION_OBSTACLES, ...HAZARD_TILES];

      const resolved = resolveCollisions(
        beforeMove,
        player.position,
        player.size,
        obstacles,
      );
      player.position.x = resolved.x;
      player.position.y = resolved.y;

      const activeObjects = CURRENT_REGION.objects.filter(
        (object) => !collectedItemsRef.current.has(object.id),
      );

      const nearestInteractable = findNearestInteractable(
        player.position,
        activeObjects,
      );
      nearestInteractableRef.current = nearestInteractable;

      if (nearestInteractable && input.wasActionJustPressed('interact')) {
        if (nearestInteractable.collectible) {
          const added = useGameStore
            .getState()
            .addItem(nearestInteractable.collectible);
          if (added) {
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
          const activated = activatedInteractablesRef.current;
          activated.set(
            nearestInteractable.id,
            !activated.get(nearestInteractable.id),
          );
        }
      }

      if (input.wasActionJustPressed('scanner')) {
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
            CURRENT_REGION.id,
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

      const activeObjects = CURRENT_REGION.objects.filter(
        (object) => !collectedItemsRef.current.has(object.id),
      );

      renderWalls(ctx, REGION_OBSTACLES, camera, canvas.width, canvas.height);
      renderHazards(ctx, HAZARD_TILES, camera, canvas.width, canvas.height);
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

      const screenPosition = worldToScreen(
        renderPosition,
        camera,
        canvas.width,
        canvas.height,
      );
      renderPlayer(ctx, screenPosition, player.facing, player.size);
    },
  });

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
