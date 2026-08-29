import { useEffect, useRef } from 'react';

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
import { updatePlayerMovement } from '@/systems/movementSystem';

import styles from './GameCanvas.module.css';

const PLAYER_COLOR = '#5ee6c8';

// Obstaculos fixos so para provar visualmente que a colisao funciona antes
// de existir mundo/mapa de verdade. Serao substituidos pelos obstaculos
// reais de cada regiao na Fase 3.
const DEBUG_OBSTACLES: readonly AABB[] = [
  { x: 350, y: 100, width: 150, height: 300 },
];
const OBSTACLE_COLOR = 'rgba(94, 230, 200, 0.12)';
const OBSTACLE_BORDER_COLOR = 'rgba(94, 230, 200, 0.4)';

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

function renderObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: readonly AABB[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  for (const obstacle of obstacles) {
    const screenTopLeft = worldToScreen(
      { x: obstacle.x, y: obstacle.y },
      camera,
      canvasWidth,
      canvasHeight,
    );

    ctx.fillStyle = OBSTACLE_COLOR;
    ctx.strokeStyle = OBSTACLE_BORDER_COLOR;
    ctx.fillRect(
      screenTopLeft.x,
      screenTopLeft.y,
      obstacle.width,
      obstacle.height,
    );
    ctx.strokeRect(
      screenTopLeft.x,
      screenTopLeft.y,
      obstacle.width,
      obstacle.height,
    );
  }
}

const GRID_CELL_SIZE = 100;
const GRID_COLOR = 'rgba(255, 255, 255, 0.06)';

/**
 * Grade em coordenadas de mundo so para provar visualmente que a camera
 * translada o mundo de verdade (sem ela, o jogador sempre aparece no centro
 * da tela e fica impossivel notar a diferenca entre "camera funcionando" e
 * "nada sendo transformado"). Sera substituida pelo mapa real na Fase 3.
 */
function renderDebugGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;

  const startX =
    Math.floor((camera.position.x - canvasWidth / 2) / GRID_CELL_SIZE) *
    GRID_CELL_SIZE;
  const endX = camera.position.x + canvasWidth / 2;
  for (let worldX = startX; worldX <= endX; worldX += GRID_CELL_SIZE) {
    const { x } = worldToScreen(
      { x: worldX, y: 0 },
      camera,
      canvasWidth,
      canvasHeight,
    );
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  const startY =
    Math.floor((camera.position.y - canvasHeight / 2) / GRID_CELL_SIZE) *
    GRID_CELL_SIZE;
  const endY = camera.position.y + canvasHeight / 2;
  for (let worldY = startY; worldY <= endY; worldY += GRID_CELL_SIZE) {
    const { y } = worldToScreen(
      { x: 0, y: worldY },
      camera,
      canvasWidth,
      canvasHeight,
    );
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player>(createPlayer({ x: 200, y: 200 }));
  const previousPositionRef = useRef<Vector2>({ x: 200, y: 200 });
  const cameraRef = useRef<Camera>(createCamera({ x: 200, y: 200 }));
  const inputRef = useRef<InputManager | null>(null);

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

      const resolved = resolveCollisions(
        beforeMove,
        player.position,
        player.size,
        DEBUG_OBSTACLES,
      );
      player.position.x = resolved.x;
      player.position.y = resolved.y;
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

      renderDebugGrid(ctx, camera, canvas.width, canvas.height);
      renderObstacles(
        ctx,
        DEBUG_OBSTACLES,
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
