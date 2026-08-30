import type { Puzzle } from '@/entities/puzzle';

export interface ActivateSwitchResult {
  progress: string[];
  solved: boolean;
}

/**
 * Ativa um switch do puzzle de sequencia. Se for o proximo switch esperado,
 * avanca o progresso (e resolve, se for o ultimo). Se for o switch errado,
 * reinicia - a menos que o switch errado seja por acaso o primeiro da
 * sequencia correta, caso em que o progresso reinicia contando ele como o
 * primeiro passo (padrao comum em puzzles de sequencia: nao "perder" um
 * acerto por causa da ordem de exploracao do jogador).
 */
export function activateSwitch(
  puzzle: Puzzle,
  progress: readonly string[],
  switchId: string,
): ActivateSwitchResult {
  const { correctOrder } = puzzle.config;

  if (progress.length >= correctOrder.length) {
    return { progress: [...progress], solved: true };
  }

  const expectedNext = correctOrder[progress.length];

  if (switchId === expectedNext) {
    const nextProgress = [...progress, switchId];
    return {
      progress: nextProgress,
      solved: nextProgress.length === correctOrder.length,
    };
  }

  const restartProgress = switchId === correctOrder[0] ? [switchId] : [];
  return { progress: restartProgress, solved: false };
}
