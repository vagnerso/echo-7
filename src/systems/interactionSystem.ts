import type { Vector2 } from '@/entities/player';
import type { WorldObject } from '@/world/region';

export const INTERACTION_RANGE = 56;

/**
 * Retorna o objeto interagivel mais proximo dentro do alcance, ou null se
 * nenhum estiver. Ignora objetos de decoracao, objetos que exigem um puzzle
 * ainda nao resolvido (requiresPuzzleSolved) e objetos que exigem o Deep
 * Scanner ainda nao instalado (requiresDeepScanner) - um objeto "escondido"
 * (ex: entrada secreta so revelada ao escanear) nao deveria responder a
 * interacao antes de o jogador conseguir detecta-lo, mesmo que ele ja saiba
 * a posicao exata por algum outro meio.
 */
export function findNearestInteractable(
  playerPosition: Vector2,
  objects: readonly WorldObject[],
  range: number = INTERACTION_RANGE,
  solvedPuzzles: ReadonlySet<string> = new Set(),
  hasDeepScanner = false,
): WorldObject | null {
  let nearest: WorldObject | null = null;
  let nearestDistance = Infinity;

  for (const object of objects) {
    if (!object.interactable) continue;
    if (
      object.requiresPuzzleSolved &&
      !solvedPuzzles.has(object.requiresPuzzleSolved)
    ) {
      continue;
    }
    if (object.requiresDeepScanner && !hasDeepScanner) continue;

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
