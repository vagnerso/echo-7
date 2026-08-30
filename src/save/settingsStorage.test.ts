import { describe, expect, it } from 'vitest';

import type { StorageLike } from './saveGame';
import { loadSettings, saveSettings, type Settings } from './settingsStorage';

function createFakeStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe('saveSettings/loadSettings', () => {
  it('retorna null quando nao ha nada salvo', () => {
    const storage = createFakeStorage();

    expect(loadSettings(storage)).toBeNull();
  });

  it('salva e recarrega as preferencias corretamente', () => {
    const storage = createFakeStorage();
    const settings: Settings = { locale: 'pt-BR', robotColor: 'amber' };

    saveSettings(settings, storage);

    expect(loadSettings(storage)).toEqual(settings);
  });

  it('usa a cor padrao quando o arquivo salvo e de antes de robotColor existir', () => {
    const storage = createFakeStorage();
    storage.setItem(
      'echo7-settings',
      JSON.stringify({ version: 1, locale: 'en' }),
    );

    expect(loadSettings(storage)).toEqual({ locale: 'en', robotColor: 'cyan' });
  });

  it('retorna null para um formato de versao incompativel', () => {
    const storage = createFakeStorage();
    storage.setItem('echo7-settings', JSON.stringify({ version: 999 }));

    expect(loadSettings(storage)).toBeNull();
  });

  it('retorna null para JSON invalido, sem lancar excecao', () => {
    const storage = createFakeStorage();
    storage.setItem('echo7-settings', '{ invalido');

    expect(loadSettings(storage)).toBeNull();
  });

  it('funcoes sem storage disponivel nao lancam excecao', () => {
    expect(() =>
      saveSettings({ locale: 'en', robotColor: 'cyan' }, null),
    ).not.toThrow();
    expect(loadSettings(null)).toBeNull();
  });
});
