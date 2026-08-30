import type { InventoryItem } from '@/entities/inventoryItem';
import type { Vector2 } from '@/entities/player';

export type TileType = 'floor' | 'wall';

export interface ScanInfo {
  label: string;
  age?: string;
  material?: string;
}

/**
 * Um objeto pode acumular capacidades (ex: interagivel E escaneavel ao mesmo
 * tempo) - por isso sao flags, nao um "kind" excludente. Um objeto sem
 * nenhuma flag e so decoracao visual, sem comportamento.
 */
export interface WorldObject {
  id: string;
  position: Vector2;
  /** Responde a tecla E dentro do alcance de interacao (Fase 3.3). */
  interactable?: boolean;
  /** Aparece no scanner (tecla Q) dentro do alcance de scan (Fase 4). */
  scannable?: boolean;
  /** Dados exibidos no painel do scanner. Presente quando scannable=true. */
  scanInfo?: ScanInfo;
  /**
   * Se presente, interagir com o objeto (tecla E) coleta este item para o
   * inventario e remove o objeto do mundo - em vez do comportamento padrao
   * de "ativar/alternar" de um interactable sem collectible.
   */
  collectible?: InventoryItem;
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
