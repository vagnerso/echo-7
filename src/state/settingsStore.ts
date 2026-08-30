import { create } from 'zustand';

import {
  DEFAULT_LOCALE,
  DEFAULT_ROBOT_COLOR,
  type Locale,
  type RobotColorKey,
} from '@/i18n';
import { loadSettings } from '@/save/settingsStorage';

interface SettingsState {
  locale: Locale;
  robotColor: RobotColorKey;
  setLocale: (locale: Locale) => void;
  setRobotColor: (color: RobotColorKey) => void;
}

// Le o localStorage uma unica vez, ao carregar o modulo (sincrono) - assim a
// tela inicial ja nasce nas preferencias salvas, sem um frame com o padrao
// antes de um useEffect aplicar a preferencia. A persistencia da mudanca
// (escrita) fica a cargo de App.tsx, que assina o store - mesmo padrao ja
// usado para o autosave de progresso em gameStore/GameCanvas.
const persisted = loadSettings();

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: persisted?.locale ?? DEFAULT_LOCALE,
  robotColor: persisted?.robotColor ?? DEFAULT_ROBOT_COLOR,
  setLocale: (locale) => set({ locale }),
  setRobotColor: (robotColor) => set({ robotColor }),
}));
