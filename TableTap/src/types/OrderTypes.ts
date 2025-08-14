export interface MenuItem {
  item_id: string;
  title: string;
  color: string;
  category: string;
  price: number;
  size?: string;
  note?: string;
}

export interface CartItem {
  item_id: string;
  title: string;
  color: string;
  category: string;
  price: number;
  count: number;
  size?: string;
  note?: string;
  id?: string;
}

export interface Category {
  title: string;
  color: string;
}