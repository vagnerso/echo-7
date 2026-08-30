import type { Vector2 } from '@/entities/player';

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  /** Tempo restante de vida, em ms. */
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * Limite simples de particulas (secao 21 do prompt mestre pede atencao a
 * "particle limits"). Se passar do teto, descarta as mais antigas primeiro -
 * evita crescimento sem controle caso algo emita particulas mais rapido do
 * que elas expiram.
 */
export const MAX_PARTICLES = 150;

export function updateParticles(
  particles: readonly Particle[],
  dt: number,
): Particle[] {
  const updated: Particle[] = [];

  for (const particle of particles) {
    const life = particle.life - dt;
    if (life <= 0) continue;

    updated.push({
      ...particle,
      position: {
        x: particle.position.x + particle.velocity.x * dt,
        y: particle.position.y + particle.velocity.y * dt,
      },
      life,
    });
  }

  return updated;
}

export function spawnParticles(
  existing: readonly Particle[],
  newOnes: readonly Particle[],
): Particle[] {
  const combined = [...existing, ...newOnes];

  if (combined.length > MAX_PARTICLES) {
    return combined.slice(combined.length - MAX_PARTICLES);
  }

  return combined;
}
