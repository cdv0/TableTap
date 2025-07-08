interface Props {
  tableNumber: number;
}

function OrderCard({ tableNumber }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        background: "white",
      }}
    >
      <h4>Table {tableNumber}</h4>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <button style={{ background: "green", color: "white" }}>Accept</button>
      <button style={{ background: "red", color: "white", marginLeft: "10px" }}>
        Decline
      </button>
    </div>
  );
}

export default OrderCard;
