export interface Vector2 {
  x: number;
  y: number;
}

export type FacingDirection = 'up' | 'down' | 'left' | 'right';

// Campos como integrity, energy e scannerLevel (ja definidos no modelo de
// dados da Fase 0) entram aqui quando os sistemas que os usam existirem -
// nao antes, para nao ter atributos parados sem nenhuma logica por tras.
export interface Player {
  position: Vector2;
  velocity: Vector2;
  facing: FacingDirection;
  /** Tamanho da caixa de colisao/render, centrada em position. */
  size: Vector2;
}

export function createPlayer(position: Vector2 = { x: 0, y: 0 }): Player {
  return {
    position: { ...position },
    velocity: { x: 0, y: 0 },
    facing: 'down',
    size: { x: 32, y: 32 },
  };
}
