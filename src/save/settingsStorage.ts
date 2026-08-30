import type { Locale } from '@/i18n';

import type { StorageLike } from './saveGame';

const SETTINGS_KEY = 'echo7-settings';
const SETTINGS_VERSION = 1;

/**
 * Preferencias do dispositivo/jogador (idioma, futuramente cor do robo) -
 * separadas do save de progresso (saveGame.ts) de proposito: nao devem ser
 * apagadas por NEW GAME nem fazer parte do versionamento de progresso.
 */
export interface Settings {
  locale: Locale;
}

interface SettingsData extends Settings {
  version: number;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export function saveSettings(
  settings: Settings,
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) return;

  const data: SettingsData = { version: SETTINGS_VERSION, ...settings };
  storage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

/** Retorna as preferencias salvas, ou null se nao houver nenhuma ou o formato for incompativel (versao diferente). */
export function loadSettings(
  storage: StorageLike | null = getDefaultStorage(),
): Settings | null {
  if (!storage) return null;

  const raw = storage.getItem(SETTINGS_KEY);
  if (!raw) return null;

  let data: SettingsData;
  try {
    data = JSON.parse(raw) as SettingsData;
  } catch {
    return null;
  }

  if (data.version !== SETTINGS_VERSION) return null;

  return { locale: data.locale };
}
