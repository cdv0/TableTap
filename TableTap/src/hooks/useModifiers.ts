import { useEffect } from "react";
import { selectModifiersByGroupIds } from "../services/Modifiers";

export function useModifiersByGroup(modifierGroups: any[], setModifiersByGroup: any) {
  useEffect(() => {
    if (modifierGroups && modifierGroups.length > 0) {
      (async () => {
        const groupIds = modifierGroups
          .map((g) => g.modifier_group_id)
          .filter(Boolean);

        const { data, error } = await selectModifiersByGroupIds(groupIds);

        if (error) {
          console.error("Failed to fetch modifiers:", error.message);
          return;
        }

        const grouped: Record<string, any[]> = {};
        (data ?? []).forEach((m: any) => {
          const key = m.modifier_group_id;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(m);
        });
        setModifiersByGroup(grouped);
      })();
    } else {
      setModifiersByGroup({});
    }
  }, [modifierGroups, setModifiersByGroup]);
}
