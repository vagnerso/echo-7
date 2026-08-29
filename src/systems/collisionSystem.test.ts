import { describe, expect, it } from 'vitest';

import { intersects, resolveCollisions } from './collisionSystem';

describe('intersects', () => {
  it('detecta sobreposicao real', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 0, width: 10, height: 10 };

    expect(intersects(a, b)).toBe(true);
  });

  it('nao considera caixas apenas encostando na borda como colisao', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 10, y: 0, width: 10, height: 10 };

    expect(intersects(a, b)).toBe(false);
  });

  it('nao detecta colisao entre caixas distantes', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 100, y: 100, width: 10, height: 10 };

    expect(intersects(a, b)).toBe(false);
  });
});

describe('resolveCollisions', () => {
  const size = { x: 10, y: 10 };

  it('permite o movimento livremente quando nao ha obstaculos', () => {
    const resolved = resolveCollisions(
      { x: 0, y: 0 },
      { x: 20, y: 20 },
      size,
      [],
    );

    expect(resolved).toEqual({ x: 20, y: 20 });
  });

  it('bloqueia o eixo X ao esbarrar numa parede, mas permite deslizar no Y', () => {
    // Parede vertical ocupando x:30-40, por todo o eixo Y.
    const wall = { x: 30, y: -50, width: 10, height: 100 };

    const resolved = resolveCollisions(
      { x: 20, y: 0 },
      { x: 36, y: 20 }, // tentando mover na diagonal para dentro da parede
      size,
      [wall],
    );

    expect(resolved).toEqual({ x: 20, y: 20 });
  });

  it('bloqueia os dois eixos quando ambos colidem (jogador preso num canto)', () => {
    const wall = { x: 30, y: -50, width: 10, height: 100 };
    const cornerBlock = { x: 15, y: 15, width: 15, height: 15 };

    const resolved = resolveCollisions(
      { x: 20, y: 0 },
      { x: 36, y: 20 },
      size,
      [wall, cornerBlock],
    );

    expect(resolved).toEqual({ x: 20, y: 0 });
  });
});
