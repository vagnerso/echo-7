export interface CanvasSize {
  /** Largura do buffer do canvas, em pixels reais do dispositivo. */
  width: number;
  /** Altura do buffer do canvas, em pixels reais do dispositivo. */
  height: number;
  /** Largura exibida na tela, em pixels CSS. */
  styleWidth: number;
  /** Altura exibida na tela, em pixels CSS. */
  styleHeight: number;
}

/**
 * Calcula o tamanho do buffer do canvas a partir do tamanho do container e do
 * devicePixelRatio. Sem isso, em telas de alta densidade (Retina etc.) o
 * canvas usaria 1 pixel de buffer por pixel CSS e o desenho sairia borrado.
 */
export function computeCanvasSize(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number,
): CanvasSize {
  const dpr = Math.max(1, devicePixelRatio);

  return {
    width: Math.round(containerWidth * dpr),
    height: Math.round(containerHeight * dpr),
    styleWidth: containerWidth,
    styleHeight: containerHeight,
  };
}
