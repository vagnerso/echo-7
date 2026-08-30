// Texto narrativo nao mora aqui - vem de t.fragments[id] (src/i18n),
// resolvido na UI de acordo com o idioma atual.
export interface MemoryFragment {
  id: string;
  regionId: string;
  /** Percentual de dados recuperados (efeito narrativo de sinal corrompido). */
  corruption: number;
}
