export interface InventoryItem {
  size: string;
  color: string;
  stock: number;
  sold: number;
}

export interface Product {
  _id: string;
  images: string[];
  name: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  type: string;
  inventory: InventoryItem[];
}