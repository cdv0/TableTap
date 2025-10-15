import { supabase } from "../supabaseClient";

export async function selectMenuItems(organizationId: string) {
  return await supabase
    .from("menu_items")
    .select("*")
    .eq("organization_id", organizationId);
}

export async function insertMenuItem(
  name: string,
  description: string | null,
  price: number,
  organizationId: string,
  categoryId: string
) {
  return await supabase
    .from("menu_items")
    .insert([
      {
        name,
        description,
        price,
        organization_id: organizationId,
        category_id: categoryId,
      },
    ])
    .select("*")
    .single();
}

export async function insertMenuItemModifierGroups(
  menuItemId: string,
  modifierGroupIds: string[]
) {
  if (!modifierGroupIds.length) return { error: null as null };
  const rows = modifierGroupIds.map((modifier_group_id) => ({
    menu_item_id: menuItemId,
    modifier_group_id,
  }));
  return await supabase.from("menu_item_modifier_group").insert(rows);
}

export async function updateMenuItem(
  itemId: string,
  fields: { name?: string; description?: string | null; price?: number }
) {
  return await supabase
    .from("menu_items")
    .update(fields)
    .eq("item_id", itemId)
    .select("*")
    .single();
}

export async function selectMenuItemModifierGroupIds(menuItemId: string) {
  const { data, error } = await supabase
    .from("menu_item_modifier_group")
    .select("modifier_group_id")
    .eq("menu_item_id", menuItemId);
  return { data: (data ?? []).map((r: any) => r.modifier_group_id) as string[], error };
}

export async function replaceMenuItemModifierGroups(
  menuItemId: string,
  newIds: string[]
) {
  const { data: cur, error: selErr } = await supabase
    .from("menu_item_modifier_group")
    .select("modifier_group_id")
    .eq("menu_item_id", menuItemId);
  if (selErr) return { error: selErr };

  const existing = new Set((cur ?? []).map((r: any) => r.modifier_group_id as string));
  const desired = new Set(newIds);

  const toInsert: string[] = [];
  const toDelete: string[] = [];

  desired.forEach((id) => { if (!existing.has(id)) toInsert.push(id); });
  existing.forEach((id) => { if (!desired.has(id)) toDelete.push(id); });

  if (toDelete.length) {
    const { error: delErr } = await supabase
      .from("menu_item_modifier_group")
      .delete()
      .eq("menu_item_id", menuItemId)
      .in("modifier_group_id", toDelete);
    if (delErr) return { error: delErr };
  }

  if (toInsert.length) {
    const rows = toInsert.map((id) => ({
      menu_item_id: menuItemId,
      modifier_group_id: id,
    }));
    const { error: insErr } = await supabase
      .from("menu_item_modifier_group")
      .insert(rows);
    if (insErr) return { error: insErr };
  }

  return { error: null as null };
}

export async function deleteMenuItemCascade(menuItemId: string) {
  const { error: delJoinErr } = await supabase
    .from("menu_item_modifier_group")
    .delete()
    .eq("menu_item_id", menuItemId);
  if (delJoinErr) return { error: delJoinErr };

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("item_id", menuItemId);

  return { error };
}
