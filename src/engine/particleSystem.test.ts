import { describe, expect, it } from 'vitest';

import {
  MAX_PARTICLES,
  type Particle,
  spawnParticles,
  updateParticles,
} from './particleSystem';

function particle(overrides: Partial<Particle> = {}): Particle {
  return {
    position: { x: 0, y: 0 },
    velocity: { x: 1, y: 0 },
    life: 100,
    maxLife: 100,
    color: '#fff',
    size: 4,
    ...overrides,
  };
}

describe('updateParticles', () => {
  it('move a particula de acordo com a velocidade e o dt', () => {
    const [result] = updateParticles(
      [particle({ velocity: { x: 2, y: -1 } })],
      10,
    );

    expect(result?.position).toEqual({ x: 20, y: -10 });
  });

  it('reduz a vida restante pelo dt', () => {
    const [result] = updateParticles([particle({ life: 100 })], 30);

    expect(result?.life).toBe(70);
  });

  it('remove particulas cuja vida chegou a zero ou menos', () => {
    const result = updateParticles([particle({ life: 10 })], 15);

    expect(result).toEqual([]);
  });

  it('mantem particulas com vida ainda restante', () => {
    const result = updateParticles([particle({ life: 10 })], 5);

    expect(result).toHaveLength(1);
  });
});

describe('spawnParticles', () => {
  it('combina as particulas existentes com as novas', () => {
    const result = spawnParticles([particle()], [particle(), particle()]);

    expect(result).toHaveLength(3);
  });

  it('descarta as mais antigas quando passa do limite maximo', () => {
    const existing = Array.from({ length: MAX_PARTICLES }, () =>
      particle({ color: 'old' }),
    );
    const newOnes = [particle({ color: 'new' })];

    const result = spawnParticles(existing, newOnes);

    expect(result).toHaveLength(MAX_PARTICLES);
    expect(result[result.length - 1]?.color).toBe('new');
    expect(result[0]?.color).toBe('old');
  });
});
