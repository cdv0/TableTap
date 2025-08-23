import TableButton from "./TableButton";
import { type TableRow } from "../../../../utils/tableUtils";

interface Props {
  tables: TableRow[];
  onTableClick: (number: number) => void;
  selectedTable?: number;
}

function TableGrid({ tables, onTableClick }: Props) {
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
      {tables.map((table) => {
        const isOccupied = table.isOccupied;
        const hasPendingOrder = table.hasPendingOrder;
        return (
          <TableButton
            key={table.id}
            number={table.number}
            isOccupied={isOccupied}
            hasPendingOrder={hasPendingOrder}
            onClick={() => onTableClick(table.number)}
          />
        );
      })}
    </div>
  );
}

export default TableGrid;
