import { supabase } from "../supabaseClient";

export type TableRow = {
  id: string;
  number: number;
  status: "available" | "occupied";
};

// Fetch all tables for a specific organization
export async function fetchAllTables(organizationId: string): Promise<TableRow[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("table_id, table_number, status")
    .eq("organization_id", organizationId)
    .order("table_number", { ascending: true });

  if (error) throw new Error(`Failed to fetch tables: ${error.message}`);
  if (!data || data.length === 0) return [];

  return data.map((row: any) => ({
    id: row.table_id as string,
    number: row.table_number as number,
    status: (row.status === "available" || row.status === "occupied" ? row.status : "available") as "available" | "occupied",
  }));
}

// Add a new table to the organization
export async function addTable(organizationId: string, tableNumber: number): Promise<void> {
  const { error } = await supabase
    .from("tables")
    .insert([{
      table_number: tableNumber,
      status: "available",
      organization_id: organizationId
    }]);

  if (error) throw new Error(`Failed to add table: ${error.message}`);
}

// Remove a table from the organization
export async function removeTable(tableId: string): Promise<void> {
  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("table_id", tableId);

  if (error) throw new Error(`Failed to remove table: ${error.message}`);
}

// Update table count by adding or removing tables
export async function updateTableCount(organizationId: string, targetCount: number): Promise<void> {
  // First, get current tables
  const currentTables = await fetchAllTables(organizationId);
  const currentCount = currentTables.length;

  if (targetCount === currentCount) {
    return; // No changes needed
  }

  if (targetCount > currentCount) {
    // Add tables
    const tablesToAdd = targetCount - currentCount;
    const maxTableNumber = currentTables.length > 0 ? Math.max(...currentTables.map(t => t.number)) : 0;
    
    for (let i = 1; i <= tablesToAdd; i++) {
      await addTable(organizationId, maxTableNumber + i);
    }
  } else {
    // Remove tables (remove highest numbered tables first)
    const tablesToRemove = currentCount - targetCount;
    const sortedTables = currentTables.sort((a, b) => b.number - a.number);
    
    for (let i = 0; i < tablesToRemove; i++) {
      await removeTable(sortedTables[i].id);
    }
  }
}
