import type { Translations } from '@/i18n';

import { ACTION_TO_KEYS, formatKeyLabel } from './inputManager';

/**
 * Junta as teclas de um grupo de acoes numa unica string de exibicao, com
 * letras e setas separadas (ex: "WASD / ↑↓←→") em vez de intercaladas.
 */
export function formatKeyGroup(keys: readonly string[]): string {
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

export interface ControlRow {
  labelKey: keyof Translations['controls'];
  keys: readonly string[];
}

// As teclas em si nao mudam com o idioma - so o rotulo da acao (resolvido
// via t.controls[labelKey] por quem consome). Deriva direto de
// ACTION_TO_KEYS (inputManager.ts) - fonte unica de verdade, para a UI nunca
// desalinhar do que o jogo aceita. Compartilhado pelo ControlsHint (HUD
// in-game) e pela TutorialScreen (menu) - ambos precisam da mesma lista.
export const CONTROL_ROWS: readonly ControlRow[] = [
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
