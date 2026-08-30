import type { Upgrade } from '@/entities/upgrade';

// Nome/descricao de exibicao vem de t.upgrades[id] (src/i18n).
export const UPGRADES: readonly Upgrade[] = [
  {
    id: 'deep-scanner',
    requiredComponent: {
      id: 'ancient-component',
      quantity: 1,
    },
  },
  {
    id: 'magnetic-boots',
    requiredComponent: {
      id: 'ancient-component',
      quantity: 1,
    },
  },
];
