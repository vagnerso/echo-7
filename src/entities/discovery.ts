// Guarda so identidade (o que, onde) - nenhum texto de exibicao. O label/
// idade/material aparecem resolvidos ao vivo via t.scanInfo[objectId]
// (src/i18n), nunca gravados aqui: assim uma Discovery salva antes de trocar
// de idioma nao fica presa no idioma de quando foi escaneada.
export interface Discovery {
  id: string;
  objectId: string;
  /** id da regiao onde o objeto foi escaneado. */
  scannedAt: string;
}
