export interface MemoryFragment {
  id: string;
  regionId: string;
  /** Percentual de dados recuperados (efeito narrativo de sinal corrompido). */
  corruption: number;
  text: string;
}
