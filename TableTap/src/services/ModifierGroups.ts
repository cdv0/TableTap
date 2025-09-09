import { supabase } from "../supabaseClient";

export async function selectModifierGroups(organizationId: string) {
  return await supabase
    .from("modifier_group")
    .select("*")
    .eq("organization_id", organizationId);
}

export async function insertModifierGroup(name: string, organizationId: string) {
  return await supabase
    .from("modifier_group")
    .insert([{ name, organization_id: organizationId }])
    .select("*")
    .single();
}

export async function updateModifierGroupName(
  organizationId: string,
  modifierGroupId: string,
  name: string
) {
  return await supabase
    .from("modifier_group")
    .update({ name })
    .eq("modifier_group_id", modifierGroupId)
    .eq("organization_id", organizationId);
}

export async function deleteModifierGroupCascade(
  organizationId: string,
  modifierGroupId: string
) {
  // Updated Supabase to have on delete cascade

  // Delete modifier_group (parent)
  const { error } = await supabase
    .from("modifier_group")
    .delete()
    .eq("modifier_group_id", modifierGroupId)
    .eq("organization_id", organizationId);

  if (error) throw error;
  return { error: null as null };
}
