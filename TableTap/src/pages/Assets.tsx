import { useState } from "react";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import OverlaySidebarShell from "../components/features/employee/assets/OverlaySidebar/OverlaySidebarShell";
import ListGroup from "../components/features/employee/assets/ListGroup";
import AssetNavigationSidebar from "../components/features/employee/assets/AssetNavigationSidebar";
import Dropdown from "../components/features/employee/assets/Dropdown/Dropdown";

interface AssetSectionSidebar{
  title: string;
  items: string[];
}

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overlaySidebarOpen, setOverlaySidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const handleItemSelect = (section: string, item: string) => {
    setSelectedSection(section);
    setSelectedItem(item);
  };
  const renderContent = () => {
    return <h1>{selectedSection}</h1>;
  };


  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>

      {/* Global Header & Navigation Sidebar*/}
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Page Content */}
      <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: "100%"}}>
        
          {/* Asset Sidebar (Left Side Content) */}
          <div className="border-end p-3" style={{ width: "280px", overflowY: "auto" }}>
            <AssetNavigationSidebar
              sections={[
                { title: "Modifier Groups", items: ["Test 1", "Test 2", "Test 3"] },
                { title: "Substitutions", items: ["Tofu", "Shrimp"] }
              ]}
              onSelect={handleItemSelect}
            />
          </div>

          {/* Right Side Content */}
          <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>

            {/* Render content based on the selected section/item */}
            {renderContent()}

            {/*TEST Overlay Sidebar*/}
            <div className="p-4">
              <button onClick={() => setOverlaySidebarOpen(true)}></button>
              <OverlaySidebarShell title="modifier" isOpen={overlaySidebarOpen} onClose={() => setOverlaySidebarOpen(false)}
                onSave={(title) => console.log("Saved:", title)}>
                <ListGroup items={["Beef", "Chicken", "Etc."]} title="Modifier"></ListGroup>

                <Dropdown title="Select modifier" 
                items={["Beef", "Chicken", "Test"]}
                onSelect={(item) => {
                  console.log("Dropdown selected:", item)
                }}></Dropdown>
              </OverlaySidebarShell>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Assets;
