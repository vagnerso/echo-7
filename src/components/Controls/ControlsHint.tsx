import { ACTION_TO_KEYS, formatKeyLabel } from '@/engine/inputManager';

import styles from './ControlsHint.module.css';

/**
 * Junta as teclas de um grupo de acoes numa unica string de exibicao, com
 * letras e setas separadas (ex: "WASD / ↑↓←→") em vez de intercaladas.
 */
function formatKeyGroup(keys: readonly string[]): string {
  const letters = keys
    .filter((key) => key.startsWith('Key'))
    .map(formatKeyLabel)
    .join('');
  const arrows = keys
    .filter((key) => key.startsWith('Arrow'))
    .map(formatKeyLabel)
    .join('');

  return [letters, arrows].filter(Boolean).join(' / ');
}

// Deriva os rotulos direto de ACTION_TO_KEYS (engine/inputManager.ts) - fonte
// unica de verdade, para este painel nunca desalinhar do que o jogo aceita.
const CONTROL_ROWS: ReadonlyArray<{ action: string; keys: readonly string[] }> =
  [
    {
      action: 'Move',
      keys: [
        ...ACTION_TO_KEYS.moveUp,
        ...ACTION_TO_KEYS.moveLeft,
        ...ACTION_TO_KEYS.moveDown,
        ...ACTION_TO_KEYS.moveRight,
      ],
    },
    { action: 'Interact', keys: ACTION_TO_KEYS.interact },
    { action: 'Scanner', keys: ACTION_TO_KEYS.scanner },
    { action: 'Inventory', keys: ACTION_TO_KEYS.inventory },
  ];

export function ControlsHint() {
  return (
    <div className={styles.panel}>
      <p className={styles.title}>CONTROLS</p>
      <ul className={styles.list}>
        {CONTROL_ROWS.map((row) => (
          <li key={row.action} className={styles.row}>
            <span className={styles.keys}>{formatKeyGroup(row.keys)}</span>
            <span className={styles.action}>{row.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
