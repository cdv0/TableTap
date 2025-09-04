import ProfileSidebar from "../components/features/employee/landing/ProfileSidebar";
import NavCard from "../components/features/employee/landing/NavCard";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  //opens sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const navigateToTables = () => {
    navigate("/tables");
  };

  const navigateToCatalog = () => {
    navigate("/catalog");
  };

  return (
    <div
      className="d-flex flex-column"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="d-flex flex-grow-1" style={{ height: "100%" }}>
        {/* Left main area */}
        <div
          className="flex-grow-1 d-flex justify-content-center align-items-center gap-5 bg-light"
          style={{ height: "100%" }}
        >
          <NavCard
            label="Tables"
            color="#32ff7e"
            icon="icon"
            onClick={navigateToTables}
          />
          <NavCard
            label="Catalog"
            color="#ff6b6b"
            icon="icon"
            onClick={navigateToCatalog}
          />
        </div>
        {/* Right area */}
        <ProfileSidebar />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
