import { useGameStore } from '@/state/gameStore';

const SAVE_KEY = 'echo7-save';
const SAVE_VERSION = 1;

/**
 * Formato minimo de localStorage/sessionStorage que precisamos - permite
 * injetar um storage falso nos testes, em vez de depender do localStorage
 * real (mesmo padrao ja usado no InputManager e no GameLoop para tornar
 * codigo que depende de APIs de navegador testavel sem jsdom).
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface SaveData {
  version: number;
  discoveries: ReturnType<typeof useGameStore.getState>['discoveries'];
  inventory: ReturnType<typeof useGameStore.getState>['inventory'];
  installedUpgrades: string[];
  currentRegionId: string;
  solvedPuzzles: string[];
  collectedFragments: string[];
  currentObjective: string;
  hasReachedEnding: boolean;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

/**
 * A posicao exata do jogador nao entra no save (fica de proposito fora da
 * gameStore, por performance - ver docs/DECISIONS.md). Ao continuar, o
 * jogador reaparece no ponto de entrada da regiao salva, nao no pixel exato
 * de onde saiu - uma simplificacao deliberada, nao uma limitacao tecnica.
 */
export function saveGame(
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) return;

  const state = useGameStore.getState();
  const data: SaveData = {
    version: SAVE_VERSION,
    discoveries: state.discoveries,
    inventory: state.inventory,
    installedUpgrades: Array.from(state.installedUpgrades),
    currentRegionId: state.currentRegionId,
    solvedPuzzles: Array.from(state.solvedPuzzles),
    collectedFragments: Array.from(state.collectedFragments),
    currentObjective: state.currentObjective,
    hasReachedEnding: state.hasReachedEnding,
  };

  storage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function hasSaveGame(
  storage: StorageLike | null = getDefaultStorage(),
): boolean {
  return storage?.getItem(SAVE_KEY) != null;
}

/** Retorna true se um save valido foi carregado; false se nao havia save ou se o formato era incompativel (versao diferente). */
export function loadGame(
  storage: StorageLike | null = getDefaultStorage(),
): boolean {
  if (!storage) return false;

  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return false;

  let data: SaveData;
  try {
    data = JSON.parse(raw) as SaveData;
  } catch {
    return false;
  }

  // Versionamento simples: uma versao diferente da atual e tratada como
  // incompativel por enquanto. Migracoes reais (converter de uma versao
  // para outra) entrariam aqui quando existir uma segunda versao de save.
  if (data.version !== SAVE_VERSION) return false;

  useGameStore.setState({
    discoveries: data.discoveries,
    inventory: data.inventory,
    installedUpgrades: new Set(data.installedUpgrades),
    currentRegionId: data.currentRegionId,
    solvedPuzzles: new Set(data.solvedPuzzles),
    collectedFragments: new Set(data.collectedFragments),
    currentObjective: data.currentObjective,
    hasReachedEnding: data.hasReachedEnding,
  });

  return true;
}
