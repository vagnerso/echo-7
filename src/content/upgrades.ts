import type { Upgrade } from '@/entities/upgrade';

// Id exportado (nao so usado aqui dentro) porque GameCanvas.tsx precisa
// checar "o jogador ja tem o Deep Scanner instalado?" em varios pontos
// (interacao, scanner, render) - sem isso, a string literal 'deep-scanner'
// ficava repetida em cada chamada, um risco de erro de digitacao silencioso
// que o TypeScript nao pega (string solta, nao union type).
export const DEEP_SCANNER_UPGRADE_ID = 'deep-scanner';

// Nome/descricao de exibicao vem de t.upgrades[id] (src/i18n).
export const UPGRADES: readonly Upgrade[] = [
  {
    id: DEEP_SCANNER_UPGRADE_ID,
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
