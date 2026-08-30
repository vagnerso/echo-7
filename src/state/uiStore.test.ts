import { beforeEach, describe, expect, it } from 'vitest';

import { useUiStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      isScannerActive: false,
      currentScanTarget: null,
      isInventoryOpen: false,
      activeFragmentReveal: null,
    });
  });

  it('toggleScanner alterna o estado a cada chamada', () => {
    useUiStore.getState().toggleScanner();
    expect(useUiStore.getState().isScannerActive).toBe(true);

    useUiStore.getState().toggleScanner();
    expect(useUiStore.getState().isScannerActive).toBe(false);
  });

  it('setCurrentScanTarget atualiza o alvo atual', () => {
    const target = {
      id: 'discovery-a',
      objectId: 'a',
      label: 'TEST',
      scannedAt: 'region-1',
    };

    useUiStore.getState().setCurrentScanTarget(target);
    expect(useUiStore.getState().currentScanTarget).toEqual(target);

    useUiStore.getState().setCurrentScanTarget(null);
    expect(useUiStore.getState().currentScanTarget).toBeNull();
  });

  it('toggleInventory alterna o estado a cada chamada', () => {
    useUiStore.getState().toggleInventory();
    expect(useUiStore.getState().isInventoryOpen).toBe(true);

    useUiStore.getState().toggleInventory();
    expect(useUiStore.getState().isInventoryOpen).toBe(false);
  });

  it('setActiveFragmentReveal atualiza o fragmento em exibicao', () => {
    const fragment = {
      id: 'fragment-01',
      regionId: 'region-1',
      corruption: 50,
      text: 'test',
    };

    useUiStore.getState().setActiveFragmentReveal(fragment);
    expect(useUiStore.getState().activeFragmentReveal).toEqual(fragment);

    useUiStore.getState().setActiveFragmentReveal(null);
    expect(useUiStore.getState().activeFragmentReveal).toBeNull();
  });

  it('resetUi restaura o estado inicial de UI', () => {
    useUiStore.getState().toggleScanner();
    useUiStore.getState().toggleInventory();
    useUiStore.getState().setActiveFragmentReveal({
      id: 'fragment-01',
      regionId: 'region-1',
      corruption: 50,
      text: 'test',
    });

    useUiStore.getState().resetUi();

    expect(useUiStore.getState()).toMatchObject({
      isScannerActive: false,
      currentScanTarget: null,
      isInventoryOpen: false,
      activeFragmentReveal: null,
    });
  });
});
