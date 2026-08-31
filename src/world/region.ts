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

/**
 * Um objeto pode acumular capacidades (ex: interagivel E escaneavel ao mesmo
 * tempo) - por isso sao flags, nao um "kind" excludente. Um objeto sem
 * nenhuma flag e so decoracao visual, sem comportamento.
 */
export interface WorldObject {
  id: string;
  position: Vector2;
  /**
   * Variante visual de um objeto puramente decorativo (sem nenhuma flag de
   * comportamento) - default (undefined) e o agrupamento de pedras generico
   * ja usado desde a Fase 3. 'wreckage' desenha destroços de nave em vez de
   * pedra, para a cena da Landing Zone (ver PROMPT MESTRE, secao Mundo:
   * "cápsula/nave" nunca tinha ganhado representacao visual propria).
   * 'campBeam'/'campLantern'/'dugEarth' sao do acampamento de escavacao da
   * Buried Cache (o depósito improvisado de Kade, ver content/fragments.ts
   * fragment-07/08) - escoramento de madeira, lanterna de emergencia pendurada
   * e a terra revolvida onde o drive foi desenterrado. 'brokenSpire' sao
   * torres caidas/quebradas de Thousand Spires - o campo tem mil torres, so
   * 5 ainda funcionam (os puzzleSwitch com visualKind: 'spire' abaixo).
   */
  decorationKind?:
    | 'wreckage'
    | 'campBeam'
    | 'campLantern'
    | 'dugEarth'
    | 'brokenSpire';
  /**
   * Variante visual de um objeto com comportamento (ao contrario de
   * decorationKind, que e so para decoracao pura) - hoje so 'spire', para o
   * puzzleSwitch renderizar como uma torre alta e funcional (com o proprio
   * orbe do switch como "nota acesa" no topo) em vez do orbe generico
   * flutuando sozinho, nas 5 torres de Thousand Spires que ainda respondem.
   */
  visualKind?: 'spire';
  /** Responde a tecla E dentro do alcance de interacao (Fase 3.3). */
  interactable?: boolean;
  /** Aparece no scanner (tecla Q) dentro do alcance de scan (Fase 4). */
  scannable?: boolean;
  /**
   * Se true, o objeto so aparece no scanner com o upgrade Deep Scanner
   * instalado (Fase 6). So faz sentido quando scannable=true. O texto de
   * exibicao do scan (label/idade/material) nao mora aqui - vem do
   * dicionario de traducao (src/i18n), indexado por `id` (Fase de i18n).
   */
  requiresDeepScanner?: boolean;
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
  /** Interagir (tecla E) coleta este fragmento de memoria (id em content/fragments.ts) (Fase 8). */
  memoryFragment?: string;
  /** Interagir (tecla E) dispara o encerramento da vertical slice (Fase 8). */
  triggersEnding?: boolean;
}

export interface Region {
  // Nome de exibicao nao mora aqui - so o `id` (mesmo padrao ja adotado no
  // resto do conteudo desde a Fase de i18n: "conteudo guarda so identidade,
  // nunca texto de exibicao"). O nome traduzido vem de `t.regionNames[id]`
  // (src/i18n), usado pelo indicador de localizacao no HUD (MissionHUD).
  id: string;
  /** Tamanho de cada tile, em pixels do mundo. */
  tileSize: number;
  /** tiles[linha][coluna]; linha corresponde ao eixo Y, coluna ao eixo X. */
  tiles: TileType[][];
  objects: WorldObject[];
}
