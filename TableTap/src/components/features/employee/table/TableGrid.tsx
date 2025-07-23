import TableButton from "./TableButton";

interface Props {
  tables: number[];
  onTableClick: (number: number) => void;
  selectedTable?: number;
}

function TableGrid({ tables, onTableClick, selectedTable }: Props) {
  return (
    <div
      style={{
        width: "70%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gridAutoRows: "50px",
        placeContent: "center",
        justifyItems: "center",
        background: "#878787",
        padding: "100px",
        gap: "50px",
      }}
    >
      {tables.map((num) => (
        <TableButton
          key={num}
          number={num}
          selected={num === selectedTable}
          onClick={() => onTableClick(num)}
        />
      ))}
    </div>
  );
}

export default TableGrid;
