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
