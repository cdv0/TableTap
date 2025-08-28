interface Props {
  number: number;
  onClick: () => void;
  isOccupied?: boolean;
  hasPendingOrder?: boolean;
}

function TableButton({ number, isOccupied = false, hasPendingOrder = false, onClick }: Props) {
  let backgroundColor = "white"; // default for available
  if (hasPendingOrder) {
    backgroundColor = "#FFB3B3"; // light red for pending orders
  } else if (isOccupied) {
    backgroundColor = "#FFFB8E"; // yellow for occupied
  }

  return (
    <div>
      <button
        onClick={onClick}
        style={{
          backgroundColor: backgroundColor,
          border: "1px solid rgb(92, 92, 92)",
          width: "100px",
          height: "50px",
          fontSize: "25px",
          fontWeight: "600",
          position: "relative",
          cursor: "pointer",
        }}
      >
        {number}
      </button>
    </div>
  );
}

export default TableButton;
