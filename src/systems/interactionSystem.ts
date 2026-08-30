import type { Vector2 } from '@/entities/player';
import type { WorldObject } from '@/world/region';

export const INTERACTION_RANGE = 56;

/** Retorna o objeto interagivel mais proximo dentro do alcance, ou null se nenhum estiver. Ignora objetos de decoracao. */
export function findNearestInteractable(
  playerPosition: Vector2,
  objects: readonly WorldObject[],
  range: number = INTERACTION_RANGE,
): WorldObject | null {
  let nearest: WorldObject | null = null;
  let nearestDistance = Infinity;

  for (const object of objects) {
    if (!object.interactable) continue;

    const distance = Math.hypot(
      object.position.x - playerPosition.x,
      object.position.y - playerPosition.y,
    );

    if (distance <= range && distance < nearestDistance) {
      nearest = object;
      nearestDistance = distance;
    }
  }

  return nearest;
}
