import type { Vector2 } from '@/entities/player';

export interface Camera {
  /** Ponto do mundo que fica exatamente no centro da tela. */
  position: Vector2;
}

export function createCamera(position: Vector2 = { x: 0, y: 0 }): Camera {
  return { position: { ...position } };
}

/**
 * A camera nao tem suavizacao/lag por enquanto: centraliza exatamente na
 * posicao alvo a cada chamada. Damping fica para a Fase 9 (Polish), se
 * fizer falta visualmente.
 */
export function updateCameraFollow(
  camera: Camera,
  targetPosition: Vector2,
): void {
  camera.position.x = targetPosition.x;
  camera.position.y = targetPosition.y;
}

export function worldToScreen(
  worldPosition: Vector2,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): Vector2 {
  return {
    x: worldPosition.x - camera.position.x + canvasWidth / 2,
    y: worldPosition.y - camera.position.y + canvasHeight / 2,
  };
}
