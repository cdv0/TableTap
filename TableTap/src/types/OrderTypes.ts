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
  modifiers?: CartItemModifier[];
}

export interface Category {
  title: string;
  color: string;
}

export interface ModifierGroup {
  modifier_group_id: string;
  name: string;
  organization_id: string;
  created_at: string;
}

export interface Modifier {
  modifier_id: string;
  name: string;
  modifier_group_id: string;
  created_at: string;
}

export interface MenuItemModifierGroup {
  menu_item_id: string;
  modifier_group_id: string;
}

export interface CartItemModifier {
  modifier_group_id: string;
  modifier_group_name: string;
  modifier_id: string;
  modifier_name: string;
  quantity?: number; // For toppings/addons that can have quantities
}