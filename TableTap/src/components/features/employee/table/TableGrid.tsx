import TableButton from "./TableButton";

interface TableStatus {
  number: number;
  isOccupied: boolean;
}

interface Props {
  tables: number[];
  onTableClick: (number: number) => void;
  highlightedTables?: TableStatus[];
  selectedTable?: number;
}

function TableGrid({
  tables,
  onTableClick,
  highlightedTables = [],
  selectedTable,
}: Props) {
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
      {tables.map((num) => {
        const tableStatus = highlightedTables.find(
          (table) => table.number === num
        );
        const isOccupied = tableStatus?.isOccupied ?? false;
        const isSelected = selectedTable === num;
        return (
          <TableButton
            key={num}
            number={num}
            isOccupied={isOccupied}
            isSelected={isSelected}
            onClick={() => onTableClick(num)}
          />
        );
      })}
    </div>
  );
}

export default TableGrid;
