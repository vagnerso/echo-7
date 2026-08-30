import { describe, expect, it } from 'vitest';

import type { WorldObject } from '@/world/region';

import {
  createDiscoveryFromObject,
  findNearestScannable,
} from './scannerSystem';

function scannable(id: string, x: number, y: number): WorldObject {
  return {
    id,
    scannable: true,
    position: { x, y },
    scanInfo: {
      label: 'UNKNOWN STRUCTURE',
      age: '~8,000 years',
      material: 'UNKNOWN',
    },
  };
}

function interactableOnly(id: string, x: number, y: number): WorldObject {
  return { id, interactable: true, position: { x, y } };
}

function hiddenSignal(id: string, x: number, y: number): WorldObject {
  return {
    id,
    scannable: true,
    position: { x, y },
    scanInfo: { label: 'HIDDEN SIGNAL', requiresDeepScanner: true },
  };
}

describe('findNearestScannable', () => {
  it('retorna o objeto quando esta dentro do alcance', () => {
    const objects = [scannable('structure-01', 120, 100)];

    const found = findNearestScannable({ x: 100, y: 100 }, objects, 50);

    expect(found?.id).toBe('structure-01');
  });

  it('retorna null quando o objeto esta fora do alcance', () => {
    const objects = [scannable('structure-01', 300, 100)];

    const found = findNearestScannable({ x: 100, y: 100 }, objects, 50);

    expect(found).toBeNull();
  });

  it('ignora objetos que so sao interagiveis, nao escaneaveis', () => {
    const objects = [interactableOnly('console-01', 105, 100)];

    const found = findNearestScannable({ x: 100, y: 100 }, objects, 50);

    expect(found).toBeNull();
  });

  it('retorna o mais proximo quando ha varios objetos dentro do alcance', () => {
    const objects = [
      scannable('longe', 100, 140),
      scannable('perto', 100, 110),
    ];

    const found = findNearestScannable({ x: 100, y: 100 }, objects, 150);

    expect(found?.id).toBe('perto');
  });

  it('ignora objetos que exigem deep scanner quando hasDeepScanner e false', () => {
    const objects = [hiddenSignal('hidden-01', 110, 100)];

    const found = findNearestScannable({ x: 100, y: 100 }, objects, 50, false);

    expect(found).toBeNull();
  });

  it('detecta objetos que exigem deep scanner quando hasDeepScanner e true', () => {
    const objects = [hiddenSignal('hidden-01', 110, 100)];

    const found = findNearestScannable({ x: 100, y: 100 }, objects, 50, true);

    expect(found?.id).toBe('hidden-01');
  });
});

describe('createDiscoveryFromObject', () => {
  it('cria uma discovery a partir do scanInfo do objeto', () => {
    const object = scannable('structure-01', 0, 0);

    const discovery = createDiscoveryFromObject(object, 'region-1');

    expect(discovery).toEqual({
      id: 'discovery-structure-01',
      objectId: 'structure-01',
      label: 'UNKNOWN STRUCTURE',
      age: '~8,000 years',
      material: 'UNKNOWN',
      scannedAt: 'region-1',
    });
  });

  it('retorna null se o objeto nao tiver scanInfo', () => {
    const object = interactableOnly('console-01', 0, 0);

    expect(createDiscoveryFromObject(object, 'region-1')).toBeNull();
  });
});
