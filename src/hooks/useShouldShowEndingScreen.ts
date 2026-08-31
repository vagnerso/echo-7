import { BURIED_CHORD, THOUSAND_SPIRES } from '@/content/regions';
import { useGameStore } from '@/state/gameStore';

// Toda regiao alcancavel a partir do epilogo (link "continuar explorando"
// da EndingScreen) - qualquer uma delas conta como "ja seguiu pro epilogo".
// Lista explicita (nao um campo `hasEnteredEpilogue` a parte) porque as duas
// informacoes que precisamos (aconteceu o final? em qual regiao esta agora?)
// ja sao persistidas - ver motivo completo em docs/DECISIONS.md (v3.0).
const EPILOGUE_REGION_IDS: ReadonlySet<string> = new Set([
  THOUSAND_SPIRES.id,
  BURIED_CHORD.id,
]);

/**
 * "O jogo terminou e o jogador ainda nao seguiu pro epilogo?" - usado tanto
 * por App.tsx (decidir entre EndingScreen e GameCanvas) quanto por
 * MissionHUD (esconder o objetivo quando a EndingScreen esta em cena). Sem
 * esse segundo termo, `hasReachedEnding` sozinho tornaria as duas telas
 * permanentes depois do final - inclusive dentro do epilogo, que e gameplay
 * de verdade e precisa do HUD normal.
 */
export function useShouldShowEndingScreen(): boolean {
  return useGameStore(
    (state) =>
      state.hasReachedEnding &&
      !EPILOGUE_REGION_IDS.has(state.currentRegionId),
  );
}
