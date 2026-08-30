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

export const PUZZLES: readonly Puzzle[] = [RUINS_PUZZLE_01, SIGNAL_CORE_PUZZLE];
