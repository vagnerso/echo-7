import { beforeEach, describe, expect, it } from 'vitest';

import { useGameStore } from '@/state/gameStore';

import { hasSaveGame, loadGame, saveGame, type StorageLike } from './saveGame';

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

describe('saveGame/loadGame', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('hasSaveGame retorna false quando nao ha nada salvo', () => {
    const storage = createFakeStorage();

    expect(hasSaveGame(storage)).toBe(false);
  });

  it('salva e recarrega o progresso corretamente', () => {
    const storage = createFakeStorage();

    useGameStore.getState().setCurrentRegion('region-2');
    useGameStore.getState().markPuzzleSolved('ruins-puzzle-01');
    useGameStore.getState().collectFragment('fragment-01');
    useGameStore.getState().installUpgrade('deep-scanner');
    useGameStore
      .getState()
      .addItem({
        id: 'energy-cell',
        type: 'resource',
        name: 'Energy Cell',
        stackable: true,
      });
    useGameStore.getState().setObjective('Investigate the Ancient Ruins.');

    saveGame(storage);
    expect(hasSaveGame(storage)).toBe(true);

    useGameStore.getState().resetGame();
    expect(useGameStore.getState().currentRegionId).toBe('region-1');

    const loaded = loadGame(storage);

    expect(loaded).toBe(true);
    expect(useGameStore.getState().currentRegionId).toBe('region-2');
    expect(useGameStore.getState().solvedPuzzles.has('ruins-puzzle-01')).toBe(
      true,
    );
    expect(useGameStore.getState().collectedFragments.has('fragment-01')).toBe(
      true,
    );
    expect(useGameStore.getState().installedUpgrades.has('deep-scanner')).toBe(
      true,
    );
    expect(useGameStore.getState().inventory).toHaveLength(1);
    expect(useGameStore.getState().currentObjective).toBe(
      'Investigate the Ancient Ruins.',
    );
  });

  it('loadGame retorna false quando nao ha save', () => {
    const storage = createFakeStorage();

    expect(loadGame(storage)).toBe(false);
  });

  it('loadGame retorna false para um save de versao incompativel', () => {
    const storage = createFakeStorage();
    storage.setItem('echo7-save', JSON.stringify({ version: 999 }));

    expect(loadGame(storage)).toBe(false);
  });

  it('loadGame retorna false para JSON invalido, sem lancar excecao', () => {
    const storage = createFakeStorage();
    storage.setItem('echo7-save', '{ invalido');

    expect(loadGame(storage)).toBe(false);
  });

  it('funcoes sem storage disponivel nao lancam excecao', () => {
    expect(() => saveGame(null)).not.toThrow();
    expect(loadGame(null)).toBe(false);
    expect(hasSaveGame(null)).toBe(false);
  });
});
