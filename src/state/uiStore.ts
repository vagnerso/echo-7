import { create } from 'zustand';

import type { Discovery } from '@/entities/discovery';
import type { MemoryFragment } from '@/entities/memoryFragment';

interface UiState {
  isScannerActive: boolean;
  toggleScanner: () => void;
  /** Objeto que o scanner esta mostrando agora (null se nada em alcance ou scanner desligado). */
  currentScanTarget: Discovery | null;
  setCurrentScanTarget: (target: Discovery | null) => void;

  isInventoryOpen: boolean;
  toggleInventory: () => void;

  /** Fragmento sendo exibido agora (aparece por alguns segundos ao coletar). */
  activeFragmentReveal: MemoryFragment | null;
  setActiveFragmentReveal: (fragment: MemoryFragment | null) => void;

  /** Restaura o estado de UI ao comecar um NEW GAME (Fase 8). */
  resetUi: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isScannerActive: false,
  toggleScanner: () =>
    set((state) => ({ isScannerActive: !state.isScannerActive })),
  currentScanTarget: null,
  setCurrentScanTarget: (target) => set({ currentScanTarget: target }),

  isInventoryOpen: false,
  toggleInventory: () =>
    set((state) => ({ isInventoryOpen: !state.isInventoryOpen })),

  activeFragmentReveal: null,
  setActiveFragmentReveal: (fragment) =>
    set({ activeFragmentReveal: fragment }),

  resetUi: () =>
    set({
      isScannerActive: false,
      currentScanTarget: null,
      isInventoryOpen: false,
      activeFragmentReveal: null,
    }),
}));
