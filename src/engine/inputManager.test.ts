import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EventTargetLike, KeyEventLike } from './inputManager';
import { InputManager } from './inputManager';

/** Alvo de eventos falso: registra os listeners e permite dispara-los manualmente, sem precisar de DOM/jsdom. */
function createFakeEventTarget(): EventTargetLike & {
  dispatch: (type: string, event: KeyEventLike) => void;
} {
  const listeners = new Map<string, Set<(event: KeyEventLike) => void>>();

  return {
    addEventListener: (type, listener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)?.add(listener);
    },
    removeEventListener: (type, listener) => {
      listeners.get(type)?.delete(listener);
    },
    dispatch: (type, event) => {
      for (const listener of listeners.get(type) ?? []) {
        listener(event);
      }
    },
  };
}

function keyEvent(code: string): KeyEventLike {
  return { code, preventDefault: vi.fn() };
}

describe('InputManager', () => {
  let target: ReturnType<typeof createFakeEventTarget>;
  let input: InputManager;

  beforeEach(() => {
    target = createFakeEventTarget();
    input = new InputManager(target);
  });

  it('marca a acao como pressionada ao apertar uma tecla mapeada', () => {
    expect(input.isActionPressed('moveUp')).toBe(false);

    target.dispatch('keydown', keyEvent('KeyW'));

    expect(input.isActionPressed('moveUp')).toBe(true);
  });

  it('desmarca a acao ao soltar a tecla', () => {
    target.dispatch('keydown', keyEvent('KeyW'));
    target.dispatch('keyup', keyEvent('KeyW'));

    expect(input.isActionPressed('moveUp')).toBe(false);
  });

  it('mantem a acao pressionada se outra tecla mapeada para ela ainda estiver ativa', () => {
    target.dispatch('keydown', keyEvent('KeyW'));
    target.dispatch('keydown', keyEvent('ArrowUp'));

    target.dispatch('keyup', keyEvent('KeyW'));

    expect(input.isActionPressed('moveUp')).toBe(true);

    target.dispatch('keyup', keyEvent('ArrowUp'));

    expect(input.isActionPressed('moveUp')).toBe(false);
  });

  it('ignora teclas nao mapeadas para nenhuma acao', () => {
    target.dispatch('keydown', keyEvent('KeyP'));

    expect(input.isActionPressed('moveUp')).toBe(false);
    expect(input.isActionPressed('moveDown')).toBe(false);
    expect(input.isActionPressed('moveLeft')).toBe(false);
    expect(input.isActionPressed('moveRight')).toBe(false);
  });

  it('chama preventDefault apenas para teclas reconhecidas', () => {
    const mapped = keyEvent('KeyW');
    const unmapped = keyEvent('KeyP');

    target.dispatch('keydown', mapped);
    target.dispatch('keydown', unmapped);

    expect(mapped.preventDefault).toHaveBeenCalled();
    expect(unmapped.preventDefault).not.toHaveBeenCalled();
  });

  it('limpa todas as teclas pressionadas ao perder o foco', () => {
    target.dispatch('keydown', keyEvent('KeyW'));
    target.dispatch('keydown', keyEvent('KeyD'));

    target.dispatch('blur', keyEvent(''));

    expect(input.isActionPressed('moveUp')).toBe(false);
    expect(input.isActionPressed('moveRight')).toBe(false);
  });

  it('destroy remove os listeners e novos eventos nao tem mais efeito', () => {
    input.destroy();

    target.dispatch('keydown', keyEvent('KeyW'));

    expect(input.isActionPressed('moveUp')).toBe(false);
  });
});
