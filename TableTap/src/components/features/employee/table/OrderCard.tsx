interface Props {
  tableNumber: number;
}

function OrderCard({ tableNumber }: Props) {
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
        >
          edit
        </button>
      </div>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <div style={{ display: "flex", gap: "40px", justifyContent: "center" }}>
        <button
          style={{
            background: "#7BFF8A",
            color: "black",
            border: "none",
            width: "120px",
            fontWeight: 600,
          }}
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
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export default OrderCard;
