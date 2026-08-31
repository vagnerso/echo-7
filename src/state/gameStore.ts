import { create } from 'zustand';

import type { Discovery } from '@/entities/discovery';
import type { InventoryItem } from '@/entities/inventoryItem';
import type { ObjectiveKey } from '@/i18n';

const DEFAULT_INVENTORY_CAPACITY = 5;

interface GameProgress {
  discoveries: Discovery[];
  inventory: InventoryItem[];
  inventoryCapacity: number;
  installedUpgrades: ReadonlySet<string>;
  // 'region-1' precisa bater com LANDING_ZONE.id (content/regions.ts) - o
  // valor fica hardcoded aqui, nao importado de content/, para state/ nao
  // depender dos dados de conteudo do jogo.
  currentRegionId: string;
  solvedPuzzles: ReadonlySet<string>;
  collectedFragments: ReadonlySet<string>;
  // Chave de traducao (src/i18n), nao a sentenca em si - MissionHUD resolve
  // o texto no idioma atual via t.objectives[currentObjective].
  currentObjective: ObjectiveKey;
  hasReachedEnding: boolean;
  /** v3.0 - true depois que os dois fragmentos de The Buried Chord (region-6) sao coletados. Independente de hasReachedEnding (o final original nao muda). */
  hasCompletedEpilogue: boolean;
}

function createInitialProgress(): GameProgress {
  return {
    discoveries: [],
    inventory: [],
    inventoryCapacity: DEFAULT_INVENTORY_CAPACITY,
    installedUpgrades: new Set<string>(),
    currentRegionId: 'region-1',
    solvedPuzzles: new Set<string>(),
    collectedFragments: new Set<string>(),
    currentObjective: 'exploreLandingZone',
    hasReachedEnding: false,
    hasCompletedEpilogue: false,
  };
}

interface GameState extends GameProgress {
  addDiscovery: (discovery: Discovery) => void;

  /** Adiciona o item (empilhando se ja existir); retorna false se nao coube (slot novo, sem capacidade). */
  addItem: (
    item: Omit<InventoryItem, 'quantity'> & { quantity?: number },
  ) => boolean;
  removeItem: (id: string, quantity?: number) => void;

  installUpgrade: (id: string) => void;

  setCurrentRegion: (regionId: string) => void;

  markPuzzleSolved: (id: string) => void;

  collectFragment: (id: string) => void;

  setObjective: (key: ObjectiveKey) => void;

  triggerEnding: () => void;

  completeEpilogue: () => void;

  /** Restaura todo o progresso para o estado inicial - usado ao comecar um NEW GAME (Fase 8), ja que ainda nao ha save/load. */
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialProgress(),

  addDiscovery: (discovery) => {
    const alreadyDiscovered = get().discoveries.some(
      (existing) => existing.id === discovery.id,
    );
    if (alreadyDiscovered) return;

    set((state) => ({ discoveries: [...state.discoveries, discovery] }));
  },

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

  installUpgrade: (id) => {
    set((state) => {
      if (state.installedUpgrades.has(id)) return state;

      const next = new Set(state.installedUpgrades);
      next.add(id);
      return { installedUpgrades: next };
    });
  },

  setCurrentRegion: (regionId) => set({ currentRegionId: regionId }),

  markPuzzleSolved: (id) => {
    set((state) => {
      if (state.solvedPuzzles.has(id)) return state;

      const next = new Set(state.solvedPuzzles);
      next.add(id);
      return { solvedPuzzles: next };
    });
  },

  collectFragment: (id) => {
    set((state) => {
      if (state.collectedFragments.has(id)) return state;

      const next = new Set(state.collectedFragments);
      next.add(id);
      return { collectedFragments: next };
    });
  },

  setObjective: (key) => set({ currentObjective: key }),

  triggerEnding: () => set({ hasReachedEnding: true }),

  completeEpilogue: () => set({ hasCompletedEpilogue: true }),

  resetGame: () => set(createInitialProgress()),
}));
