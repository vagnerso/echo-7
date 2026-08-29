import { describe, expect, it, vi } from 'vitest';

import { GameLoop } from './gameLoop';

/** Scheduler falso: guarda o callback pendente e so o executa quando o teste manda, no tempo que o teste escolher. */
function createFakeScheduler() {
  let pending: ((time: number) => void) | null = null;

  return {
    requestFrame: (callback: (time: number) => void): number => {
      pending = callback;
      return 1;
    },
    cancelFrame: (): void => {
      pending = null;
    },
    fireFrame: (time: number): void => {
      const callback = pending;
      pending = null;
      callback?.(time);
    },
    hasPendingFrame: (): boolean => pending !== null,
  };
}

describe('GameLoop', () => {
  it('chama update uma vez por passo fixo e render uma vez por frame, com o alpha correto', () => {
    const scheduler = createFakeScheduler();
    let time = 0;
    const update = vi.fn();
    const render = vi.fn();

    const loop = new GameLoop(
      { update, render },
      {
        fixedStepMs: 10,
        now: () => time,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      },
    );

    loop.start();
    time = 25; // 2 passos completos (20ms) + 5ms restantes
    scheduler.fireFrame(time);

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith(10);
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith(0.5);
  });

  it('nao chama update se o frame for menor que o passo fixo, mas ainda chama render', () => {
    const scheduler = createFakeScheduler();
    let time = 0;
    const update = vi.fn();
    const render = vi.fn();

    const loop = new GameLoop(
      { update, render },
      {
        fixedStepMs: 10,
        now: () => time,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      },
    );

    loop.start();
    time = 4;
    scheduler.fireFrame(time);

    expect(update).not.toHaveBeenCalled();
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('agenda o proximo frame automaticamente apos cada tick', () => {
    const scheduler = createFakeScheduler();
    const loop = new GameLoop(
      { update: vi.fn(), render: vi.fn() },
      {
        now: () => 0,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      },
    );

    loop.start();
    expect(scheduler.hasPendingFrame()).toBe(true);

    scheduler.fireFrame(16);
    expect(scheduler.hasPendingFrame()).toBe(true);
  });

  it('stop cancela o frame agendado e impede novos ticks', () => {
    const scheduler = createFakeScheduler();
    const update = vi.fn();
    const loop = new GameLoop(
      { update, render: vi.fn() },
      {
        now: () => 0,
        requestFrame: scheduler.requestFrame,
        cancelFrame: scheduler.cancelFrame,
      },
    );

    loop.start();
    loop.stop();

    expect(scheduler.hasPendingFrame()).toBe(false);
    expect(loop.isRunning).toBe(false);

    scheduler.fireFrame(100);
    expect(update).not.toHaveBeenCalled();
  });

  it('nao inicia duas vezes se ja estiver rodando', () => {
    const scheduler = createFakeScheduler();
    let requestCount = 0;

    const loop = new GameLoop(
      { update: vi.fn(), render: vi.fn() },
      {
        now: () => 0,
        requestFrame: (callback) => {
          requestCount += 1;
          return scheduler.requestFrame(callback);
        },
        cancelFrame: scheduler.cancelFrame,
      },
    );

    loop.start();
    loop.start();

    expect(requestCount).toBe(1);
  });
});
