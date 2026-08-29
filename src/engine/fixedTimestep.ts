export interface AccumulatorResult {
  /** Quantos passos de simulacao de tamanho fixo cabem no tempo acumulado. */
  steps: number;
  /** Tempo que sobrou depois de consumir os passos inteiros, em ms. */
  accumulator: number;
  /** Fracao (0-1) do proximo passo ja decorrida, para interpolar o render. */
  alpha: number;
}

/**
 * Decide quantos passos de simulacao de tamanho fixo cabem no tempo
 * acumulado. Separado do GameLoop para poder testar a matematica do
 * timestep fixo sem precisar de requestAnimationFrame nem de um clock real.
 */
export function advanceAccumulator(
  accumulator: number,
  frameDeltaMs: number,
  fixedStepMs: number,
  maxFrameDeltaMs: number,
): AccumulatorResult {
  // Limita o delta de um unico frame para evitar a "espiral da morte": se a
  // aba ficou em segundo plano por segundos, sem isso o loop tentaria rodar
  // milhares de updates de uma vez so para recuperar o tempo perdido.
  const clampedDelta = Math.min(frameDeltaMs, maxFrameDeltaMs);

  let acc = accumulator + clampedDelta;
  let steps = 0;

  while (acc >= fixedStepMs) {
    acc -= fixedStepMs;
    steps += 1;
  }

  return {
    steps,
    accumulator: acc,
    alpha: acc / fixedStepMs,
  };
}
