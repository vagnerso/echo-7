import { beforeEach, describe, expect, it } from 'vitest';

import type { Discovery } from '@/entities/discovery';

import { useGameStore } from './gameStore';

function discovery(id: string): Discovery {
  return { id, objectId: id, label: 'TEST OBJECT', scannedAt: 'region-1' };
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({ discoveries: [] });
  });

  it('adiciona uma nova discovery', () => {
    useGameStore.getState().addDiscovery(discovery('a'));

    expect(useGameStore.getState().discoveries).toHaveLength(1);
  });

  it('nao duplica uma discovery ja registrada', () => {
    useGameStore.getState().addDiscovery(discovery('a'));
    useGameStore.getState().addDiscovery(discovery('a'));

    expect(useGameStore.getState().discoveries).toHaveLength(1);
  });

  it('acumula discoveries diferentes', () => {
    useGameStore.getState().addDiscovery(discovery('a'));
    useGameStore.getState().addDiscovery(discovery('b'));

    expect(useGameStore.getState().discoveries.map((d) => d.id)).toEqual([
      'a',
      'b',
    ]);
  });
});
