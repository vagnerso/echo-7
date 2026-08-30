import { beforeEach, describe, expect, it } from 'vitest';

import { useUiStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      isScannerActive: false,
      currentScanTarget: null,
      isInventoryOpen: false,
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
});
