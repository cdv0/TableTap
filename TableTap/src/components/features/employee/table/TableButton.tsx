interface Props {
  number: number; // table number to display
  onClick: () => void; // click handler
  hasSavedOrder?: boolean;
}

function TableButton({ number, hasSavedOrder, onClick }: Props) {
  return (
    <div>
      <button
        onClick={onClick}
        style={{
          backgroundColor: hasSavedOrder ? "#FFFB8E" : "white",
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
