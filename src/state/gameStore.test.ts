import { beforeEach, describe, expect, it } from 'vitest';

import type { Discovery } from '@/entities/discovery';

import { useGameStore } from './gameStore';

function discovery(id: string): Discovery {
  return { id, objectId: id, label: 'TEST OBJECT', scannedAt: 'region-1' };
}

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      discoveries: [],
      inventory: [],
      inventoryCapacity: 5,
    });
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

  it('adiciona um item novo com quantidade padrao 1', () => {
    const added = useGameStore.getState().addItem({
      id: 'energy-cell',
      type: 'resource',
      name: 'Energy Cell',
      stackable: true,
    });

    expect(added).toBe(true);
    expect(useGameStore.getState().inventory).toEqual([
      {
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
        quantity: 1,
      },
    ]);
  });

  it('empilha quantidade ao adicionar um item ja existente e empilhavel', () => {
    useGameStore
      .getState()
      .addItem({
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
      });
    useGameStore
      .getState()
      .addItem({
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
      });

    expect(useGameStore.getState().inventory).toHaveLength(1);
    expect(useGameStore.getState().inventory[0]?.quantity).toBe(2);
  });

  it('recusa um item nao empilhavel ja existente', () => {
    useGameStore
      .getState()
      .addItem({
        id: 'artifact',
        type: 'quest',
        name: 'Artifact',
        stackable: false,
      });
    const added = useGameStore
      .getState()
      .addItem({
        id: 'artifact',
        type: 'quest',
        name: 'Artifact',
        stackable: false,
      });

    expect(added).toBe(false);
    expect(useGameStore.getState().inventory[0]?.quantity).toBe(1);
  });

  it('recusa um item de tipo novo quando a capacidade de slots esta cheia', () => {
    useGameStore.setState({ inventoryCapacity: 2 });
    useGameStore
      .getState()
      .addItem({ id: 'a', type: 'resource', name: 'A', stackable: true });
    useGameStore
      .getState()
      .addItem({ id: 'b', type: 'resource', name: 'B', stackable: true });

    const added = useGameStore
      .getState()
      .addItem({ id: 'c', type: 'resource', name: 'C', stackable: true });

    expect(added).toBe(false);
    expect(useGameStore.getState().inventory).toHaveLength(2);
  });

  it('empilhar um item existente nao consome um slot novo, mesmo cheio', () => {
    useGameStore.setState({ inventoryCapacity: 1 });
    useGameStore
      .getState()
      .addItem({
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
      });

    const added = useGameStore
      .getState()
      .addItem({
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
      });

    expect(added).toBe(true);
    expect(useGameStore.getState().inventory[0]?.quantity).toBe(2);
  });

  it('removeItem reduz a quantidade e remove o item quando chega a zero', () => {
    useGameStore
      .getState()
      .addItem({
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
        quantity: 3,
      });

    useGameStore.getState().removeItem('energy-cell', 1);
    expect(useGameStore.getState().inventory[0]?.quantity).toBe(2);

    useGameStore.getState().removeItem('energy-cell', 2);
    expect(useGameStore.getState().inventory).toHaveLength(0);
  });
});
