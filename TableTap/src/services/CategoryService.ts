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
  const getAll = async (orgId: string): Promise<Category[]> => {
    const {data, error} = await supabase
    .from("categories")
    .select("category_id, name, created_at")
    .eq("organization_id", orgId)
    .order("name", {ascending: true});

    if (error) throw new Error(error.message);
    return data
  }

  // getById: fetches one category at a time
  const getById = async (categoryId: string): Promise<Category> => {
    const {data, error} = await supabase
    .from("categories")
    .select("category_id, name, created_at")
    .eq("category_id", categoryId)
    .single();

    if (error) throw new Error(error.message);
    return data
  }

  // create: create a category
  const create = async (payload: {name: string, category_id: string}): Promise<Category> => {
    const {data, error} = await supabase
    .from("categories")
    .insert([payload])
    .select("category_id, name, created_at")
    .single()

    if (error) throw new Error(error.message);
    return data
  }
  
  // update: update a category
  const update = async (categoryId: string, changes: Partial<Pick<Category, "name">>): Promise<Category> => {
    const {data, error} = await supabase
    .from("categories")
    .update(changes).eq("category_id", categoryId)
    .select("category_id, name, created_at")
    .single();

    if (error) throw new Error(error.message);
      return data
  }
  // remove: removes a category
  const remove = async (categoryId: string): Promise<void> =>{
    const {error} = await supabase
    .from("categories")
    .delete().eq("category_id", categoryId);

    if (error) throw new Error(error.message);
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  }
}

export default CategoryService
