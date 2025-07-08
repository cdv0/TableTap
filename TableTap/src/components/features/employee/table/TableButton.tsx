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
        className="
          btn
          fw-semibold
          shadow-sm
          d-flex
          align-items-center
          justify-content-center
        "
        style={{
          backgroundColor: selected ? "#ffff88" : "white",
          border: "1px solid #000",
          width: "80px",
          height: "80px",
          margin: "5px",
        }}
      >
        {number}
      </button>
    </div>
  );
}

export default TableButton;
