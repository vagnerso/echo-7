export interface InventoryItem {
  id: string;
  type: 'resource' | 'component' | 'quest' | 'upgrade';
  name: string;
  quantity: number;
  stackable: boolean;
}
