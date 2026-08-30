export interface Puzzle {
  id: string;
  type: 'sequence';
  config: {
    /** Ids dos switches, na ordem correta que devem ser ativados. */
    correctOrder: string[];
  };
}
