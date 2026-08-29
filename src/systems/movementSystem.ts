import type { GameAction } from '@/engine/inputManager';
import type { FacingDirection, Player } from '@/entities/player';

export interface MovementInput {
  isActionPressed: (action: GameAction) => boolean;
}

/** Pixels por milissegundo. Em 60fps (~16.6ms por passo), equivale a ~9px por frame. */
const SPEED_PX_PER_MS = 0.15;

export function updatePlayerMovement(
  player: Player,
  input: MovementInput,
  dt: number,
): void {
  let dx = 0;
  let dy = 0;

  if (input.isActionPressed('moveUp')) dy -= 1;
  if (input.isActionPressed('moveDown')) dy += 1;
  if (input.isActionPressed('moveLeft')) dx -= 1;
  if (input.isActionPressed('moveRight')) dx += 1;

  // Normaliza a diagonal: sem isso, mover nos dois eixos ao mesmo tempo
  // resultaria em velocidade ~41% maior (raiz de 2) do que mover num eixo so.
  if (dx !== 0 && dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
  }

  player.velocity.x = dx * SPEED_PX_PER_MS;
  player.velocity.y = dy * SPEED_PX_PER_MS;

  player.position.x += player.velocity.x * dt;
  player.position.y += player.velocity.y * dt;

  if (dx !== 0 || dy !== 0) {
    player.facing = resolveFacing(dx, dy, player.facing);
  }
}

function resolveFacing(
  dx: number,
  dy: number,
  current: FacingDirection,
): FacingDirection {
  // Eixo de maior magnitude decide a direcao visual. Em diagonal exata os
  // dois eixos empatam - o desempate (vertical vence) e arbitrario mas
  // deterministico, o suficiente para uma direcao de sprite/animacao.
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  if (dy !== 0) {
    return dy > 0 ? 'down' : 'up';
  }
  return current;
}
