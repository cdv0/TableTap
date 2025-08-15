import { useTablesData } from "../../hooks/useTablesData";
import TableGrid from "../../components/features/employee/table/TableGrid";
import Sidebar from "../../components/features/employee/global/Sidebar";
import Navbar from "../../components/features/employee/global/Navbar";
import TableSidebar from "../../components/features/employee/table/TableSidebar";
import "./Tables.css";

function Tables() {
  const {
    selectedTable,
    sidebarOpen,
    tables,
    openOrders,
    error,
    isLoading,
    setSelectedTable,
    setSidebarOpen,
    navigateToOrders,
  } = useTablesData();

  return (
    <div className="tables-container">
      <Navbar
        heading="Tables"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        {error && <div className="error-message">Error: {error}</div>}
        {isLoading ? (
          <div className="loading-state">Loading tables...</div>
        ) : (
          <TableGrid
            tables={tables.map((t) => t.number)}
            selectedTable={selectedTable ?? undefined}
            highlightedTables={tables} // Pass tables directly with isOccupied
            onTableClick={(tableNumber) => {
              setSelectedTable(tableNumber);
              navigateToOrders(tableNumber);
            }}
          />
        )}
        <TableSidebar />
      </div>
    </div>
  );
}

export default Tables;
