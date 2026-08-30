import { describe, expect, it } from 'vitest';

import type { Puzzle } from '@/entities/puzzle';

import { activateSwitch } from './puzzleSystem';

function puzzle(): Puzzle {
  return {
    id: 'test-puzzle',
    type: 'sequence',
    config: { correctOrder: ['a', 'b', 'c'] },
  };
}

describe('activateSwitch', () => {
  it('avanca o progresso ao ativar o proximo switch esperado', () => {
    const result = activateSwitch(puzzle(), [], 'a');

    expect(result).toEqual({ progress: ['a'], solved: false });
  });

  it('resolve o puzzle ao completar a sequencia inteira', () => {
    const result = activateSwitch(puzzle(), ['a', 'b'], 'c');

    expect(result).toEqual({ progress: ['a', 'b', 'c'], solved: true });
  });

  it('reinicia o progresso ao ativar um switch fora de ordem', () => {
    const result = activateSwitch(puzzle(), ['a'], 'c');

    expect(result).toEqual({ progress: [], solved: false });
  });

  it('reinicia contando como primeiro passo se o switch errado for o inicio da sequencia', () => {
    const result = activateSwitch(puzzle(), ['a', 'b'], 'a');

    expect(result).toEqual({ progress: ['a'], solved: false });
  });

  it('mantem resolvido e ignora novas ativacoes depois de completo', () => {
    const result = activateSwitch(puzzle(), ['a', 'b', 'c'], 'a');

    expect(result).toEqual({ progress: ['a', 'b', 'c'], solved: true });
  });
});
