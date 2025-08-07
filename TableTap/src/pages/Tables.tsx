import { useEffect, useState, useMemo } from "react";
import TableGrid from "../components/features/employee/table/TableGrid";
import Sidebar from "../components/features/employee/global/Sidebar";
import Navbar from "../components/features/employee/global/Navbar";
import TableSidebar from "../components/features/employee/table/TableSidebar";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Tables() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [tables, setTables] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onOrderSaved = () => setRefreshFlag((f) => f + 1);
    window.addEventListener("order-saved", onOrderSaved);
    return () => window.removeEventListener("order-saved", onOrderSaved);
  }, []);

  //fetches tables
  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("table_number")
        .order("table_number", { ascending: true });
      if (error) {
        console.error("Error fetching tables: ", error);
        setError(error.message);
      } else if (data) {
        const numbers = (data as any[]).map((row) => row.table_number);
        setTables(numbers);
      }
    };
    fetchTables();
  }, []);

  // HARD CODED
  // const tables = [
  //   1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  // ];

  // determines which tables have a saved order in localStorage
  const tablesWithSaved = useMemo(() => {
    return new Set(
      tables.filter((num) => {
        try {
          const raw = localStorage.getItem(`order_table_${num}`);
          if (!raw) return false;
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) && parsed.length > 0;
        } catch {
          return false;
        }
      })
    );
  }, [tables, refreshFlag]);

  const navigate = useNavigate();

  const navigateToOrders = (tableNumber: number) => {
    navigate(`/tables/${tableNumber}/orders`);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Navbar
        heading="Tables"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <TableGrid
          tables={tables}
          selectedTable={selectedTable ?? undefined}
          highlightedTables={Array.from(tablesWithSaved)}
          onTableClick={(tableNumber) => {
            setSelectedTable(tableNumber);
            navigateToOrders(tableNumber);
          }}
        />
        <TableSidebar />
      </div>
    </div>
  );
}

export default Tables;
