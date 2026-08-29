import { describe, expect, it } from 'vitest';

import { computeCanvasSize } from './canvasSize';

describe('computeCanvasSize', () => {
  it('multiplica o tamanho do buffer pelo devicePixelRatio', () => {
    const size = computeCanvasSize(800, 600, 2);

    expect(size).toEqual({
      width: 1600,
      height: 1200,
      styleWidth: 800,
      styleHeight: 600,
    });
  });

  it('mantem o tamanho em CSS igual ao container, independente do dpr', () => {
    const size = computeCanvasSize(1024, 768, 3);

    expect(size.styleWidth).toBe(1024);
    expect(size.styleHeight).toBe(768);
  });

  it('trata devicePixelRatio menor que 1 como 1', () => {
    const size = computeCanvasSize(800, 600, 0);

    expect(size.width).toBe(800);
    expect(size.height).toBe(600);
  });

  it('arredonda tamanhos fracionarios de buffer', () => {
    const size = computeCanvasSize(801, 601, 1.5);

    expect(size.width).toBe(Math.round(801 * 1.5));
    expect(size.height).toBe(Math.round(601 * 1.5));
  });
});
