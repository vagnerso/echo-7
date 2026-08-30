import { create } from 'zustand';

import { DEFAULT_LOCALE, type Locale } from '@/i18n';
import { loadSettings } from '@/save/settingsStorage';

interface SettingsState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// Le o localStorage uma unica vez, ao carregar o modulo (sincrono) - assim a
// tela inicial ja nasce no idioma salvo, sem um frame piscando em inglês
// antes de um useEffect aplicar a preferencia. A persistencia da mudanca
// (escrita) fica a cargo de App.tsx, que assina o store - mesmo padrao ja
// usado para o autosave de progresso em gameStore/GameCanvas.
export const useSettingsStore = create<SettingsState>((set) => ({
  locale: loadSettings()?.locale ?? DEFAULT_LOCALE,
  setLocale: (locale) => set({ locale }),
}));
