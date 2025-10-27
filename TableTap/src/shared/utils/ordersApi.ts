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

// Look up table UUID for customer orders
export async function getTableIdForCustomerOrder(tableNumber: number) {
  const TARGET_ORG_ID = "d15730c2-012b-4238-a037-873c03ce68fa";
  
  const { data, error } = await supabase
    .from("tables")
    .select("table_id")
    .eq("table_number", tableNumber)
    .eq("organization_id", TARGET_ORG_ID)
    .limit(1)
    .single();
  
  if (error || !data) {
    const { data: newTable, error: createError } = await supabase
      .from("tables")
      .insert([{
        table_number: tableNumber,
        organization_id: TARGET_ORG_ID,
        status: "available"
      }])
      .select("table_id")
      .single();
    
    if (createError || !newTable) {
      throw new Error(`Table ${tableNumber} not found in target organization and could not be created`);
    }
    return newTable.table_id as string;
  }
  
  return data.table_id as string;
}

export async function createCustomerOrder(params: {
  table_id: string;
  status?: "pending" | "preparing" | "closed";
  notes?: string | null;
  items: CartLine[];
}) {
  const { table_id, status = "pending", notes = null, items } = params;

  // Order header
  const { data: orderRow, error: orderErr } = await supabase
    .from("customer_orders")
    .insert([{ table_id, status, notes }])
    .select("order_id, created_at")
    .single();

  if (orderErr || !orderRow) {
    throw new Error(orderErr?.message ?? "Failed to create order");
  }
  const order_id: string = orderRow.order_id;

  // Order items
  if (items.length) {
    const rows = items.map((l) => {
      const item_id = l.meta?.item_id as string | undefined; // must be uuid
      if (!item_id) {
        throw new Error(`Cart line "${l.title}" is missing meta.item_id`);
      }
      return {
        order_id,
        item_id,
        quantity: l.qty,
        price_each: l.unitPrice,
        note: l.meta?.notes ?? null,
      };
    });

    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  return order_id;
}
