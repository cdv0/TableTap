import { useEffect } from "react";
import { selectModifierGroups } from "../services/ModifierGroups";

export function useModifierGroups(organizationId: any, setModifierGroups: any) {
  useEffect(() => {
    if (!organizationId) return;

    (async () => {
      const { data, error } = await selectModifierGroups(organizationId);
      if (!error) {
        setModifierGroups(data ?? []);
      } else {
        console.error("Failed to fetch modifier groups:", error.message);
      }
    })();
  }, [organizationId, setModifierGroups]);
}
