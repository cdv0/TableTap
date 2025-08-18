import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { fetchAllTables, fetchOpenOrders, type TableRow, type OpenOrder } from "../utils/tableUtils";

export function useTablesData() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch tables and open orders
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Real-time subscriptions for tables and orders
  useEffect(() => {
    const tablesSubscription = supabase
      .channel("tables-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tables" },
        async () => {
          try {
            const rows = await fetchAllTables();
            setTables(rows);
          } catch (e: any) {
            setError(e.message ?? String(e));
          }
        }
      )
      .subscribe();

    const ordersSubscription = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "open_orders_with_items" },
        async () => {
          try {
            const orders = await fetchOpenOrders();
            setOpenOrders(orders);
          } catch (e: any) {
            setError(e.message ?? String(e));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tablesSubscription);
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  // Map table numbers to UUID
  const numberToId = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of tables) map.set(t.number, t.id);
    return map;
  }, [tables]);

  // Determine table status (occupied or available)
  const tablesWithStatus = useMemo(() => {
    return tables.map((table) => ({
      ...table,
      isOccupied:
        table.status === "occupied" ||
        openOrders.some((order) => order.table_id === table.id),
    }));
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
  };
}