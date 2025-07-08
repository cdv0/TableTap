import { useState } from "react";
import TableGrid from "../components/features/employee/table/TableGrid";
import Sidebar from "../components/features/employee/global/Sidebar";
import Navbar from "../components/features/employee/global/Navbar";
import TableSidebar from "../components/features/employee/table/TableSidebar";

function Tables() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tables = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ];

  return (
    <div>
      <Navbar
        heading="Tables"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ display: "flex" }}>
        <TableGrid
          tables={tables}
          selectedTable={selectedTable ?? undefined}
          onTableClick={(num) => {
            console.log("Clicked table:", num);
            setSelectedTable(num);
          }}
        />
        <TableSidebar />
      </div>
    </div>
  );
}

export default Tables;
