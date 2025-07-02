import Navbar from "../components/global/Navbar";
import Sidebar from "../components/global/Sidebar";
import { useState } from "react";

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div>
        <h1>Assets</h1>
      </div>
    </div>
  );
};

export default Assets;
