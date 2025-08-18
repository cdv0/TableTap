import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useTableNumber(tableId: string | undefined) {
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchTableNumber = async () => {
      if (!tableId) return;
      const { data, error } = await supabase
        .from("tables")
        .select("table_number")
        .eq("table_id", tableId)
        .single();
      if (error) {
        console.error("Error fetching table number:", error.message);
      } else if (data) {
        setTableNumber(data.table_number);
      }
    };
    fetchTableNumber();
  }, [tableId]);

  return tableNumber;
}