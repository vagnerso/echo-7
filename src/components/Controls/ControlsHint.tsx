import { ACTION_TO_KEYS, formatKeyLabel } from '@/engine/inputManager';
import { useTranslations } from '@/hooks/useTranslations';
import type { Translations } from '@/i18n';

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

// As teclas em si nao mudam com o idioma - so o rotulo da acao (resolvido
// via t.controls[labelKey] no render). Deriva direto de ACTION_TO_KEYS
// (engine/inputManager.ts) - fonte unica de verdade, para este painel nunca
// desalinhar do que o jogo aceita.
const CONTROL_ROWS: ReadonlyArray<{
  labelKey: keyof Translations['controls'];
  keys: readonly string[];
}> = [
  {
    labelKey: 'move',
    keys: [
      ...ACTION_TO_KEYS.moveUp,
      ...ACTION_TO_KEYS.moveLeft,
      ...ACTION_TO_KEYS.moveDown,
      ...ACTION_TO_KEYS.moveRight,
    ],
  },
  { labelKey: 'interact', keys: ACTION_TO_KEYS.interact },
  { labelKey: 'scanner', keys: ACTION_TO_KEYS.scanner },
  { labelKey: 'inventory', keys: ACTION_TO_KEYS.inventory },
];

export function ControlsHint() {
  const t = useTranslations();

  return (
    <div className={styles.panel}>
      <p className={styles.title}>{t.controls.title}</p>
      <ul className={styles.list}>
        {CONTROL_ROWS.map((row) => (
          <li key={row.labelKey} className={styles.row}>
            <span className={styles.keys}>{formatKeyGroup(row.keys)}</span>
            <span className={styles.action}>{t.controls[row.labelKey]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
