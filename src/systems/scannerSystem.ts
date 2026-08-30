import type { Vector2 } from '@/entities/player';
import type { Discovery } from '@/entities/discovery';
import type { WorldObject } from '@/world/region';

// Maior que o alcance de interacao (56): tematicamente, escanear alcanca
// mais longe do que tocar em algo.
export const SCAN_RANGE = 150;

/** Retorna o objeto escaneavel mais proximo dentro do alcance, ou null se nenhum estiver. */
export function findNearestScannable(
  playerPosition: Vector2,
  objects: readonly WorldObject[],
  range: number = SCAN_RANGE,
): WorldObject | null {
  let nearest: WorldObject | null = null;
  let nearestDistance = Infinity;

  for (const object of objects) {
    if (!object.scannable) continue;

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

/** Constroi uma Discovery a partir de um objeto escaneado. Retorna null se o objeto nao tiver scanInfo (nao deveria acontecer se scannable=true, mas evita quebrar em dado malformado). */
export function createDiscoveryFromObject(
  object: WorldObject,
  regionId: string,
): Discovery | null {
  if (!object.scanInfo) return null;

  return {
    id: `discovery-${object.id}`,
    objectId: object.id,
    label: object.scanInfo.label,
    age: object.scanInfo.age,
    material: object.scanInfo.material,
    scannedAt: regionId,
  };
}
