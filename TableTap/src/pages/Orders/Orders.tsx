import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Navbar from "../../components/features/employee/global/Navbar";
import Sidebar from "../../components/features/employee/global/Sidebar";
import CartPanel from "../../components/features/employee/order/CartPanel";
import CategoriesPanel from "../../components/features/employee/order/CategoriesPanel";
import MenuItemsPanel from "../../components/features/employee/order/MenuItemsPanel";
import { useTableNumber } from "../../hooks/useTableNumber";
import { useCategories } from "../../hooks/useCategories";
import { useMenuItems } from "../../hooks/useMenuItems";
import { useOrderItems } from "../../hooks/useOrderItems";
import { addItemToCart } from "../../utils/cartUtils";
import "./Orders.css"; // Import CSS file

function Orders() {
  // Navigation
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();
  const navigateBack = () => {
    setCart([]); // Clear cart on back navigation
    navigate("/tables");
  };

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Hooks for Data Fetching
  const tableNumber = useTableNumber(tableId);
  const { categories, catsLoading, catsError } = useCategories();
  const { items, itemsLoading, itemsError } = useMenuItems();
  const { cart, setCart } = useOrderItems(tableId, setSaveError);

  // Save Order Handler
  const handleSave = async () => {
    if (!tableId || cart.length === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Validate cart items
      const invalidItems = cart.filter((item) => !item.item_id || !item.price);
      if (invalidItems.length > 0) {
        throw new Error(
          `Invalid menu items in cart: ${invalidItems
            .map((i) => i.title)
            .join(", ")}`
        );
      }

      // Check for existing open order
      const { data: existingOrder, error: orderError } = await supabase
        .from("customer_orders")
        .select("order_id")
        .eq("table_id", tableId)
        .eq("status", "closed")
        .single();

      let orderId: string;
      if (orderError || !existingOrder) {
        // Create new order if none exists
        const { data: newOrder, error: newOrderError } = await supabase
          .from("customer_orders")
          .insert([{ table_id: tableId, status: "preparing" }])
          .select("order_id")
          .single();
        if (newOrderError)
          throw new Error(`Failed to create order: ${newOrderError.message}`);
        orderId = newOrder.order_id;
      } else {
        orderId = existingOrder.order_id;
      }

      // Delete existing order items and insert updated cart
      await supabase.from("order_items").delete().eq("order_id", orderId);
      const orderItems = cart.map((item) => ({
        order_id: orderId,
        item_id: item.item_id,
        quantity: item.count,
        price_each: item.price,
        note: item.note || null,
      }));
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError)
        throw new Error(`Failed to save order items: ${itemsError.message}`);

      // Clear cart and navigate back
      setCart([]);
      navigate("/tables");
    } catch (e: any) {
      setSaveError(e.message);
      console.error("Error saving order:", e.message);
    } finally {
      setSaving(false);
    }
  };

  // Render with Error Boundary
  if (!tableId) {
    return <div className="orders-container">Invalid table ID</div>; // Fallback for undefined tableId
  }

  return (
    <div className="orders-container">
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <CartPanel
          cart={cart}
          setCart={setCart}
          tableNumber={tableNumber}
          saveError={saveError}
          saving={saving}
          onSave={handleSave}
          onBack={navigateBack}
        />
        <CategoriesPanel
          categories={categories}
          catsLoading={catsLoading}
          catsError={catsError}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setSearch={setSearch}
        />
        <MenuItemsPanel
          items={items}
          itemsLoading={itemsLoading}
          itemsError={itemsError}
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          addItemToCart={(item) => addItemToCart(cart, setCart, item)}
        />
      </div>
    </div>
  );
}

export default Orders;
