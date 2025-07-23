import OrderCard from "./OrderCard";

function TableSidebar() {
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
      <OrderCard tableNumber={1} />
      <OrderCard tableNumber={3} />
    </div>
  );
}

export default TableSidebar;
