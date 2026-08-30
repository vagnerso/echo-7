import { describe, expect, it } from 'vitest';

import type { WorldObject } from '@/world/region';

import { findNearestInteractable } from './interactionSystem';

function interactable(id: string, x: number, y: number): WorldObject {
  return { id, kind: 'interactable', position: { x, y } };
}

function decoration(id: string, x: number, y: number): WorldObject {
  return { id, kind: 'decoration', position: { x, y } };
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
});
