import { useTablesData } from "../../../shared/hooks/useTablesData";
import TableGrid from "../../components/table/TableGrid";
import Sidebar from "../../components/global/Sidebar";
import Navbar from "../../components/global/Navbar";
import TableSidebar from "../../components/table/TableSidebar";
import "./Tables.css";

function Tables() {
  const {
    selectedTable,
    sidebarOpen,
    tables: tablesWithStatus,
    openOrders,
    error,
    isLoading,
    setSelectedTable,
    setSidebarOpen,
    navigateToOrders,
    refreshOrders,
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
            tables={tablesWithStatus}
            selectedTable={selectedTable ?? undefined}
            onTableClick={(tableNumber) => {
              setSelectedTable(tableNumber);
              navigateToOrders(tableNumber);
            }}
          />
        )}
        <TableSidebar openOrders={openOrders} tables={tablesWithStatus} refreshOrders={refreshOrders} />{" "}
        {/* Pass tables */}
      </div>
    </div>
  );
}
export default Tables;
