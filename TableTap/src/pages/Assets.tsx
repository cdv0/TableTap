import { useState } from "react";
import Navbar from "../components/Navbar";
import AssetNavigationSidebar from "../components/AssetNavigationSidebar"
import OverlaySidebarShell from "../components/OverlaySidebarShell"

const Assets = () => {
  const [showOverlaySidebar, setShowOverlaySidebar] = useState(false);

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar heading="Assets" />

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
