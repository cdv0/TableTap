import ProfileSidebar from "../components/features/employee/landing/ProfileSidebar";
import NavCard from "../components/features/employee/landing/NavCard";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigateToAssets = () => {
    navigate("/assets");
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
          <NavCard label="Tables" color="#32ff7e" icon="icon" />
          <NavCard
            label="Assets"
            color="#ffc75f"
            icon="icon"
            onClick={navigateToAssets}
          />
        </div>
        {/* Right area */}
        <ProfileSidebar />
      </div>
    </div>
  );
};

export default AdminDashboard;
