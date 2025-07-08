import OrderCard from "./OrderCard";

function TableSidebar() {
  return (
    <div
      style={{
        width: "300px",
        padding: "10px",
        background: "#f5f5f5",
      }}
    >
      <h3>Pending Orders</h3>
      <OrderCard tableNumber={1} />
      <OrderCard tableNumber={3} />
      <OrderCard tableNumber={5} />
    </div>
  );
}

export default TableSidebar;
