import { useMemo } from "react";
import OrderCard from "./OrderCard";
import { type TableRow, type OpenOrder } from "../../../../utils/tableUtils";

interface Props {
  openOrders: OpenOrder[];
  tables: TableRow[];
  refreshOrders: () => void;
}

function TableSidebar({ openOrders, tables, refreshOrders }: Props) {
  const ordersWithNumbers = useMemo(() => {
    const tableMap = new Map<string, number>();
    tables.forEach((table) => tableMap.set(table.id, table.number)); // Populate with actual table numbers
    return openOrders.map((order) => ({
      ...order,
      tableNumber: tableMap.get(order.table_id) || 0, // Fallback to 0 if table_id not found
    }));
  }, [openOrders, tables]);

  return (
    <div
      style={{
        width: "30%",
        padding: "10px 20px",
        background: "#f5f5f5",
        overflowY: "auto",
      }}
    >
      <div style={{ fontSize: "32px", fontWeight: 700, paddingBottom: "10px" }}>
        Pending Orders
      </div>
      {ordersWithNumbers.map((order) => (
        <OrderCard
          key={order.order_id}
          tableNumber={order.tableNumber}
          orderId={order.order_id}
          itemNames={order.item_names}
          refreshOrders={refreshOrders}
        />
      ))}
    </div>
  );
}

export default TableSidebar;
