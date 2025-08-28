import { useTablesData } from "../../../../hooks/useTablesData";
import { supabase } from "../../../../supabaseClient";

interface Props {
  tableNumber: number;
  orderId?: string;
  itemNames: string[];
  refreshOrders: () => void;
}

function OrderCard({ tableNumber, orderId, itemNames, refreshOrders }: Props) {
  const { navigateToOrders } = useTablesData();

  const handleAccept = async () => {
    if (orderId) {
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "preparing" })
        .eq("order_id", orderId);
      if (error) console.error("Error accepting order:", error.message);
      else {
        // Refresh the orders data
        await refreshOrders();
      }
    }
  };

  const handleDecline = async () => {
    if (orderId) {
      const { error } = await supabase
        .from("customer_orders")
        .update({ status: "closed" })
        .eq("order_id", orderId);
      if (error) console.error("Error declining order:", error.message);
      else {
        // Refresh the orders data
        await refreshOrders();
      }
    }
  };

  return (
    <div
      style={{
        padding: "10px 30px",
        marginBottom: "10px",
        background: "white",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0px",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: 700 }}>
          Table {tableNumber}
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            color: "black",
            padding: 0,
            margin: 0,
            font: "inherit",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => navigateToOrders(tableNumber)}
        >
          edit
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <p style={{ marginBottom: "5px", fontWeight: "600" }}>Items:</p>
        {itemNames.map((itemName, index) => (
          <p key={index} style={{ margin: "2px 0", paddingLeft: "10px" }}>
            {itemName}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", gap: "40px", justifyContent: "center" }}>
        <button
          style={{
            background: "#7BFF8A",
            color: "black",
            border: "none",
            width: "120px",
            fontWeight: 600,
          }}
          onClick={handleAccept}
        >
          Accept
        </button>
        <button
          style={{
            background: "#FF6C6C",
            color: "black",
            border: "none",
            width: "120px",
            fontWeight: 600,
          }}
          onClick={handleDecline}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export default OrderCard;
