import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useOrganizationId(setOrganizationId: any) {
  useEffect(() => {
    const fetchOrgId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No logged-in user.");
        return;
      }

      const { data, error } = await supabase
        .from("employee")
        .select("organization_id")
        .eq("employee_id", user.id)
        .single(); // Expect only one row back

      if (error) {
        console.error("Error fetching organization ID:", error.message);
      } else {
        setOrganizationId(data.organization_id);
      }
    };

    fetchOrgId();
  }, [setOrganizationId]);
}
