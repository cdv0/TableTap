import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { CartItem } from "../types/OrderTypes";

export function useOrderItems(tableId: string | undefined, setSaveError: (error: string | null) => void) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchExistingOrder = async () => {
      if (!tableId) return;
      // fetch order from customer order
      const { data: orders, error: orderError } = await supabase
        .from("customer_orders")
        .select("order_id")
        .eq("table_id", tableId)
        .eq("status", "preparing")
        .single();

      // if no order return empty cart
      if (orderError || !orders) {
        setCart([]); // No open order, start with empty cart
        return;
      }

      // fetch order_items with item_id
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("item_id, quantity, price_each, note, menu_items ( item_id, name, categories ( name ) )")
        .eq("order_id", orders.order_id);
      if (itemsError) {
        setSaveError(`Failed to load order items: ${itemsError.message}`);
        return;
      }
      // if there are items, map out the data
      if (items) {
        setCart(
          items.map((row: any) => ({
            item_id: row.item_id,
            title: row.menu_items.name,
            color: "gray",
            category: row.menu_items.categories.name,
            price: row.price_each,
            count: row.quantity,
            note: row.note,
          }))
        );
      }
    };
    fetchExistingOrder();
  }, [tableId, setSaveError]);

  return { cart, setCart };
}