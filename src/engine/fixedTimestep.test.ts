import { describe, expect, it } from 'vitest';

import { advanceAccumulator } from './fixedTimestep';

describe('advanceAccumulator', () => {
  it('nao gera passo se o frame for menor que o passo fixo', () => {
    const result = advanceAccumulator(0, 6, 10, 250);

    expect(result.steps).toBe(0);
    expect(result.accumulator).toBe(6);
    expect(result.alpha).toBeCloseTo(0.6);
  });

  it('gera exatamente um passo quando o frame bate com o passo fixo', () => {
    const result = advanceAccumulator(0, 10, 10, 250);

    expect(result.steps).toBe(1);
    expect(result.accumulator).toBe(0);
    expect(result.alpha).toBe(0);
  });

  it('gera multiplos passos quando o frame acumula mais tempo', () => {
    const result = advanceAccumulator(0, 25, 10, 250);

    expect(result.steps).toBe(2);
    expect(result.accumulator).toBe(5);
    expect(result.alpha).toBeCloseTo(0.5);
  });

  it('soma o acumulador de chamadas anteriores', () => {
    const first = advanceAccumulator(0, 6, 10, 250);
    const second = advanceAccumulator(first.accumulator, 6, 10, 250);

    expect(second.steps).toBe(1);
    expect(second.accumulator).toBeCloseTo(2);
  });

  it('limita o delta do frame para evitar espiral da morte apos uma pausa longa', () => {
    const result = advanceAccumulator(0, 5000, 10, 250);

    expect(result.steps).toBe(25);
    expect(result.accumulator).toBe(0);
  });
});
