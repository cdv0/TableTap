import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ItemAdjust from "../components/features/employee/customer/ItemAdjust";
import type { PhoResult } from "../components/features/employee/customer/ItemAdjust";

type MenuItem = {
  id: string;
  title: string;
  desc: string;
  price: number;
  img: string;
  category: string;
};

// Test Data
const CATEGORIES = ["Popular", "Appetizer", "Pho", "Vermicelli", "Rice", "Drinks", "Desserts"];

const MENU: MenuItem[] = [
  { id: "1", title: "Happy Pho Special", desc: "Rare steak, brisket, tendon, tripe, meatball", price: 12.95, img: "/pho.png", category: "Popular" },
  { id: "2", title: "Spring Rolls", desc: "Shrimp, herbs, peanut sauce", price: 7.50, img: "/pho.png", category: "Appetizer" },
  { id: "3", title: "Pho Tai", desc: "Rare steak", price: 11.95, img: "/pho.png", category: "Pho" },
  { id: "4", title: "Vermicelli Bowl", desc: "Grilled pork, egg roll, herbs", price: 12.50, img: "/pho.png", category: "Vermicelli" },
  { id: "5", title: "Iced Coffee", desc: "Vietnamese style", price: 5.00, img: "/pho.png", category: "Drinks" },
];

export default function PublicOrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const [activeCat, setActiveCat] = useState<string>("Popular");
  const [query, setQuery] = useState<string>("");

  // tracks if customization screen is open or closed
  const [phoOpen, setPhoOpen] = useState(false);

  // Filter items
  const items = useMemo(() => {
    const base = MENU.filter(
      (m) => m.category === activeCat || (activeCat === "Popular" && m.category === "Popular")
    );
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((m) => m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
  }, [activeCat, query]);

  // Handle add from Pho customization screen
  const handlePhoAdd = (res: PhoResult) => {
    console.log("Pho built:", res);
    setPhoOpen(false);
  };

  const isPho = (title: string) => title.toLowerCase().includes("pho");

  return (
    <div className="mx-auto bg-white" style={{ maxWidth: 480, minHeight: "100vh" }}>
      {/* Top bar */}
      <div className="d-flex align-items-center p-2 gap-2 border-bottom sticky-top bg-white" style={{ top: 0, zIndex: 10 }}>
        <input
          className="form-control"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search menu"
        />
        <button className="btn btn-light" title="Current order">📖</button>
        <button className="btn btn-light" title="Cart">🛒</button>
      </div>

      {/* Category Tabs */}
      <div
        className="d-flex gap-2 px-2 py-2 border-bottom"
        style={{ overflowX: "auto", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch" }}
        role="tablist"
        aria-label="Menu categories"
      >
        {CATEGORIES.map((cat) => {
          const active = activeCat === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={active}
              className={`btn btn-sm ${active ? "btn-danger text-white" : "btn-outline-secondary"}`}
              style={{ flex: "0 0 auto" }}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Previous order banner */}
      <button className="w-100 text-start border-0 bg-transparent px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
        <span className="small">View your previous order</span>
        <span aria-hidden>›</span>
      </button>

      {/* Section title */}
      <div className="px-3 pt-3 pb-2">
        <h6 className="m-0">{activeCat}</h6>
      </div>

      {/* Menu list */}
      <div className="px-3 pb-4 vstack gap-2">
        {items.map((item) => (
          <div key={item.id} className="border rounded d-flex p-2 align-items-start">
            <img
              src={item.img}
              alt={item.title}
              width={80}
              height={80}
              className="me-2 rounded"
              style={{ objectFit: "cover", background: "#f2f2f2" }}
            />
            <div className="flex-grow-1">
              <div className="fw-semibold">{item.title}</div>
              <div className="text-muted small">{item.desc}</div>
              <div className="mt-1">${item.price.toFixed(2)}</div>
            </div>

            {isPho(item.title) ? (
              <button
                className="btn btn-outline-dark btn-sm ms-2"
                onClick={() => setPhoOpen(true)}
              >
                Customize
              </button>
            ) : (
              <button
                className="btn btn-outline-dark btn-sm ms-2"
                onClick={() => console.log("Add non-Pho item:", item)}
              >
                Add
              </button>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center text-muted small py-4">No items found.</div>
        )}
      </div>

      {/* Pho customization screen */}
      <ItemAdjust
        open={phoOpen}
        onClose={() => setPhoOpen(false)}
        onAdd={handlePhoAdd}
      />
    </div>
  );
}