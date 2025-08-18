interface Props {
  number: number;
  onClick: () => void;
  isOccupied?: boolean;
  isSelected?: boolean;
}

function TableButton({
  number,
  isOccupied = false,
  isSelected = false,
  onClick,
}: Props) {
  return (
    <div>
      <button
        onClick={onClick}
        style={{
          backgroundColor: isOccupied ? "#FFFB8E" : "white",
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
