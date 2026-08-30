import type { PointerEvent, RefObject } from 'react';

import type { GameAction, InputManager } from '@/engine/inputManager';

import styles from './TouchControls.module.css';

export interface TouchControlsProps {
  inputRef: RefObject<InputManager | null>;
}

const DIRECTIONS: ReadonlyArray<{
  action: GameAction;
  label: string;
  area: string;
}> = [
  { action: 'moveUp', label: '↑', area: 'up' },
  { action: 'moveLeft', label: '←', area: 'left' },
  { action: 'moveRight', label: '→', area: 'right' },
  { action: 'moveDown', label: '↓', area: 'down' },
];

const ACTIONS: ReadonlyArray<{ action: GameAction; label: string }> = [
  { action: 'interact', label: 'E' },
  { action: 'scanner', label: 'Q' },
  { action: 'inventory', label: 'I' },
];

/**
 * D-pad + botoes de acao para telas de toque. So visivel via
 * `@media (pointer: coarse)` (TouchControls.module.css) - em desktop fica no
 * DOM mas oculto, sem detectar dispositivo em JS. Cada botao so chama
 * pressVirtual/releaseVirtual do InputManager (engine/inputManager.ts) - a
 * mesma GameAction que uma tecla real dispararia, entao nenhum sistema de
 * jogo precisa saber que o toque existe.
 */
export function TouchControls({ inputRef }: TouchControlsProps) {
  const bind = (action: GameAction) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      inputRef.current?.pressVirtual(action);
    },
    onPointerUp: () => inputRef.current?.releaseVirtual(action),
    onPointerCancel: () => inputRef.current?.releaseVirtual(action),
    onPointerLeave: () => inputRef.current?.releaseVirtual(action),
  });

  return (
    <div className={styles.controls}>
      <div className={styles.dpad}>
        {DIRECTIONS.map(({ action, label, area }) => (
          <button
            key={action}
            type="button"
            aria-label={action}
            className={styles.dpadButton}
            style={{ gridArea: area }}
            {...bind(action)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.actionButtons}>
        {ACTIONS.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            aria-label={action}
            className={styles.actionButton}
            {...bind(action)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
