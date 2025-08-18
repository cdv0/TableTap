export interface MenuItem {
  item_id: string;
  title: string;
  color: string;
  category: string;
  price: number;
  note?: string;
}

export interface CartItem {
  item_id: string;
  title: string;
  color?: string;
  category?: string;
  price: number;
  count: number;
  note?: string;
  id?: string;
}

export interface Category {
  title: string;
  color: string;
}