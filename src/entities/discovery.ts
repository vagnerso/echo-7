export interface Discovery {
  id: string;
  objectId: string;
  label: string;
  age?: string;
  material?: string;
  /** id da regiao onde o objeto foi escaneado. */
  scannedAt: string;
}
