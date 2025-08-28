import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { MenuItem, ModifierGroup, Modifier } from "../types/OrderTypes";

export interface MenuItemWithModifiers extends MenuItem {
  modifierGroups?: ModifierGroup[];
  modifiers?: Modifier[];
}

export function useMenuItems() {
  const [items, setItems] = useState<MenuItemWithModifiers[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setItemsLoading(true);
      try {
        // Fetch menu items with categories
        const { data: menuItems, error: itemsError } = await supabase
          .from("menu_items")
          .select("item_id, name, price, category_id, categories ( name )")
          .eq("status", "serving")
          .order("name", { ascending: true });

        if (itemsError) {
          setItemsError(itemsError.message);
          return;
        }

        if (!menuItems) {
          setItems([]);
          return;
        }

        // Fetch modifier groups and modifiers for each menu item
        const itemsWithModifiers = await Promise.all(
          menuItems.map(async (row: any) => {
            // Get modifier groups for this menu item
            const { data: modifierGroups, error: groupsError } = await supabase
              .from("menu_item_modifier_group")
              .select(`
                modifier_group_id,
                modifier_group:modifier_group_id (
                  modifier_group_id,
                  name,
                  organization_id,
                  created_at
                )
              `)
              .eq("menu_item_id", row.item_id);

            if (groupsError) {
              console.error("Error fetching modifier groups:", groupsError);
            }

            // Get modifiers for each modifier group
            let allModifiers: Modifier[] = [];
            if (modifierGroups && modifierGroups.length > 0) {
              const groupIds = modifierGroups.map((mg: any) => mg.modifier_group_id);
              const { data: modifiers, error: modifiersError } = await supabase
                .from("modifier")
                .select("modifier_id, name, modifier_group_id, created_at")
                .in("modifier_group_id", groupIds);

              if (modifiersError) {
                console.error("Error fetching modifiers:", modifiersError);
              } else if (modifiers) {
                allModifiers = modifiers;
              }
            }

            return {
              item_id: row.item_id,
              title: row.name,
              color: "gray",
              category: row.categories.name,
              price: Number(row.price) || 0,
              size: "regular",
              modifierGroups: modifierGroups?.map((mg: any) => mg.modifier_group) || [],
              modifiers: allModifiers,
            };
          })
        );

        setItems(itemsWithModifiers);
      } catch (error) {
        setItemsError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setItemsLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, itemsLoading, itemsError };
}