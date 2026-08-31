import type { InventoryItem } from '@/entities/inventoryItem';

/**
 * Cor por tipo de item de inventario - fonte unica usada tanto no desenho do
 * mundo (GameCanvas, para o coletavel no chao) quanto no painel de
 * inventario (InventoryPanel, para o marcador ao lado do nome). Sem isso, as
 * duas telas duplicariam os mesmos valores rgba e podiam divergir com o
 * tempo (ex: alguem muda a cor no canvas e esquece de atualizar o painel).
 */
export const ITEM_TYPE_COLORS: Record<InventoryItem['type'], string> = {
  resource: 'rgba(240, 210, 90, 0.85)',
  component: 'rgba(150, 190, 230, 0.85)',
  quest: 'rgba(230, 170, 94, 0.85)',
  upgrade: 'rgba(94, 230, 140, 0.85)',
};

/** Cor dos Memory Fragments - mesma usada no triangulo desenhado em GameCanvas. */
export const FRAGMENT_COLOR = 'rgba(230, 130, 200, 0.85)';
