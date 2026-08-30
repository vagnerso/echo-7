import type { Upgrade } from '@/entities/upgrade';

export const UPGRADES: readonly Upgrade[] = [
  {
    id: 'deep-scanner',
    name: 'Deep Scanner',
    description:
      'Detecta sinais e estruturas ocultas, fora do alcance do scanner basico.',
    requiredComponent: {
      id: 'ancient-component',
      name: 'Ancient Component',
      quantity: 1,
    },
  },
  {
    id: 'magnetic-boots',
    name: 'Magnetic Boots',
    description: 'Permite atravessar superficies magneticamente instaveis.',
    requiredComponent: {
      id: 'ancient-component',
      name: 'Ancient Component',
      quantity: 1,
    },
  },
];
