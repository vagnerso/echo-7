import { describe, expect, it } from 'vitest';

import type { WorldObject } from '@/world/region';

import { findNearestInteractable } from './interactionSystem';

function interactable(id: string, x: number, y: number): WorldObject {
  return { id, interactable: true, position: { x, y } };
}

function decoration(id: string, x: number, y: number): WorldObject {
  return { id, position: { x, y } };
}

describe('findNearestInteractable', () => {
  it('retorna o objeto quando esta dentro do alcance', () => {
    const objects = [interactable('console-01', 110, 100)];

    const found = findNearestInteractable({ x: 100, y: 100 }, objects, 20);

    expect(found?.id).toBe('console-01');
  });

  it('retorna null quando o objeto esta fora do alcance', () => {
    const objects = [interactable('console-01', 200, 100)];

    const found = findNearestInteractable({ x: 100, y: 100 }, objects, 20);

    expect(found).toBeNull();
  });

  it('ignora objetos de decoracao mesmo que estejam perto', () => {
    const objects = [decoration('deco-01', 105, 100)];

    const found = findNearestInteractable({ x: 100, y: 100 }, objects, 20);

    expect(found).toBeNull();
  });

  it('retorna o mais proximo quando ha varios objetos dentro do alcance', () => {
    const objects = [
      interactable('longe', 100, 130),
      interactable('perto', 100, 110),
    ];

    const found = findNearestInteractable({ x: 100, y: 100 }, objects, 50);

    expect(found?.id).toBe('perto');
  });

  it('ignora objeto que exige um puzzle ainda nao resolvido', () => {
    const objects: WorldObject[] = [
      {
        id: 'reward-01',
        interactable: true,
        position: { x: 105, y: 100 },
        requiresPuzzleSolved: 'ruins-puzzle-01',
      },
    ];

    const found = findNearestInteractable({ x: 100, y: 100 }, objects, 20);

    expect(found).toBeNull();
  });

  it('detecta o objeto quando o puzzle exigido ja esta resolvido', () => {
    const objects: WorldObject[] = [
      {
        id: 'reward-01',
        interactable: true,
        position: { x: 105, y: 100 },
        requiresPuzzleSolved: 'ruins-puzzle-01',
      },
    ];

    const found = findNearestInteractable(
      { x: 100, y: 100 },
      objects,
      20,
      new Set(['ruins-puzzle-01']),
    );

    expect(found?.id).toBe('reward-01');
  });

  it('ignora objeto interagivel que exige o Deep Scanner ainda nao instalado', () => {
    const objects: WorldObject[] = [
      {
        id: 'hidden-entrance',
        interactable: true,
        requiresDeepScanner: true,
        position: { x: 105, y: 100 },
      },
    ];

    const found = findNearestInteractable({ x: 100, y: 100 }, objects, 20);

    expect(found).toBeNull();
  });

  it('detecta o objeto que exige Deep Scanner quando ja instalado', () => {
    const objects: WorldObject[] = [
      {
        id: 'hidden-entrance',
        interactable: true,
        requiresDeepScanner: true,
        position: { x: 105, y: 100 },
      },
    ];

    const found = findNearestInteractable(
      { x: 100, y: 100 },
      objects,
      20,
      undefined,
      true,
    );

    expect(found?.id).toBe('hidden-entrance');
  });
});
