import { useState, useEffect } from "react";
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
import type { CartItem } from "../../types/OrderTypes";
import "./Orders.css";

function Orders() {
  // Navigation
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();
  const navigateBack = () => {
    setCart([]);
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

    // Effect to load existing order items when component mounts or tableId changes
  useEffect(() => {
    const loadExistingOrder = async () => {
      if (!tableId) return;

      try {
        // Fetch the latest customer_order and its order_items for the table
        const { data: customerOrder, error: orderError } = await supabase
          .from("customer_orders")
          .select("order_id")
          .eq("table_id", tableId)
          .in("status", ["preparing"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (orderError && orderError.code !== "PGRST116") { // PGRST116 is "no rows"
          throw new Error(`Failed to fetch order: ${orderError.message}`);
        }

        if (customerOrder) {
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("item_id, quantity, price_each, note")
            .eq("order_id", customerOrder.order_id);

          if (itemsError) throw new Error(`Failed to fetch order items: ${itemsError.message}`);

          // Transform all order_items into cart format
          const loadedCart: CartItem[] = orderItems.map((item) => ({
            item_id: item.item_id,
            title: items.find((m) => m.item_id === item.item_id)?.title || "Unknown Item",
            count: item.quantity,
            price: item.price_each,
            note: item.note || "",
          }));
          setCart(loadedCart);
        }
      } catch (e: any) {
        setSaveError(e.message);
        console.error("Error loading existing order:", e.message);
      }
    };

    loadExistingOrder();
  }, [tableId, setCart, items]);

  // Save Order Handler
  const handleSave = async () => {
    if (!tableId || cart.length === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Step 1: Validate cart items

      // check id item doesnt have id or price
      const invalidItems = cart.filter((item) => !item.item_id || !item.price);

      // if there is > 0 invalid item, throw error
      if (invalidItems.length > 0) {
        throw new Error(
          `Invalid menu items in cart: ${invalidItems
            .map((i) => i.title)
            .join(", ")}`
        );
      }

      // Step 2: Check for existing open order

      // select if an existing order exist using customer_order table
      const { data: existingOrder, error: orderError } = await supabase
        .from("customer_orders")
        .select("order_id")
        .eq("table_id", tableId)
        .eq("status", "preparing")
        .single();

      let orderId: string;
      
      // Step 3: if theres an order error or theres no orders that exist insert new order, else return existing
      if (orderError || !existingOrder) {
        // insert newOrder data into customer_orders table
        const { data: newOrder, error: newOrderError } = await supabase
          .from("customer_orders")
          .insert([{ table_id: tableId, status: "preparing" }])
          .select("order_id")
          .single();
        // if newOrderError throw error
        if (newOrderError)
          throw new Error(`Failed to create order: ${newOrderError.message}`);
        orderId = newOrder.order_id;
      // orderId == exisiting orderID
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

      // Step 4: Update table status to 'occupied'
      const { error: updateTableError } = await supabase
        .from("tables")
        .update({ status: "occupied" })
        .eq("table_id", tableId);

      if (updateTableError) {
        throw new Error(`Failed to update table status: ${updateTableError.message}`);
      }

      // Clear cart and navigate back
      setCart([]);
    } catch (e: any) {
      setSaveError(e.message);
      console.error("Error saving order:", e.message);
    } finally {
      setSaving(false);
    }
    navigate("/tables");
  };

  // Close Order Handler
  const handleClose = async () => {
    if (!tableId) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Step 1: Find existing order for this table
      const { data: existingOrder, error: orderError } = await supabase
        .from("customer_orders")
        .select("order_id")
        .eq("table_id", tableId)
        .in("status", ["preparing", "ready"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (orderError && orderError.code !== "PGRST116") { // PGRST116 is "no rows"
        throw new Error(`Failed to fetch order: ${orderError.message}`);
      }

      // Step 2: Update order status to 'closed' if order exists
      if (existingOrder) {
        const { error: updateOrderError } = await supabase
          .from("customer_orders")
          .update({ status: "closed" })
          .eq("order_id", existingOrder.order_id);

        if (updateOrderError) {
          throw new Error(`Failed to close order: ${updateOrderError.message}`);
        }
      }

      // Step 3: Update table status to 'available'
      const { error: updateTableError } = await supabase
        .from("tables")
        .update({ status: "available" })
        .eq("table_id", tableId);

      if (updateTableError) {
        throw new Error(`Failed to update table status: ${updateTableError.message}`);
      }

      // Step 4: Clear cart and navigate back
      setCart([]);
      navigate("/tables");
    } catch (e: any) {
      setSaveError(e.message);
      console.error("Error closing order:", e.message);
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
          onClose={handleClose}
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
