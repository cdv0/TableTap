import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useOrganizationName() {
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationName = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No logged-in user.");
          setLoading(false);
          return;
        }

        // Get the employee's organization_id first
        const { data: employeeData, error: employeeError } = await supabase
          .from("employee")
          .select("organization_id")
          .eq("employee_id", user.id)
          .single();

        if (employeeError) {
          console.error("Error fetching employee data:", employeeError.message);
          setLoading(false);
          return;
        }

        if (!employeeData) {
          console.warn("No employee record found for user:", user.id);
          setLoading(false);
          return;
        }

        // Get the organization name
        const { data: orgData, error: orgError } = await supabase
          .from("organization")
          .select("name")
          .eq("org_id", employeeData.organization_id)
          .single();

        if (orgError) {
          console.error("Error fetching organization data:", orgError.message);
          setLoading(false);
          return;
        }

        setOrganizationName(orgData?.name || null);
      } catch (error) {
        console.error("Error fetching organization name:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationName();
  }, []);

  return { organizationName, loading };
}
