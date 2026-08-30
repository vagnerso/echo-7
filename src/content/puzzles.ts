import type { Puzzle } from '@/entities/puzzle';

export const RUINS_PUZZLE_01: Puzzle = {
  id: 'ruins-puzzle-01',
  type: 'sequence',
  config: { correctOrder: ['switch-a', 'switch-b', 'switch-c'] },
};

export const PUZZLES: readonly Puzzle[] = [RUINS_PUZZLE_01];
