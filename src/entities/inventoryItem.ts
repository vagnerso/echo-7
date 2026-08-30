// Nome de exibicao nao mora aqui - vem de t.items[id] (src/i18n), resolvido
// na UI de acordo com o idioma atual.
export interface InventoryItem {
  id: string;
  type: 'resource' | 'component' | 'quest' | 'upgrade';
  quantity: number;
  stackable: boolean;
}
