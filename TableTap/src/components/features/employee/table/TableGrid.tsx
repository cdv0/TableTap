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
        display: "flex",
        flexWrap: "wrap",
        width: "400px",
        background: "gray",
        padding: "10px",
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
