import type { MemoryFragment } from '@/entities/memoryFragment';

// Texto narrativo vem de t.fragments[id] (src/i18n).
export const MEMORY_FRAGMENTS: readonly MemoryFragment[] = [
  // console-01 (Landing Zone): log automatico do console da base, nao um
  // registro pessoal como os demais - por isso "Log 01", anterior ao
  // "Log 03 - Chegada" do fragment-01. Da proposito de lore ao console, que
  // ate aqui so alternava de cor ao interagir sem nenhum efeito (bug de
  // conteudo esquecido, achado pelo desenvolvedor - ver docs/DECISIONS.md).
  {
    id: 'fragment-13',
    regionId: 'region-1',
    corruption: 15,
  },
  {
    id: 'fragment-01',
    regionId: 'region-1',
    corruption: 61,
  },
  {
    id: 'fragment-02',
    regionId: 'region-1',
    corruption: 48,
  },
  {
    id: 'fragment-03',
    regionId: 'region-2',
    corruption: 55,
  },
  {
    id: 'fragment-04',
    regionId: 'region-2',
    corruption: 39,
  },
  {
    id: 'fragment-05',
    regionId: 'region-3',
    corruption: 72,
  },
  {
    id: 'fragment-06',
    regionId: 'region-3',
    corruption: 12,
  },
  // Buried Cache (region-4): area opcional, so acessivel com o Deep Scanner.
  // Numeracao de log (07, 15) encaixa cronologicamente entre os logs ja
  // existentes (03, 11, 19...) - ver docs/DECISIONS.md.
  {
    id: 'fragment-07',
    regionId: 'region-4',
    corruption: 35,
  },
  {
    id: 'fragment-08',
    regionId: 'region-4',
    corruption: 20,
  },
  // Thousand Spires (region-5): epilogo pos-final, alcancado pelo link
  // "continuar explorando" da EndingScreen - ver docs/DECISIONS.md (v3.0).
  // Mudanca de registro de proposito: nao sao mais logs de campo humanos
  // (a expedicao da Fase 8 ja terminou) - sao transmissoes da propria rede
  // alienigena e registros restritos da unidade ECHO-7 sobre si mesma.
  {
    id: 'fragment-09',
    regionId: 'region-5',
    corruption: 44,
  },
  {
    id: 'fragment-10',
    regionId: 'region-5',
    corruption: 67,
  },
  // The Buried Chord (region-6): area secreta dentro de Thousand Spires, so
  // acessivel com o Deep Scanner e com os dois fragmentos exigindo
  // THOUSAND_SPIRES_PUZZLE resolvido. Fecha o fio do Kade (fragment-07/08,
  // Buried Cache) - ver docs/DECISIONS.md.
  {
    id: 'fragment-11',
    regionId: 'region-6',
    corruption: 28,
  },
  {
    id: 'fragment-12',
    regionId: 'region-6',
    corruption: 51,
  },
];

// Exportado (nao so usado aqui dentro) porque GameCanvas.tsx precisa saber
// quando os dois foram coletados, pra disparar a conclusao do epilogo
// (useGameStore.getState().completeEpilogue()) - em vez de checar as duas
// strings soltas la.
export const BURIED_CHORD_FRAGMENT_IDS = ['fragment-11', 'fragment-12'] as const;
