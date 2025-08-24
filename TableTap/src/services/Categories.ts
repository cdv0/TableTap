import { supabase } from "../supabaseClient";

export async function selectCategories(organizationId: string) {
  return await supabase
    .from("categories")
    .select("*")
    .eq("organization_id", organizationId);
}

export async function insertCategory(name: string, organizationId: string) {
  return await supabase
    .from("categories")
    .insert([{ name, organization_id: organizationId }]);
}

export async function updateCategoryName(
  organizationId: string,
  categoryId: string,
  name: string
) {
  return await supabase
    .from("categories")
    .update({ name })
    .eq("category_id", categoryId)
    .eq("organization_id", organizationId);
}

export async function deleteCategoryCascade(
  organizationId: string,
  categoryId: string
) {
  // Delete menu items first (child table)
  const { error: itemsError } = await supabase
    .from("menu_items")
    .delete()
    .eq("category_id", categoryId)
    .eq("organization_id", organizationId);
  if (itemsError) throw itemsError;

  // Delete the category (parent)
  const { error: catError } = await supabase
    .from("categories")
    .delete()
    .eq("category_id", categoryId)
    .eq("organization_id", organizationId);
  if (catError) throw catError;

  return { error: null as null };
}
