import { describe, expect, it } from 'vitest';

import {
  ACTIVE_REVEAL_RADIUS,
  AMBIENT_REVEAL_RADIUS,
  stepRevealRadius,
} from './darknessSystem';

describe('stepRevealRadius', () => {
  it('cresce em direcao ao raio ativo quando o scanner esta ligado', () => {
    const next = stepRevealRadius(AMBIENT_REVEAL_RADIUS, true, 16);

    expect(next).toBeGreaterThan(AMBIENT_REVEAL_RADIUS);
    expect(next).toBeLessThan(ACTIVE_REVEAL_RADIUS);
  });

  it('encolhe em direcao ao raio ambiente quando o scanner esta desligado', () => {
    const next = stepRevealRadius(ACTIVE_REVEAL_RADIUS, false, 16);

    expect(next).toBeLessThan(ACTIVE_REVEAL_RADIUS);
    expect(next).toBeGreaterThan(AMBIENT_REVEAL_RADIUS);
  });

  it('converge para o raio ativo apos varios passos com o scanner ligado', () => {
    let radius = AMBIENT_REVEAL_RADIUS;
    for (let i = 0; i < 200; i += 1) {
      radius = stepRevealRadius(radius, true, 16);
    }

    expect(radius).toBeCloseTo(ACTIVE_REVEAL_RADIUS, 0);
  });

  it('converge de volta para o raio ambiente apos varios passos com o scanner desligado', () => {
    let radius = ACTIVE_REVEAL_RADIUS;
    for (let i = 0; i < 200; i += 1) {
      radius = stepRevealRadius(radius, false, 16);
    }

    expect(radius).toBeCloseTo(AMBIENT_REVEAL_RADIUS, 0);
  });

  it('nao ultrapassa o alvo mesmo com dt muito grande (passo travado em 1)', () => {
    const next = stepRevealRadius(AMBIENT_REVEAL_RADIUS, true, 100_000);

    expect(next).toBe(ACTIVE_REVEAL_RADIUS);
  });

  it('e insensivel a acumular dt ao longo de uma sessao longa (sem timestamp para dar wrap)', () => {
    // Diferente da versao anterior (baseada em animationTime % 100_000), esta
    // funcao so olha para o raio atual e o dt do frame - nao existe nenhum
    // "instante do ultimo pulso" que possa ficar defasado apos um wrap.
    let radius = AMBIENT_REVEAL_RADIUS;
    for (let i = 0; i < 10_000; i += 1) {
      radius = stepRevealRadius(radius, false, 16);
    }
    radius = stepRevealRadius(radius, true, 16);

    expect(radius).toBeGreaterThan(AMBIENT_REVEAL_RADIUS);
  });
});
