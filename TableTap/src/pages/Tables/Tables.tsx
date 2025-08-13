import { useEffect, useMemo, useState } from "react";
import TableGrid from "../../components/features/employee/table/TableGrid";
import Sidebar from "../../components/features/employee/global/Sidebar";
import Navbar from "../../components/features/employee/global/Navbar";
import TableSidebar from "../../components/features/employee/table/TableSidebar";
import { useNavigate } from "react-router-dom";
import { 
  fetchAllTables,
  fetchOpenOrders,
  type TableRow,
  type OpenOrder } from "../Tables/TablesService";

function Tables() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // LOADS TABLE AND OPEN TABLES
  useEffect(() => {
    (async () => {
      try {
        // fetch tables
        const rows = await fetchAllTables();
        // set tables
        setTables(rows);
        // catch  any error
      } catch (e: any) {
        setError(e.message ?? String(e));
      }
      try {
        // fetch open orders
        const orders = await fetchOpenOrders();
        // set open orders
        setOpenOrders(orders);
        // catch any errors
      } catch (e: any) {
        setError(e.message ?? String(e));
      }
    })();
  }, []);

  // MAP TABLE NUMBERS TO UUID
  const numberToId = useMemo(() => {
    const map = new Map<number, string>();
    // map number to each table
    for (const t of tables) map.set(t.number, t.id);
    return map;
  }, [tables]);

  // Which tables have an open order (for highlighting)
  const tablesWithOpenOrder = useMemo(() => {
    const openIds = new Set(
      openOrders.filter((o) => o.item_count > 0).map((o) => o.table_id)
    );
    return new Set(tables.filter((t) => openIds.has(t.id)).map((t) => t.number));
  }, [openOrders, tables]);

  // NAVIGATION TO TABLEID
  function navigateToOrders(tableNumber: number) {
    const tableId = numberToId.get(tableNumber);
    if (!tableId) return;
    navigate(`/tables/${tableId}/orders`, { state: { tableNumber } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar heading="Tables" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {error && (
          <div style={{ position: "absolute", top: 60, left: 16, color: "#b00020" }}>
            Error: {error}
          </div>
        )}
        <TableGrid
          tables={tables.map((t) => t.number)}
          selectedTable={selectedTable ?? undefined}
          highlightedTables={Array.from(tablesWithOpenOrder)}
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
