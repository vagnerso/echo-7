import { create } from 'zustand';

import type { Discovery } from '@/entities/discovery';
import type { InventoryItem } from '@/entities/inventoryItem';

const DEFAULT_INVENTORY_CAPACITY = 5;

interface GameState {
  discoveries: Discovery[];
  addDiscovery: (discovery: Discovery) => void;

  inventory: InventoryItem[];
  inventoryCapacity: number;
  /** Adiciona o item (empilhando se ja existir); retorna false se nao coube (slot novo, sem capacidade). */
  addItem: (
    item: Omit<InventoryItem, 'quantity'> & { quantity?: number },
  ) => boolean;
  removeItem: (id: string, quantity?: number) => void;

  installedUpgrades: ReadonlySet<string>;
  installUpgrade: (id: string) => void;

  currentRegionId: string;
  setCurrentRegion: (regionId: string) => void;

  solvedPuzzles: ReadonlySet<string>;
  markPuzzleSolved: (id: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  discoveries: [],
  addDiscovery: (discovery) => {
    const alreadyDiscovered = get().discoveries.some(
      (existing) => existing.id === discovery.id,
    );
    if (alreadyDiscovered) return;

    set((state) => ({ discoveries: [...state.discoveries, discovery] }));
  },

  inventory: [],
  inventoryCapacity: DEFAULT_INVENTORY_CAPACITY,
  addItem: (item) => {
    const { inventory, inventoryCapacity } = get();
    const quantityToAdd = item.quantity ?? 1;
    const existing = inventory.find((entry) => entry.id === item.id);

    if (existing) {
      if (!existing.stackable) return false;

      set({
        inventory: inventory.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + quantityToAdd }
            : entry,
        ),
      });
      return true;
    }

    if (inventory.length >= inventoryCapacity) return false;

    set({
      inventory: [...inventory, { ...item, quantity: quantityToAdd }],
    });
    return true;
  },
  removeItem: (id, quantity = 1) => {
    set((state) => {
      const existing = state.inventory.find((entry) => entry.id === id);
      if (!existing) return state;

      const remaining = existing.quantity - quantity;
      if (remaining <= 0) {
        return {
          inventory: state.inventory.filter((entry) => entry.id !== id),
        };
      }

      return {
        inventory: state.inventory.map((entry) =>
          entry.id === id ? { ...entry, quantity: remaining } : entry,
        ),
      };
    });
  },

  installedUpgrades: new Set<string>(),
  installUpgrade: (id) => {
    set((state) => {
      if (state.installedUpgrades.has(id)) return state;

      const next = new Set(state.installedUpgrades);
      next.add(id);
      return { installedUpgrades: next };
    });
  },

  // 'region-1' precisa bater com LANDING_ZONE.id (content/regions.ts) - o
  // valor fica hardcoded aqui, nao importado de content/, para state/ nao
  // depender dos dados de conteudo do jogo.
  currentRegionId: 'region-1',
  setCurrentRegion: (regionId) => set({ currentRegionId: regionId }),

  solvedPuzzles: new Set<string>(),
  markPuzzleSolved: (id) => {
    set((state) => {
      if (state.solvedPuzzles.has(id)) return state;

      const next = new Set(state.solvedPuzzles);
      next.add(id);
      return { solvedPuzzles: next };
    });
  },
}));
