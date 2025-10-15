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
        .eq("employee_id", user.id);

      if (error) {
        console.error("Error fetching organization ID:", error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No employee record found for user:", user.id);
        return;
      }

      if (data.length > 1) {
        console.warn("Multiple employee records found for user:", user.id, data);
      }

      // Use the first record
      setOrganizationId(data[0].organization_id);
    };

    fetchOrgId();
  }, [setOrganizationId]);
}
