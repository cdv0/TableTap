import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { MenuItem } from "../types/OrderTypes";

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setItemsLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("item_id, name, price, category_id, categories ( name )")
        .eq("status", "serving")
        .order("name", { ascending: true });
      if (error) {
        setItemsError(error.message);
      } else if (data) {
        setItems(
          data.map((row: any) => ({
            item_id: row.item_id,
            title: row.name,
            color: "gray",
            category: row.categories.name,
            price: row.price,
            size: "regular",
          }))
        );
      }
      setItemsLoading(false);
    };
    fetchItems();
  }, []);

  return { items, itemsLoading, itemsError };
}