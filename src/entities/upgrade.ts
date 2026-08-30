export interface Upgrade {
  id: string;
  name: string;
  description: string;
  requiredComponent: {
    id: string;
    name: string;
    quantity: number;
  };
}
