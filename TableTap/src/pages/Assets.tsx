import { useState } from "react";
import Navbar from "../components/Navbar";
import AssetNavigationSidebar from "../components/AssetNavigationSidebar"
import OverlaySidebarShell from "../components/OverlaySidebarShell"
import Sidebar from "../components/Sidebar";

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOverlaySidebar, setShowOverlaySidebar] = useState(false);

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar heading="Table Tap" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="d-flex flex-row flex-grow-1 overflow-hidden">
        <AssetNavigationSidebar/>

        <div>
          <h1>Assets</h1>
          {/*TEST SIDEBAR OVERLAY*/}
          <button onClick={() => setShowOverlaySidebar(true)}>Open sidebar</button>
        </div>

      </div>

      {/* TEST: Overlay Sidebar*/}
      {showOverlaySidebar &&
        <OverlaySidebarShell title="Menu item" group="Add modifier group" onClose={() => {setShowOverlaySidebar(false)}} onSave={() => {}}>
          <p>Test</p>
        </OverlaySidebarShell>
      }

    </div>
  );
};

export default Assets;
