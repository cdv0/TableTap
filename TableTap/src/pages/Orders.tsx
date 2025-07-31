import { useState } from 'react';
import CategoryNavButton from '../components/features/employee/order/CategoryNavButton';
import Navbar from '../components/features/employee/global/Navbar';
import Sidebar from '../components/features/employee/global/Sidebar';
import { IoTrashOutline } from "react-icons/io5";

function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(1);

  const categories = [
  { title: "All", color: "gray" },
  { title: "Pho", color: "red" },
  { title: "Appetizer", color: "orange" },
  { title: "Vermicelli", color: "yellow" },
  { title: "Pad Thai", color: "green" },
  { title: "Rice Plates", color: "teal" },
  { title: "Fried Rice", color: "blue" },
  { title: "Stir Fry", color: "purple" },
  { title: "Soups", color: "indigo" },
  { title: "Drinks", color: "pink" },
  { title: "Extras", color: "brown" },
];

  const items = [
    { title: "Happy Pho Special 1", color: "red", category: "Pho" },
    { title: "Happy Pho Special 2", color: "red", category: "Pho" },
    { title: "Happy Pho Special 3", color: "red", category: "Pho" },
    { title: "Egg Rolls", color: "orange", category: "Appetizer" },
    { title: "Chicken Pad Thai", color: "green", category: "Pad Thai" },
    { title: "Vermicelli", color: "yellow", category: "Vermicelli" }
  ]

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: '100%' }}>
        <div
          className="border-end p-3 d-flex flex-column justify-content-between"
          style={{ width: '30vw', minWidth: '300px', maxWidth: '30vw', overflowY: 'auto', flexShrink: 0 }}
        >
          <div>
            <h1>Table 1</h1>
            <hr />
          </div>
          <div className="d-flex justify-content-center">
            <button type="button" className="btn" style={{ width: '20vw', borderRadius: '50px', background: 'rgba(223, 223, 223, 1)'}}>Back</button>
          </div>
        </div>

        <div
          className="border-end p-3 d-flex flex-column justify-content-between"
          style={{ width: '15vw', minWidth: '200px', maxWidth: '15vw', overflowY: 'auto', background: 'rgba(245, 245, 245, 1)', flexShrink: 0 }}
        >
          <div className="d-flex flex-column justify-content-between align-items-center mb-3 gap-2">
            {categories.map((cat) => (
              <CategoryNavButton key={cat.title} text={cat.title} color={cat.color} onClick={() => {setSelectedCategory(cat.title); setSelectedItem(null);}}></CategoryNavButton>
            ))}
          </div>
        </div>

        <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
          <div className="mb-3">
            <input placeholder="Search" className="form-control" />
          </div>

          {selectedItem && (
            <div className="mb-4 p-3 border rounded bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 align-items-center">{selectedItem}</h5>
              <div className="d-flex align-items-center gap-3">
                <button type="button" className="btn"><IoTrashOutline style={{ fontSize: '1.5rem', color: 'rgba(173, 41, 41, 1)'}}></IoTrashOutline></button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setItemCount(prev => Math.max(1, prev - 1))}>-</button>
                <span>{itemCount}</span>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setItemCount(prev => prev + 1)}>+</button>
              </div>
            </div>
          )}

          <div className="d-flex flex-wrap gap-3">
            {items
              .filter(item => selectedCategory === "All" || item.category === selectedCategory)
              .map((item) => (
                <CategoryNavButton key={item.title} text={item.title} color={item.color} onClick={() => {
                  setSelectedItem(item.title)
                  setItemCount(1)
                }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;