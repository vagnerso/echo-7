import { describe, expect, it } from 'vitest';

import type { InventoryItem } from '@/entities/inventoryItem';

import { findInstallableUpgrades } from './upgradeSystem';

function item(id: string, quantity: number): InventoryItem {
  return { id, type: 'component', stackable: true, quantity };
}

describe('findInstallableUpgrades', () => {
  it('retorna vazio se o inventario nao tem o componente necessario', () => {
    const result = findInstallableUpgrades([], new Set());

    expect(result).toEqual([]);
  });

  it('retorna os upgrades cujo componente esta disponivel em quantidade suficiente', () => {
    const inventory = [item('ancient-component', 1)];

    const result = findInstallableUpgrades(inventory, new Set());

    expect(result.map((u) => u.id)).toEqual(
      expect.arrayContaining(['deep-scanner', 'magnetic-boots']),
    );
  });

  it('nao retorna um upgrade que ja esta instalado', () => {
    const inventory = [item('ancient-component', 1)];

    const result = findInstallableUpgrades(
      inventory,
      new Set(['deep-scanner']),
    );

    expect(result.map((u) => u.id)).not.toContain('deep-scanner');
    expect(result.map((u) => u.id)).toContain('magnetic-boots');
  });

  it('nao retorna um upgrade se a quantidade do componente for insuficiente', () => {
    const inventory = [item('ancient-component', 0)];

    const result = findInstallableUpgrades(inventory, new Set());

    expect(result).toEqual([]);
  });
});
