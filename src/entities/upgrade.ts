// Nome/descricao de exibicao nao moram aqui - vem de t.upgrades[id]
// (src/i18n), resolvido na UI de acordo com o idioma atual.
export interface Upgrade {
  id: string;
  requiredComponent: {
    id: string;
    quantity: number;
  };
}
