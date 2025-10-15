import { supabase } from "../supabaseClient";

type DbCategory = { category_id: string; name: string };
type DbItem = {
  item_id: string;
  name: string;
  description: string | null;
  status: string | null;
  is_addon: boolean | null;
  organization_id: string;
  category_id: string;
  price: number;
};

const TABLE_CATEGORIES = "categories";   
const TABLE_ITEMS = "menu_items";       

export async function fetchCategories(orgId: string): Promise<DbCategory[]> {
  const { data, error } = await supabase
    .from(TABLE_CATEGORIES)
    .select("category_id,name")
    .eq("organization_id", orgId)
    .order("name", { ascending: true }); // change if you add sort_order later

  if (error) throw new Error(error.message);
  return (data ?? []) as DbCategory[];
}

export async function fetchItems(orgId: string): Promise<DbItem[]> {
  const { data, error } = await supabase
    .from(TABLE_ITEMS)
    .select("item_id,name,description,status,is_addon,organization_id,category_id,price")
    .eq("organization_id", orgId)
    .neq("status", "archived"); // or .eq("status","active")

  if (error) throw new Error(error.message);
  return (data ?? []) as DbItem[];
}