import type { Puzzle } from '@/entities/puzzle';

export const RUINS_PUZZLE_01: Puzzle = {
  id: 'ruins-puzzle-01',
  type: 'sequence',
  config: { correctOrder: ['switch-a', 'switch-b', 'switch-c'] },
};

// Reaproveita o mesmo tipo 'sequence' do puzzle da Ancient Ruins, com um
// no a mais para dar peso de "puzzle final" - um segundo tipo (ex:
// energy-routing) adicionaria mecanica e codigo novos so por variedade
// visual, o que nao foi pedido.
export const SIGNAL_CORE_PUZZLE: Puzzle = {
  id: 'signal-core-puzzle',
  type: 'sequence',
  config: {
    correctOrder: ['node-1', 'node-2', 'node-3', 'node-4'],
  },
};

// Area opcional (Buried Cache) - mesmo tipo 'sequence', mesmo numero de nos
// do puzzle da Ancient Ruins (3), por ser uma recompensa de exploracao, nao
// o clímax da vertical slice.
export const BURIED_CACHE_PUZZLE: Puzzle = {
  id: 'buried-cache-puzzle',
  type: 'sequence',
  config: { correctOrder: ['switch-a', 'switch-b', 'switch-c'] },
};

// Id exportado (nao so usado aqui dentro) porque GameCanvas.tsx precisa
// identificar este puzzle especificamente, para tocar uma nota musical por
// torre em vez do som de interacao generico (ver playSpireToneSound em
// engine/audio.ts e docs/DECISIONS.md, v3.0/Thousand Spires).
export const THOUSAND_SPIRES_PUZZLE_ID = 'thousand-spires-puzzle';

// v3.0 (Thousand Spires) - mesmo tipo 'sequence' de sempre (reuso, nao
// mecanica nova), 5 nos em vez de 3-4: aqui a ordem certa nao so resolve o
// puzzle, "compoe" as 5 notas de uma escala pentatonica (ver
// playSpireToneSound) - o numero de nos bate de proposito com o numero de
// notas da escala.
export const THOUSAND_SPIRES_PUZZLE: Puzzle = {
  id: THOUSAND_SPIRES_PUZZLE_ID,
  type: 'sequence',
  config: {
    correctOrder: ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'],
  },
};

// Id exportado pelo mesmo motivo de THOUSAND_SPIRES_PUZZLE_ID - content/regions.ts
// precisa dele antes de The Buried Chord (region-6) existir.
export const BURIED_CHORD_PUZZLE_ID = 'buried-chord-puzzle';

// O "desafio final" do epilogo (v3.0): mesmo tipo 'sequence' de sempre - a
// dificuldade nova nao vem de mecanica nova nenhuma, vem do cenario (os 4
// nos ficam espalhados na escuridao quase total de The Buried Chord, so
// visiveis de perto ou durante um pulso do scanner - resolver exige
// memorizar posicoes entre pulsos, nao so acertar a ordem).
export const BURIED_CHORD_PUZZLE: Puzzle = {
  id: BURIED_CHORD_PUZZLE_ID,
  type: 'sequence',
  config: {
    correctOrder: ['node-1', 'node-2', 'node-3', 'node-4'],
  },
};

export const PUZZLES: readonly Puzzle[] = [
  RUINS_PUZZLE_01,
  SIGNAL_CORE_PUZZLE,
  BURIED_CACHE_PUZZLE,
  THOUSAND_SPIRES_PUZZLE,
  BURIED_CHORD_PUZZLE,
];
