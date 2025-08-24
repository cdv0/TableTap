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
    .insert([{ name, organization_id: organizationId }]);
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
  // Delete modifiers first (child table). Note: no org filter here because `modifier` has no org column.
  const { error: itemsError } = await supabase
    .from("modifier")
    .delete()
    .eq("modifier_group_id", modifierGroupId);
  if (itemsError) throw itemsError;

  // Delete the modifier group (parent)
  const { error: modifierError } = await supabase
    .from("modifier_group")
    .delete()
    .eq("modifier_group_id", modifierGroupId)
    .eq("organization_id", organizationId);
  if (modifierError) throw modifierError;

  return { error: null as null };
}
