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

// Note for employee screen to see modifiers 
// Replace the whole buildLineNote with this:
function buildLineNote(meta: any): string | null {
  if (!meta) return null;

  const parts: string[] = [];

  // --- Generic selections (non-Pho) ---
  if (Array.isArray(meta.selections) && meta.selections.length) {
    // groupName -> optionName -> qty sum
    const byGroup = new Map<string, Map<string, number>>();
    for (const s of meta.selections as Array<{ groupName: string; options: Array<{ name: string; qty: number }> }>) {
      const gname = s.groupName ?? "Options";
      const g = byGroup.get(gname) ?? new Map<string, number>();
      for (const o of s.options ?? []) {
        const name = (o?.name ?? "").toString();
        if (!name) continue;
        const q = Math.max(1, Number(o?.qty ?? 1));
        g.set(name, (g.get(name) ?? 0) + q);
      }
      byGroup.set(gname, g);
    }
    for (const [gname, opts] of byGroup.entries()) {
      const line = Array.from(opts.entries())
        .map(([name, q]) => (q > 1 ? `${name} x${q}` : name)) // hide x1
        .join(", ");
      if (line) parts.push(`${gname}: ${line}`);
    }
  }

  // --- Pho legacy fields (unchanged) ---
  if (meta.bowlSize) parts.push(`Bowl: ${meta.bowlSize}`);
  if (meta.noodleSize) parts.push(`Noodles: ${meta.noodleSize}`);
  if (meta.broth) parts.push(`Broth: ${meta.broth}`);
  if (Array.isArray(meta.removed) && meta.removed.length) parts.push(`Removed: ${meta.removed.join(", ")}`);
  if (Array.isArray(meta.substituted) && meta.substituted.length) parts.push(`Substituted: ${meta.substituted.join(", ")}`);

  const listToText = (list: any[]) =>
    list
      .map((m: any) => (typeof m === "string" ? m : (m?.key ?? "") + (m?.qty && m.qty > 1 ? ` x${m.qty}` : "")))
      .filter(Boolean)
      .join(", ");

  if (Array.isArray(meta.extraMeats) && meta.extraMeats.length) {
    const meats = listToText(meta.extraMeats);
    if (meats) parts.push(`Pho Meats: ${meats}`);
  }
  if (Array.isArray(meta.extras) && meta.extras.length) {
    const ex = listToText(meta.extras);
    if (ex) parts.push(`Extras: ${ex}`);
  }

  // --- Only actual free text from the user ---
  const userNote = (meta.userNote ?? meta.note ?? "").toString().trim();
  if (userNote) parts.push(userNote); // no "Notes:" prefix here

  const line = parts.map(s => s.trim()).filter(Boolean).join(" | ");
  return line || null;
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
      // Put modifiers into the note 
      const lineNote = buildLineNote(l.meta);
      return {
        order_id,
        item_id,
        quantity: l.qty,
        price_each: l.unitPrice,
        note: lineNote,
      };
    });

    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  return order_id;
}
