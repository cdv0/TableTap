import { useEffect } from "react";
import { selectCategories } from "../services/Categories";

export function useDbCategories(organizationId: any, setCategories: any) {
  useEffect(() => {
    if (!organizationId) return;

    (async () => {
      const { data, error } = await selectCategories(organizationId);
      if (!error) setCategories(data ?? []);
    })();
  }, [organizationId, setCategories]);
}
