import { supabase } from "../supabaseClient";

export type TableRow = {
  id: string;
  number: number;
  status: "available" | "occupied";
  isOccupied?: boolean;
};

export type OpenOrder = {
  order_id: string;
  table_id: string;
  status: string;
  created_at: string;
  item_count: number;
};

// Fetch open orders directly from customer_orders and order_items
export async function fetchOpenOrders(): Promise<OpenOrder[]> {
  const { data, error } = await supabase
    .from("customer_orders")
    .select(`
      order_id,
      table_id,
      status,
      created_at,
      order_items(item_id, quantity)
    `)
    .eq("status", "preparing");

  if (error) throw new Error(`Failed to fetch open orders: ${error.message}`);
  if (!data) return [];

  return data.map((row) => ({
    order_id: row.order_id,
    table_id: row.table_id,
    status: row.status,
    created_at: row.created_at,
    item_count: row.order_items ? row.order_items.length : 0,
  }));
}

// Fetch all tables
export async function fetchAllTables(): Promise<TableRow[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("table_id, table_number, status")
    .order("table_number", { ascending: true });

  if (error) throw new Error(`Failed to fetch tables: ${error.message}`);
  if (!data || data.length === 0) return [];

  return data.map((row: any) => ({
    id: row.table_id as string,
    number: row.table_number as number,
    status: (row.status === "available" || row.status === "occupied" ? row.status : "available") as "available" | "occupied",
  }));
}