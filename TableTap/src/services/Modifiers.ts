import { supabase } from "../supabaseClient";

export async function selectModifiersByGroupIds(groupIds: string[]) {
  return await supabase
    .from("modifier")
    .select("*")
    .in("modifier_group_id", groupIds);
}

export async function insertModifier(name: string, modifierGroupId: string) {
  return await supabase
    .from("modifier")
    .insert([{ name: name.trim(), modifier_group_id: modifierGroupId }]);
}

export async function updateModifierName(modifierId: string, name: string) {
  return await supabase
    .from("modifier")
    .update({ name })
    .eq("modifier_id", modifierId);
}

export async function deleteModifierById(modifierId: string) {
  return await supabase
    .from("modifier")
    .delete()
    .eq("modifier_id", modifierId);
}
