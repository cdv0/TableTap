import { useState } from "react";
import CategoryNavButton from "../../components/features/employee/order/CategoryNavButton";
import Navbar from "../../components/features/employee/global/Navbar";
import Sidebar from "../../components/features/employee/global/Sidebar";
import { IoTrashOutline } from "react-icons/io5";

interface MenuItem {
  title: string;
  color: string;
  category: string;
}

// adds the number count for the item
interface CartItem extends MenuItem {
  count: number;
}

function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  // hardcoded data
  //TODO implement backend fetch requests to get categories
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

  //hardcoded data
  //TODO implement backend fetch requests to get menu items
  const items = [
    { title: "Happy Pho Special 1", color: "red", category: "Pho" },
    { title: "Happy Pho Special 2", color: "red", category: "Pho" },
    { title: "Happy Pho Special 3", color: "red", category: "Pho" },
    { title: "Egg Rolls", color: "orange", category: "Appetizer" },
    { title: "Chicken Pad Thai", color: "green", category: "Pad Thai" },
    { title: "Vermicelli", color: "yellow", category: "Vermicelli" },
  ];

  // -----cart maniputlation functions-----

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
  const searchItems = items
    .filter(
      (item) => selectedCategory === "All" || item.category === selectedCategory
    )
    .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main horizontal layout: left cart, category sidebar, main items */}
      <div
        className="d-flex flex-grow-1 overflow-hidden"
        style={{ height: "100%" }}
      >
        {/* Left panel: the current table's order (cart) */}
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
            <h1>Table 1</h1>
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
            >
              Back
            </button>
          </div>
        </div>

        {/* Middle sidebar: category filter buttons */}
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
        <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
          {/* Search input */}
          <div className="mb-3">
            <input
              placeholder="Search"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)} // update search state
            />
          </div>

          {/* Grid / list of available items after filtering */}
          <div className="d-flex flex-wrap gap-3">
            {searchItems.map((item) => (
              <CategoryNavButton
                key={item.title}
                text={item.title}
                color={item.color}
                onClick={() => addItemToCart(item)} // add item to cart when clicked
              />
            ))}

            {/* Shown if no items pass the filters */}
            {searchItems.length === 0 && (
              <div className="text-muted">No items match filter</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
