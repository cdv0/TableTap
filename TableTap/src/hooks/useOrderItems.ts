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
        .select("order_item_id, item_id, quantity, price_each, note, menu_items ( item_id, name, categories ( name ) )")
        .eq("order_id", orders.order_id);
      if (itemsError) {
        setSaveError(`Failed to load order items: ${itemsError.message}`);
        return;
      }
      // if there are items, map out the data
      if (items) {
        // Load modifiers for each order item
        const loadedCart: CartItem[] = await Promise.all(
          items.map(async (row: any) => {
            // Fetch modifiers for this order item
            const { data: modifiers, error: modifiersError } = await supabase
              .from("order_item_modifiers")
              .select(`
                modifier_id,
                quantity,
                modifier:modifier_id (
                  name,
                  modifier_group_id,
                  modifier_group:modifier_group_id (
                    name
                  )
                )
              `)
              .eq("order_item_id", row.order_item_id);

            if (modifiersError) {
              console.error("Error fetching modifiers:", modifiersError);
            }

            // Transform modifiers to CartItemModifier format
            const cartModifiers = modifiers?.map((mod: any) => ({
              modifier_group_id: mod.modifier.modifier_group_id,
              modifier_group_name: mod.modifier.modifier_group?.name || "Unknown Group",
              modifier_id: mod.modifier_id,
              modifier_name: mod.modifier.name,
              quantity: mod.quantity
            })) || [];

            return {
              item_id: row.item_id,
              title: row.menu_items.name,
              color: "gray",
              category: row.menu_items.categories.name,
              price: row.price_each,
              count: row.quantity,
              note: row.note,
              modifiers: cartModifiers, // Load actual modifiers from database
            };
          })
        );
        
        setCart(loadedCart);
      }
    };
    fetchExistingOrder();
  }, [tableId, setSaveError]);

  return { cart, setCart };
}