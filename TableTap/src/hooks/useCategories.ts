import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Category } from "../types/OrderTypes";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawCats, setRawCats] = useState<any[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      setCatsLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("category_id, name")
        .order("name", { ascending: true });
      if (error) setCatsError(error.message);
      else if (data) setRawCats(data);
      setCatsLoading(false);
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const mapped = rawCats.map((r) => ({
      title: r.name,
      color: "gray",
    }));
    setCategories([{ title: "All", color: "gray" }, ...mapped]);
  }, [rawCats]);

  return { categories, catsLoading, catsError };
}