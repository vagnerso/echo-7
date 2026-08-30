import type { InventoryItem } from '@/entities/inventoryItem';
import type { Vector2 } from '@/entities/player';

/**
 * 'hazard': bloqueia colisao como uma parede, exceto para quem tiver o
 * upgrade Magnetic Boots instalado (Fase 6).
 * 'sealed': bloqueia colisao como uma parede ate o puzzle 'ruins-puzzle-01'
 * ser resolvido (Fase 7). So existe um puzzle no MVP, entao nao ha
 * ambiguidade sobre qual puzzle destrava - se um segundo aparecer, este
 * tipo passa a precisar de metadado por tile em vez de um id fixo.
 */
export type TileType = 'floor' | 'wall' | 'hazard' | 'sealed';

export interface ScanInfo {
  label: string;
  age?: string;
  material?: string;
  /** Se true, o objeto so aparece no scanner com o upgrade Deep Scanner instalado (Fase 6). */
  requiresDeepScanner?: boolean;
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
  /** Se true, o objeto so aparece/responde a interacao depois do puzzle indicado ser resolvido (Fase 7). */
  requiresPuzzleSolved?: string;
  /** Interagir (tecla E) muda a regiao atual e reposiciona o jogador no ponto de entrada indicado (Fase 7). */
  exit?: { toRegionId: string; spawnPosition: Vector2 };
  /** Interagir (tecla E) ativa este switch dentro do puzzle indicado (Fase 7). */
  puzzleSwitch?: { puzzleId: string; switchId: string };
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
