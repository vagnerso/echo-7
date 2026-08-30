import type { Vector2 } from '@/entities/player';

export type TileType = 'floor' | 'wall';

export interface WorldObject {
  id: string;
  position: Vector2;
  /**
   * 'decoration': nao colide, sem interacao - so referencia visual ate ter
   * arte de verdade (Fase 9). 'interactable': responde a tecla E dentro do
   * alcance (Fase 3.3). O que a interacao faz de fato (abrir, escanear,
   * revelar texto) entra nas Fases 4+.
   */
  kind: 'decoration' | 'interactable';
}

export interface Region {
  id: string;
  name: string;
  /** Tamanho de cada tile, em pixels do mundo. */
  tileSize: number;
  /** tiles[linha][coluna]; linha corresponde ao eixo Y, coluna ao eixo X. */
  tiles: TileType[][];
  objects: WorldObject[];
}
