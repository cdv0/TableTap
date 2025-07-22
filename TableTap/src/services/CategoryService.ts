import { supabase } from "../supabaseClient";

// TODO: categories properties
interface Category {
  category_id: string;
  name: string;
  created_at: string;
}
// TODO implement backend services
const CategoryService = () => {

  // getAll: fetches all the categories
  getAll: async (orgId: string): Promise<Category[]> => {
    const {data, error} = await supabase
    .from<Category>("categories")
    .select("category_id, name, created_at")
    .eq("organization_id", orgId)
    .order("name", {ascending: true});

    if (error) throw new Error(error.message);
    return data
  }

  // getById: fetches one category at a time
  getById: async (categoryId: string): Promise<Category[]> => {
    const {data, error} = await supabase
    .from<Category>("categories")
    .select("category_id, name, created_at")
    .eq("categogry_id", categoryId)
    .single();

    if (error) throw new Error(error.message);
    return data
  }

  // create: create a category
  create: async (payload: {name: string, categoryId: string}): Promise<Category[]> => {
    const {data, error} = await supabase
    .from<Category>("categories")
    .insert([payload])
    .select("category_id, name, created_at")
    .single()

    if (error) throw new Error(error.message);
    return data
  }
  // update: update a category
  update: async (categoryId: string, changes: Partial<Pick<Category, "name">>): Promise<Category[]> => {
    const {data, error} = await supabase
    .from<Category>("categories")
    .update(changes).eq("category_id", categoryId)
    .select("categoryId, name, created_at")
    .single();

    if (error) throw new Error(error.message);
      return data
  }
  // remove: removes a category
  remove: async (categoryId: string): Promise<void> =>{
    const {error} = await supabase
    .from<Category>("categories")
    .delete().eq("category_id", categoryId);

    if (error) throw new Error(error.message);
  }
}

export default CategoryService
