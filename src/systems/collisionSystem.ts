import type { Vector2 } from '@/entities/player';

/** Retangulo alinhado aos eixos, definido pelo canto superior esquerdo. */
export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function aabbFromCenter(center: Vector2, size: Vector2): AABB {
  return {
    x: center.x - size.x / 2,
    y: center.y - size.y / 2,
    width: size.x,
    height: size.y,
  };
}

export function intersects(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Resolve uma posicao proposta contra obstaculos estaticos, resolvendo os
 * eixos X e Y separadamente. Isso produz o efeito de "deslizar" ao longo de
 * uma parede quando o movimento e diagonal, em vez de travar o movimento
 * inteiro so porque um dos eixos colidiu.
 */
export function resolveCollisions(
  previousPosition: Vector2,
  proposedPosition: Vector2,
  size: Vector2,
  obstacles: readonly AABB[],
): Vector2 {
  const resolved: Vector2 = { ...previousPosition };

  const afterX: Vector2 = { x: proposedPosition.x, y: previousPosition.y };
  if (!collidesWithAny(afterX, size, obstacles)) {
    resolved.x = proposedPosition.x;
  }

  const afterY: Vector2 = { x: resolved.x, y: proposedPosition.y };
  if (!collidesWithAny(afterY, size, obstacles)) {
    resolved.y = proposedPosition.y;
  }

  return resolved;
}

function collidesWithAny(
  center: Vector2,
  size: Vector2,
  obstacles: readonly AABB[],
): boolean {
  const box = aabbFromCenter(center, size);
  return obstacles.some((obstacle) => intersects(box, obstacle));
}
