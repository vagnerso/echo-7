import { describe, expect, it } from 'vitest';

import { createCamera, updateCameraFollow, worldToScreen } from './camera';

describe('worldToScreen', () => {
  it('coloca a posicao do mundo igual a da camera no centro exato da tela', () => {
    const camera = createCamera({ x: 500, y: 300 });

    const screen = worldToScreen({ x: 500, y: 300 }, camera, 800, 600);

    expect(screen).toEqual({ x: 400, y: 300 });
  });

  it('translada offsets do mundo 1:1 para a tela', () => {
    const camera = createCamera({ x: 500, y: 300 });

    const screen = worldToScreen({ x: 550, y: 250 }, camera, 800, 600);

    expect(screen).toEqual({ x: 450, y: 250 });
  });
});

describe('updateCameraFollow', () => {
  it('atualiza a posicao da camera para a posicao alvo', () => {
    const camera = createCamera({ x: 0, y: 0 });

    updateCameraFollow(camera, { x: 120, y: 80 });

    expect(camera.position).toEqual({ x: 120, y: 80 });
  });

  it('copia os valores em vez de referenciar o objeto alvo', () => {
    const camera = createCamera({ x: 0, y: 0 });
    const target = { x: 10, y: 10 };

    updateCameraFollow(camera, target);
    target.x = 999;

    expect(camera.position.x).toBe(10);
  });
});
