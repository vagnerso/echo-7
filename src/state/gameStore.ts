import { create } from 'zustand';

import type { Discovery } from '@/entities/discovery';

interface GameState {
  discoveries: Discovery[];
  addDiscovery: (discovery: Discovery) => void;
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
}));
