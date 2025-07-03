import { useState } from "react";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import OverlaySidebarShell from "../components/features/employee/assets/OverlaySidebar/OverlaySidebarShell";
import ListGroup from "../components/features/employee/assets/ListGroup";

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overlaySidebarOpen, setOverlaySidebarOpen] = useState(false);

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/*TEST Overlay Sidebar*/}
        <div className="p-4">
          <button onClick={() => setOverlaySidebarOpen(true)}></button>
          <OverlaySidebarShell title="modifier" isOpen={overlaySidebarOpen} onClose={() => setOverlaySidebarOpen(false)}
            onSave={(title) => console.log("Saved:", title)}>
            <ListGroup items={["Beef", "Chicken", "Etc."]} title="Modifier"></ListGroup>
          </OverlaySidebarShell>
        </div>
    </div>
  );
};

export default Assets;
