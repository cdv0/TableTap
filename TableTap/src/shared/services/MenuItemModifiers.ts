import { supabase } from "../supabaseClient";

export type DbModifierGroup = {
  modifier_group_id: string;
  name: string;
  organization_id: string;
};

export type DbModifier = {
  modifier_id: string;
  name: string;
  modifier_group_id: string;
  // price hook for the future:
  // price_delta?: number | null;
};

export async function fetchModifierGroupsForItem(
  orgId: string,
  menuItemId: string
): Promise<DbModifierGroup[]> {
  // Find linked group ids
  const { data: linkRows, error: linkErr } = await supabase
    .from("menu_item_modifier_group")
    .select("modifier_group_id")
    .eq("menu_item_id", menuItemId);

  if (linkErr) throw new Error(linkErr.message);
  const groupIds = (linkRows ?? []).map(r => r.modifier_group_id);
  if (groupIds.length === 0) return [];

  // Fetch the groups for this org
  const { data: groups, error: grpErr } = await supabase
    .from("modifier_group")
    .select("modifier_group_id,name,organization_id")
    .eq("organization_id", orgId)
    .in("modifier_group_id", groupIds)
    .order("name", { ascending: true });

  if (grpErr) throw new Error(grpErr.message);
  return groups ?? [];
}

export async function fetchModifiersForGroups(
  groupIds: string[]
): Promise<Record<string, DbModifier[]>> {
  if (groupIds.length === 0) return {};

  const { data, error } = await supabase
    .from("modifier")
    .select("modifier_id,name,modifier_group_id")
    .in("modifier_group_id", groupIds)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const byGroup: Record<string, DbModifier[]> = {};
  for (const row of data ?? []) {
    (byGroup[row.modifier_group_id] ??= []).push(row);
  }
  return byGroup;
}
