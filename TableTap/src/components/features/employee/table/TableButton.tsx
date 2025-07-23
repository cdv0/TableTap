interface Props {
  number: number; // table number to display
  selected?: boolean; // highlight if selected
  onClick: () => void; // click handler
}

function TableButton({ number, selected, onClick }: Props) {
  return (
    <div>
      <button
        onClick={onClick}
        style={{
          backgroundColor: selected ? "#ffff88" : "white",
          border: "1px solid rgb(92, 92, 92)",
          width: "100px",
          height: "50px",
          fontSize: "25px",
          fontWeight: "semi-bold",
        }}
      >
        {number}
      </button>
    </div>
  );
}

export default TableButton;
