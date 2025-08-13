import CategoryNavButton from "../../components/features/employee/order/CategoryNavButton";
import Navbar from "../../components/features/employee/global/Navbar";
import Sidebar from "../../components/features/employee/global/Sidebar";
import { IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

interface MenuItem {
  title: string;
  color: string;
  category: string;
}

interface CartItem extends MenuItem {
  count: number;
}

function Orders() {
  // Navigation
  const navigate = useNavigate();
  const navigateBack = () => {
    navigate("/tables");
  };

  const params = useParams();
  const tableId = params.tableId!;
  const storageKey = `order_table_${tableId}`;

  // UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  // CART
  const [cart, setCart] = useState<CartItem[]>([]);

  // CATEGORIES
  const [rawCats, setRawCats] = useState<any[]>([]);
  const [categories, setCategories] = useState<
    { title: string; color: string }[]
  >([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  // ITEMS
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // Load cart from LocalStorage
  useEffect(() => {
    if (!tableId) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {}
    }
  }, [tableId]);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      setCatsLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name", { ascending: true });
      if (error) setCatsError(error.message);
      else if (data) setRawCats(data);
      setCatsLoading(false);
    };
    fetchCats();
  }, []);

  // Map [{title,color}]
  useEffect(() => {
    const mapped = rawCats.map((r) => ({
      title: r.name,
      color: "gray",
    }));
    setCategories([{ title: "All", color: "gray" }, ...mapped]);
  }, [rawCats]);

  // Fetch menu items
  useEffect(() => {
    const fetchItems = async () => {
      setItemsLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select(
          `
        item_id,
        name,
        price,
        category_id,
        categories ( name )
      `
        )
        .eq("status", "serving")
        .order("name", { ascending: true });

      if (error) {
        setItemsError(error.message);
      } else if (data) {
        setItems(
          data.map((row: any) => ({
            title: row.name,
            color: "gray",
            category: row.categories.name,
          }))
        );
      }

      setItemsLoading(false);
    };

    fetchItems();
  }, []);

  // -----cart maniputlation functions-----

  // save cart (save button)
  const handleSave = () => {
    if (!tableId) return;
    localStorage.setItem(storageKey, JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("order-saved", { detail: { tableId } })
    );
    navigate("/tables");
  };

  //add an item to the cart
  const addItemToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.title === item.title);
      if (existing) {
        //if item is already in cart, increase count by 1
        return prev.map((c) =>
          c.title === item.title ? { ...c, count: c.count + 1 } : c
        );
      } else {
        return [...prev, { ...item, count: 1 }];
      }
    });
  };

  // change quanitity of a cart item
  const updateCartCount = (title: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.title === title ? { ...c, count: Math.max(1, c.count + delta) } : c
        )
        .filter((c) => c.count > 0)
    );
  };

  // remove an item from cart
  const removeFromCart = (title: string) => {
    setCart((prev) => prev.filter((c) => c.title !== title));
  };

  // search bar filter function
  const searchItems = useMemo(() => {
    return items
      .filter(
        (it) => selectedCategory === "All" || it.category === selectedCategory
      )
      .filter((it) => it.title.toLowerCase().includes(search.toLowerCase()));
  }, [items, selectedCategory, search]);

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main horizontal layout: left cart, category sidebar, main items */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Left panel: CART */}
        <div
          className="border-end p-3 d-flex flex-column justify-content-between"
          style={{
            width: "30vw",
            minWidth: "300px",
            maxWidth: "30vw",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div>
            <h1>Table {tableId} </h1>
            <hr />

            {/* List of cart items */}
            <div className="list-group">
              {cart.map((ci) => (
                <div
                  key={ci.title}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  style={{ padding: "0.5rem 0.75rem" }}
                >
                  {/* item */}
                  <div className="d-flex justify-content-between align-items-center w-100 mt-1 mb-1">
                    <div className="d-flex gap-3">
                      <small className="text-secondary">{ci.count}</small>
                      <span style={{ fontWeight: 600 }}>{ci.title}</span>
                    </div>

                    {/* Buttons to decrement, increment, or remove */}
                    {/* TESTING FOR NOW, WILL REPLACE WITH EDIT BUTTON */}
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => updateCartCount(ci.title, -1)}
                        aria-label={`decrease ${ci.title}`}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => updateCartCount(ci.title, +1)}
                        aria-label={`increase ${ci.title}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => removeFromCart(ci.title)}
                        aria-label={`remove ${ci.title}`}
                      >
                        <IoTrashOutline
                          style={{ fontSize: "1rem", color: "#ad2929" }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons at bottom of cart */}
          <div className="d-flex flex-column justify-content-center align-items-center gap-3">
            <button
              type="button"
              className="btn"
              style={{
                width: "80%",
                borderRadius: "50px",
                background: "rgba(223, 223, 223, 1)",
              }}
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="btn"
              style={{
                width: "80%",
                borderRadius: "50px",
                background: "rgba(223, 223, 223, 1)",
              }}
              onClick={navigateBack}
            >
              Back
            </button>
          </div>
        </div>

        {/* Middle sidebar: CATEGORIES */}
        <div
          className="border-end p-3 d-flex flex-column justify-content-between"
          style={{
            width: "15vw",
            minWidth: "200px",
            maxWidth: "15vw",
            overflowY: "auto",
            background: "rgba(245, 245, 245, 1)",
            flexShrink: 0,
          }}
        >
          <div className="d-flex flex-column justify-content-between align-items-center mb-3 gap-2">
            {categories.map((cat) => (
              <CategoryNavButton
                key={cat.title}
                text={cat.title}
                color={cat.color}
                onClick={() => {
                  setSelectedCategory(cat.title);
                  setSearch("");
                }}
              ></CategoryNavButton>
            ))}
          </div>
        </div>

        {/* Right/main area: search + items to add */}
        <div className="flex-grow-1 p-3 overflow-auto">
          <input
            type="text"
            placeholder="Search…"
            className="form-control mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {itemsLoading ? (
            <p>Loading items…</p>
          ) : itemsError ? (
            <p className="text-danger">Error: {itemsError}</p>
          ) : searchItems.length === 0 ? (
            <p className="text-muted">No items match filter</p>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {searchItems.map((item) => (
                <CategoryNavButton
                  key={item.title}
                  text={item.title}
                  color={item.color}
                  onClick={() => addItemToCart(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
