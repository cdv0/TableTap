import { supabase } from "../supabaseClient";

export type TableRow = {
  id: string;
  number: number;
  status: "available" | "occupied";
  isOccupied?: boolean;
  hasPendingOrder?: boolean;
};

export type OpenOrder = {
  order_id: string;
  table_id: string;
  status: string;
  created_at: string;
  item_names: string[];
};

// Fetch open orders directly from customer_orders and order_items
export async function fetchOpenOrders(organizationId?: string): Promise<OpenOrder[]> {
  let query = supabase
    .from("customer_orders")
    .select(`
      order_id,
      table_id,
      status,
      created_at,
      order_items(
        item_id,
        menu_items(name)
      ),
      tables!inner(organization_id)
    `)
    .eq("status", "pending");

  // Filter by organization if provided
  if (organizationId) {
    query = query.eq("tables.organization_id", organizationId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch open orders: ${error.message}`);
  if (!data) return [];

  return data.map((row) => ({
    order_id: row.order_id,
    table_id: row.table_id,
    status: row.status,
    created_at: row.created_at,
    item_names: row.order_items 
      ? row.order_items.map((item: any) => item.menu_items?.name || "Unknown Item")
      : [],
  }));
}

// Fetch all tables for a specific organization
export async function fetchAllTables(organizationId?: string): Promise<TableRow[]> {
  let query = supabase
    .from("tables")
    .select("table_id, table_number, status, organization_id")
    .order("table_number", { ascending: true });

  // Filter by organization if provided
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch tables: ${error.message}`);
  if (!data || data.length === 0) return [];

  return data.map((row: any) => ({
    id: row.table_id as string,
    number: row.table_number as number,
    status: (row.status === "available" || row.status === "occupied" ? row.status : "available") as "available" | "occupied",
  }));
}