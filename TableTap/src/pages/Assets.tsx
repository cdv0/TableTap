import { useState } from "react";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import OverlaySidebarShell from "../components/features/employee/assets/OverlaySidebar/OverlaySidebarShell";
import ListGroup from "../components/features/employee/assets/ListGroup";
import AssetNavigationSidebar from "../components/features/employee/assets/AssetNavigationSidebar";
import Dropdown from "../components/features/employee/assets/Dropdown/Dropdown";
import { GoPencil } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";


interface AssetSectionSidebar{
  title: string;
  items: string[];
}

{/* TEST DATA for Categories */}
const sampleCategoryData = [
  {
    title: "Pho",
    items: [
      {
        name: "1. Happy Pho Special",
        description: "Served with Rare Steak, Brisket, Tendon, Tripe, and Meatball"
      },
      {
        name: "2. Rare Steak Beef, Brisket, and Tripe",
        description: "Served with Rare Steak, Brisket, and Tripe"
      }
    ]
  },
  {
    title: "Appetizer",
    items: [
      {
        name: "Sampler Roll",
        description: "Served with 2 Egg rolls, 2 Shrimp rolls, and 2 Spring rolls"
      },
      {
        name: "Vietnamese Grilled Pork Sausage",
        description: "Served with 2 Grilled Pork Sausage spring rolls"
      }
    ]
  },
  {
    title: "Vermicelli",
    items: [
      {
        name: "Vermicelli Soup",
        description: "Served with either Chicken or Shrimp"
      },
      {
        name: "Vermicelli Bowl",
        description:
          "Served with a choice of 1 item. Comes with an egg roll, shredded lettuce, carrots, cucumbers, crushed peanuts, and a side of fish sauce"
      }
    ]
  }
];

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overlaySidebarOpen, setOverlaySidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>("Categories");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<"Categories" | "Modifier groups" | "Substitution" | "All modifier items">("Categories");
  
  const handleItemSelect = (section: string, item: string) => {
    setSelectedSection(section);
    setSelectedItem(item);
  };
    
  const renderContent = () => {
    return (
      <>
        {/* TEMPORARY: Replace with databse data */}
        {sampleCategoryData.map((group, index) => (
          <div className="mb-4" key={index}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
              <h4 className="m-0">{group.title}</h4>
              <div>
                <button className="btn btn-sm btn-outline-secondary me-2"><GoPencil/></button>
                <button className="btn btn-sm btn-outline-secondary me-2"><IoTrashOutline/></button>
                <button className="btn btn-sm btn-outline-secondary"><FaPlus/></button>
              </div>
            </div>

            {group.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="d-flex justify-content-between align-items-start border rounded px-3 py-2 mb-2"
                style={{ backgroundColor: "#fff" }}
              >
                <div>
                  <div className="fw-bold text-danger">{item.name}</div>
                  <div className="text-muted" style={{ fontSize: "0.9rem" }}>{item.description}</div>
                </div>
                <button className="btn btn-sm mt-1"><GoPencil/></button>
              </div>
            ))}
          </div>
        ))}
      </>
    );
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
                { title: "Categories", items: ["Category 1", "Category 2", "Category 3"] },
                { title: "Modifier Groups", items: ["Test 1", "Test 2", "Test 3"] },
                { title: "Substitutions", items: ["Tofu", "Shrimp"] }
              ]}
              onSelect={handleItemSelect}
            />
          </div>

          {/* Right Side Content */}
          <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>

            {/* Title Top Bar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1>{selectedSection}</h1>
              <button className="btn btn-danger" onClick={() => setOverlaySidebarOpen(true)}>Add {selectedSection}</button>
            </div>

            {/* Render content based on the selected section/item */}
            {selectedSection === "Categories" && renderContent()}

            {/*TEST Overlay Sidebar*/}
            <div className="p-4 flex-grow-1" style={{ overflowY: "auto"}}>
              <OverlaySidebarShell
                title={selectedSection === "Substitutions" ? "substitution" : selectedSection === "Modifier Groups" ? "modifier": "category"}
                isOpen={overlaySidebarOpen}
                onClose={() => setOverlaySidebarOpen(false)}
                onSave={(title) => console.log("Saved:", title)}
              >
                {selectedSection === "Categories" && (
                  <>
                    <ListGroup items={["Category 1", "Category 2", "Category 3"]} title="Category" />
                    <Dropdown
                      title="Select category"
                      items={["Category 1", "Category 2"]}
                      onSelect={(item) => console.log("Dropdown selected:", item)}
                    />
                  </>
                )}

                {selectedSection === "Modifier Groups" && (
                  <>
                    <ListGroup items={["Group 1", "Group 2", "Group 3"]} title="Modifier" />
                    <Dropdown
                      title="Select modifier"
                      items={["Item 1", "Item 2"]}
                      onSelect={(item) => console.log("Dropdown selected:", item)}
                    />
                  </>
                )}

                {selectedSection === "Substitutions" && (
                  <>
                    <ListGroup items={["Modifier 1", "Modifier 2", "Modifier 3"]} title="Substitution" />
                    <Dropdown
                      title="Select substitution"
                      items={["Item 1", "Item 2", "Item 3"]}
                      onSelect={(item) => console.log("Dropdown selected:", item)}
                    />
                  </>
                )}
              </OverlaySidebarShell>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Assets;
