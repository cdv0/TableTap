import { supabase } from "../supabaseClient";
import type { CartLine } from "./cart";

// Look up the table's UUID by its table_number 
export async function getTableIdByNumber(tableNumber: number) {
  const { data, error } = await supabase
    .from("tables")
    .select("table_id")
    .eq("table_number", tableNumber)
    .limit(1)
    .single();
  if (error ||  !data) throw new Error(error?.message ?? "Table not found");
  return data.table_id as string;
}

//Create a new order header and items, returns the new order_id.
export async function createCustomerOrder(params: {
  table_id: string;
  status?: "pending" | "preparing" | "closed";
  notes?: string | null;
  items: CartLine[]; // from your cart
}) {
  const { table_id, status = "pending", notes = null, items } = params;

  // Insert order header
  const { data: orderRow, error: orderErr } = await supabase
    .from("customer_orders")
    .insert([{ table_id, status, notes }])
    .select("order_id, created_at")
    .single();
  if (orderErr || !orderRow) throw new Error(orderErr?.message ?? "Failed to create order");
  const order_id: string = orderRow.order_id;

  // Insert items
  if (items.length) {
    const rows = items.map((l) => ({
      order_id,
      item_id: (l.meta?.item_id ?? null) as string | null, 
      quantity: l.qty,
      price_each: l.unitPrice,
      note: l.meta?.notes ?? null,
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  return order_id;
}