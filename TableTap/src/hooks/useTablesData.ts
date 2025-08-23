import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllTables, fetchOpenOrders, type TableRow, type OpenOrder} from "../utils/tableUtils";

export function useTablesData() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch tables and open orders
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rows, orders] = await Promise.all([fetchAllTables(), fetchOpenOrders()]);
      setTables(rows);
      setOpenOrders(orders);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh orders data
  const refreshOrders = async () => {
    try {
      const orders = await fetchOpenOrders();
      setOpenOrders(orders);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  };


  // Map table numbers to UUID
  const numberToId = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of tables) map.set(t.number, t.id);
    return map;
  }, [tables]);

  // Determine table status (occupied or available)
  const tablesWithStatus = useMemo(() => {
    return tables.map((table) => {
      const hasPendingOrder = openOrders.some((order) => order.table_id === table.id);
      return {
        ...table,
        isOccupied:
          table.status === "occupied" ||
          openOrders.some((order) => order.table_id === table.id),
        hasPendingOrder: hasPendingOrder,
      };
    });
  }, [tables, openOrders]);

  // Navigate to table orders
  function navigateToOrders(tableNumber: number) {
    const tableId = numberToId.get(tableNumber);
    if (!tableId) return;
    navigate(`/tables/${tableId}/orders`, { state: { tableNumber } });
  }

  return {
    selectedTable,
    sidebarOpen,
    tables: tablesWithStatus,
    openOrders,
    error,
    isLoading,
    setSelectedTable,
    setSidebarOpen,
    navigateToOrders,
    refreshOrders,
  };
}