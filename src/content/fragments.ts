import type { MemoryFragment } from '@/entities/memoryFragment';

// Texto narrativo vem de t.fragments[id] (src/i18n).
export const MEMORY_FRAGMENTS: readonly MemoryFragment[] = [
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
];
