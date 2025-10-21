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

// Look up table UUID for customer orders - ensures all orders go to specific organization
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
    // If table doesn't exist in target org, create a virtual table entry or use a default
    // For now, we'll create a new table entry in the target organization
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

//Create a new order header and items, returns the new order_id.
export async function createCustomerOrder(params: {
  table_id: string;
  status?: "pending" | "preparing" | "closed";
  notes?: string | null;
  items: CartLine[]; // from cart
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
      item_id: (l.meta?.item_id ?? l.id) as string | null, // Use meta.item_id if available, otherwise use the main id
      quantity: l.qty,
      price_each: l.unitPrice,
      note: l.meta?.notes ?? null,
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  return order_id;
}