import { create } from 'zustand';

import type { Discovery } from '@/entities/discovery';

interface UiState {
  isScannerActive: boolean;
  toggleScanner: () => void;
  /** Objeto que o scanner esta mostrando agora (null se nada em alcance ou scanner desligado). */
  currentScanTarget: Discovery | null;
  setCurrentScanTarget: (target: Discovery | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isScannerActive: false,
  toggleScanner: () =>
    set((state) => ({ isScannerActive: !state.isScannerActive })),
  currentScanTarget: null,
  setCurrentScanTarget: (target) => set({ currentScanTarget: target }),
}));
