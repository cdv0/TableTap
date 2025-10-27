import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ItemAdjust from "../components/ItemAdjust";
import type { PhoResult } from "../components/ItemAdjust";
import { loadCart, saveCart, type CartLine } from "../../shared/utils/cart";
import { fetchCategories, fetchItems } from "../../shared/services/assets";

type MenuItem = {
  id: string;
  title: string;
  desc: string;
  price: number;
  img: string;
  category: string;
};

export default function PublicOrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();

  const orgId = "d15730c2-012b-4238-a037-873c03ce68fa";
  const [activeCat, setActiveCat] = useState<string>("Popular");
  const [query, setQuery] = useState<string>("");
  const [phoOpen, setPhoOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);


  // Cart 
  const [cart, setCart] = useState<CartLine[]>(() => loadCart(tableId));
  useEffect(() => { saveCart(tableId, cart); }, [cart, tableId]);
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);

  // live categories & menu items
  const [categories, setCategories] = useState<string[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Fetch from Supabase and normalize to your MenuItem shape
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [cats, items] = await Promise.all([
          fetchCategories(orgId),
          fetchItems(orgId),
        ]);
        if (!alive) return;

        const catMap = new Map(cats.map(c => [c.category_id, c.name]));
        const catNames = cats.map(c => c.name);

        // keep “Popular” default if present
        const initial =
          catNames.find(n => n.toLowerCase() === "popular") ??
          catNames[0] ??
          "Popular";

        const normalized: MenuItem[] = (items ?? [])
          .filter(i => i.is_addon !== true) // hide add-ons from the main listing
          .map(i => ({
            id: i.item_id,
            title: i.name,
            desc: i.description ?? "",
            price: Number(i.price ?? 0),
            img: "/placeholder.png", // set to real image when available
            category: catMap.get(i.category_id) ?? "Uncategorized",
          }));

        setCategories(catNames);
        setMenu(normalized);
        setActiveCat(initial);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Failed to load menu.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [orgId]);

  // Filter items (unchanged)
  const items = useMemo(() => {
    const base = menu.filter(
      (m) => m.category === activeCat || (activeCat === "Popular" && m.category === "Popular")
    );
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((m) => m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
  }, [menu, activeCat, query]);

  // Add-to-cart
  const handlePhoAdd = (res: PhoResult) => {
  if (!selectedItem) return;

  const clientLineId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `line-${Date.now()}`;

  setCart(prev => [
    ...prev,
    {
      id: clientLineId,                 // client-only id (NOT sent to DB)
      title: selectedItem.title,
      unitPrice: res.unitPrice,
      qty: res.qty,
      meta: {
        ...res,
        item_id: selectedItem.id,       // <-- REAL UUID for DB
      },
    },
  ]);

  setPhoOpen(false);
  setSelectedItem(null);
  };

  const addSimpleItem = (mi: MenuItem) => {
    setCart(prev => {
      const i = prev.findIndex(l => l.id === mi.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { 
          ...next[i], 
          qty: next[i].qty + 1,
          meta: { item_id: mi.id, ...next[i].meta }
        };
        return next;
      }
      return [...prev, { 
        id: mi.id, 
        title: mi.title, 
        unitPrice: mi.price, 
        qty: 1,
        meta: { item_id: mi.id }
      }];
    });
  };

  const openCart = () => navigate(`/customer/order/${tableId}/cart`);
  const isPho = (title: string) => title.toLowerCase().includes("pho");

  if (loading) {
    return (
      <div className="mx-auto" style={{ maxWidth: 480, minHeight: "100vh", backgroundColor: "#F5F5F5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div className="p-3" style={{ color: "#666" }}>Loading menu…</div>
      </div>
    );
  }
  if (err) {
    return (
      <div className="mx-auto" style={{ maxWidth: 480, minHeight: "100vh", backgroundColor: "#F5F5F5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div className="alert alert-danger m-3">{err}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 480, minHeight: "100vh", backgroundColor: "#F5F5F5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* White header component with search and categories */}
      <div 
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #E0E0E0"
        }}
      >
        {/* Search bar */}
        <div 
          className="px-3 mt-3"
          style={{
            paddingTop: "4px",
            paddingBottom: "4px"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <div className="flex-grow-1 position-relative">
              <input
                className="form-control"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search menu"
                style={{ 
                  backgroundColor: "#E0E0E0", 
                  border: "none", 
                  borderRadius: "20px", 
                  padding: "12px 16px",
                  fontSize: "16px"
                }}
              />
              <span className="position-absolute top-50 end-0 translate-middle-y me-3" style={{ color: "#666" }}>🔍</span>
            </div>
            <button 
              className="btn btn-link p-2" 
              title="Current order" 
              onClick={() => navigate(`/customer/order/${tableId}/orders`)}
              style={{ color: "#333", fontSize: "20px" }}
            >
              📖
            </button>
            <button 
              className="btn btn-link p-2 position-relative" 
              title="Cart" 
              onClick={openCart}
              style={{ color: "#333", fontSize: "20px" }}
            >
              🛒
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger" style={{ fontSize: "10px" }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div
          className="d-flex gap-2 px-3"
          style={{ 
            overflowX: "auto", 
            whiteSpace: "nowrap", 
            WebkitOverflowScrolling: "touch",
            paddingTop: "8px",
            paddingBottom: "8px"
          }}
          role="tablist"
          aria-label="Menu categories"
        >
          {categories.map((cat) => {
            const active = activeCat === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={active}
                className="btn btn-sm"
                style={{ 
                  flex: "0 0 auto",
                  backgroundColor: active ? "#FFC0CB" : "white",
                  color: "#333",
                  border: active ? "none" : "1px solid #E0E0E0",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>


      {/* Section title */}
      <div className="px-3 pt-2 pb-2">
        <h6 className="m-0" style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>{activeCat}</h6>
      </div>

      {/* Menu list */}
      <div className="px-3 pb-4 vstack" style={{ gap: "10px" }}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className="d-flex"
            style={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              padding: "0",
              border: "1px solid #E0E0E0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              overflow: "hidden",
              height: "100px"
            }}
            onClick={() => {
              if (isPho(item.title)) {
                setSelectedItem(item);
                setPhoOpen(true);
              } else {
                addSimpleItem(item);
              }
            }}
          >
            <img
              src={item.img}
              alt={item.title}
              style={{ 
                objectFit: "cover", 
                background: "#f2f2f2",
                borderRadius: "12px 0 0 12px",
                margin: "0",
                flexShrink: "0",
                height: "100%",
                width: "100px"
              }}
            />
            <div 
              className="flex-grow-1"
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}
            >
              <div 
                className="fw-semibold mb-1" 
                style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  color: "#333",
                  lineHeight: "1.3"
                }}
              >
                {item.title}
              </div>
              <div 
                className="text-muted mb-2" 
                style={{ 
                  fontSize: "14px", 
                  color: "#666",
                  lineHeight: "1.4"
                }}
              >
                {item.desc}
              </div>
              <div 
                style={{ 
                  fontSize: "16px", 
                  fontWeight: "500", 
                  color: "#333"
                }}
              >
                ${item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center text-muted small py-4" style={{ color: "#666" }}>No items found.</div>
        )}
      </div>

      {/* Pho customization screen */}
      {selectedItem && (
        <ItemAdjust
          open={phoOpen}
          onClose={() => {
            setPhoOpen(false);
            setSelectedItem(null); //clear on close
    }}
      onAdd={handlePhoAdd}
      orgId={orgId}                       
      menuItemId={selectedItem.id}        
      baseTitle={selectedItem.title}      
      basePrice={selectedItem.price}      
  />
)}
    </div>
  );
}
