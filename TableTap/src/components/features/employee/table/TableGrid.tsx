import TableButton from "./TableButton";

interface Props {
  tables: number[];
  onTableClick: (number: number) => void;
  highlightedTables?: number[]; // added
  selectedTable?: number;
}

function TableGrid({ tables, onTableClick, highlightedTables = [] }: Props) {
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
        const hasSavedOrder = highlightedTables.includes(num);
        return (
          <TableButton
            key={num}
            number={num}
            hasSavedOrder={hasSavedOrder} // indicate highlight
            onClick={() => onTableClick(num)}
          />
        );
      })}
    </div>
  );
}

export default TableGrid;
