import ProfileSidebar from "../components/ProfileSidebar";
import NavCard from "../components/NavCard";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

const EmployeeDashboard = () => {

  //opens sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        </div>
        {/* Right area */}
        <ProfileSidebar />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
