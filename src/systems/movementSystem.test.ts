import { describe, expect, it } from 'vitest';

import type { GameAction } from '@/engine/inputManager';
import { createPlayer } from '@/entities/player';

import { updatePlayerMovement } from './movementSystem';

function fakeInput(pressed: GameAction[]): {
  isActionPressed: (action: GameAction) => boolean;
} {
  return { isActionPressed: (action) => pressed.includes(action) };
}

describe('updatePlayerMovement', () => {
  it('move para cima e atualiza a direcao', () => {
    const player = createPlayer({ x: 100, y: 100 });

    updatePlayerMovement(player, fakeInput(['moveUp']), 10);

    expect(player.position.y).toBeLessThan(100);
    expect(player.position.x).toBe(100);
    expect(player.facing).toBe('up');
  });

  it('move na diagonal com a mesma velocidade escalar do movimento reto', () => {
    const straight = createPlayer();
    const diagonal = createPlayer();

    updatePlayerMovement(straight, fakeInput(['moveRight']), 10);
    updatePlayerMovement(diagonal, fakeInput(['moveRight', 'moveUp']), 10);

    const straightDistance = Math.hypot(
      straight.position.x,
      straight.position.y,
    );
    const diagonalDistance = Math.hypot(
      diagonal.position.x,
      diagonal.position.y,
    );

    expect(diagonalDistance).toBeCloseTo(straightDistance);
  });

  it('zera a velocidade quando nenhuma tecla esta pressionada, mas mantem a direcao', () => {
    const player = createPlayer();
    updatePlayerMovement(player, fakeInput(['moveLeft']), 10);
    expect(player.facing).toBe('left');

    const positionAfterMove = { ...player.position };
    updatePlayerMovement(player, fakeInput([]), 10);

    expect(player.velocity).toEqual({ x: 0, y: 0 });
    expect(player.position).toEqual(positionAfterMove);
    expect(player.facing).toBe('left');
  });

  it('teclas opostas se cancelam', () => {
    const player = createPlayer({ x: 50, y: 50 });

    updatePlayerMovement(player, fakeInput(['moveLeft', 'moveRight']), 10);

    expect(player.position).toEqual({ x: 50, y: 50 });
    expect(player.velocity).toEqual({ x: 0, y: 0 });
  });

  it.each([
    ['moveDown', 'down'],
    ['moveLeft', 'left'],
    ['moveRight', 'right'],
  ] as const)('define a direcao %s como %s', (action, expectedFacing) => {
    const player = createPlayer();
    updatePlayerMovement(player, fakeInput([action]), 10);
    expect(player.facing).toBe(expectedFacing);
  });
});
