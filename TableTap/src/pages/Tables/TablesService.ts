import { supabase } from "../../supabaseClient";

export type TableRow = { 
    id: string; 
    number: number
};

export type OpenOrder = { 
    order_id: string; 
    table_id: string; 
    status: string; 
    created_at: string; 
    item_count: number;
};

// Fetch all tables
export async function fetchAllTables(): Promise<TableRow[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("table_id, table_number")
    .order("table_number", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.table_id as string,
    number: row.table_number as number,
  }));
}

// Fetch latest open orders from the VIEW
export async function fetchOpenOrders(): Promise<OpenOrder[]> {
  const { data, error } = await supabase
    .from("open_orders_with_items")
    .select("order_id, table_id, status, created_at, item_count")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

