import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../shared/supabaseClient";
import Navbar from "../../components/global/Navbar";
import Sidebar from "../../components/global/Sidebar";
import CartPanel from "../../components/order/CartPanel";
import CategoriesPanel from "../../components/order/CategoriesPanel";
import MenuItemsPanel from "../../components/order/MenuItemsPanel";
import { useTableNumber } from "../../../shared/hooks/useTableNumber";
import { useCategories } from "../../../shared/hooks/useCategories";
import { useMenuItems } from "../../../shared/hooks/useMenuItems";
import { useOrderItems } from "../../../shared/hooks/useOrderItems";
import { addItemToCart } from "../../../shared/utils/cartUtils";
import type { CartItem } from "../../../shared/types/OrderTypes";
import "./Orders.css";

function Orders() {
  // Navigation
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();
  const navigateBack = () => {
    setCart([]);
    navigate("/restaurant/tables");
  };

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  // Hooks for Data Fetching
  const tableNumber = useTableNumber(tableId);
  const { categories, catsLoading, catsError } = useCategories();
  const { items, itemsLoading, itemsError } = useMenuItems();
  const { cart, setCart } = useOrderItems(tableId, setSaveError);

  // Edit handlers
  const handleEditItem = (item: CartItem, index: number) => {
    setEditingItem(item);
    setEditingIndex(index);
  };

  const handleSaveEdit = (updatedItem: CartItem) => {
    if (editingIndex >= 0) {
      const originalItem = cart[editingIndex];
      const newCart = [...cart];
      newCart[editingIndex] = updatedItem;
      setCart(newCart);
      
      // Debug logging for modifier changes
      console.log(`=== Modifier Update for Item: ${updatedItem.title} ===`);
      console.log('Original modifiers:', originalItem.modifiers || []);
      console.log('Updated modifiers:', updatedItem.modifiers || []);
      
      const originalModifierCount = originalItem.modifiers?.length || 0;
      const updatedModifierCount = updatedItem.modifiers?.length || 0;
      
      if (updatedModifierCount > originalModifierCount) {
        console.log(`Added ${updatedModifierCount - originalModifierCount} modifier(s)`);
      } else if (updatedModifierCount < originalModifierCount) {
        console.log(`Removed ${originalModifierCount - updatedModifierCount} modifier(s)`);
      } else {
        console.log(`Modified ${updatedModifierCount} modifier(s) (same count)`);
      }
      
      // Log specific changes
      const originalModifierIds = new Set(originalItem.modifiers?.map(m => m.modifier_id) || []);
      const updatedModifierIds = new Set(updatedItem.modifiers?.map(m => m.modifier_id) || []);
      
      const addedModifiers = updatedItem.modifiers?.filter(m => !originalModifierIds.has(m.modifier_id)) || [];
      const removedModifiers = originalItem.modifiers?.filter(m => !updatedModifierIds.has(m.modifier_id)) || [];
      
      if (addedModifiers.length > 0) {
        console.log('Added modifiers:', addedModifiers.map(m => m.modifier_name));
      }
      if (removedModifiers.length > 0) {
        console.log('Removed modifiers:', removedModifiers.map(m => m.modifier_name));
      }
      console.log('=== End Modifier Update ===');
    }
    setEditingItem(null);
    setEditingIndex(-1);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingIndex(-1);
  };

  const handleDeleteEdit = () => {
    if (editingIndex >= 0) {
      const newCart = cart.filter((_, index) => index !== editingIndex);
      setCart(newCart);
    }
    setEditingItem(null);
    setEditingIndex(-1);
  };

  // Save Order Handler
  const handleSave = async () => {
    if (!tableId || cart.length === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Debug: Log cart state before saving
      console.log('=== SAVING ORDER ===');
      console.log('Cart state before saving:', cart);
      cart.forEach((item, index) => {
        console.log(`Item ${index}: ${item.title} - Price: ${item.price} (type: ${typeof item.price}) - Modifiers:`, item.modifiers || []);
      });
      console.log('=== END CART STATE ===');

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
      
      // Insert order items and collect their IDs for modifiers
      const orderItems = cart.map((item) => {
        const priceValue = Number(item.price) || 0;
        console.log(`Item: ${item.title}, Original price: ${item.price} (${typeof item.price}), Converted price: ${priceValue} (${typeof priceValue})`);
        return {
          order_id: orderId,
          item_id: item.item_id,
          quantity: item.count,
          price_each: priceValue, // Store as decimal (float)
          note: item.note || null,
        };
      });
      
      console.log('Order items to insert:', orderItems);
      console.log('Price types in orderItems:', orderItems.map(item => ({ title: item.item_id, price: item.price_each, type: typeof item.price_each })));
      
      const { data: insertedItems, error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems)
        .select("order_item_id, item_id");
        
      if (itemsError)
        throw new Error(`Failed to save order items: ${itemsError.message}`);

      // Save modifiers for each order item
      if (insertedItems) {
        for (let i = 0; i < insertedItems.length; i++) {
          const insertedItem = insertedItems[i];
          const cartItem = cart[i]; // Use index instead of finding by item_id
          
          if (cartItem?.modifiers && cartItem.modifiers.length > 0) {
            console.log(`Saving ${cartItem.modifiers.length} modifiers for item: ${cartItem.title}`);
            
            const orderItemModifiers = cartItem.modifiers.map(modifier => ({
              order_item_id: insertedItem.order_item_id,
              modifier_id: modifier.modifier_id,
              quantity: modifier.quantity || 1
            }));
            
            console.log('Modifiers to save:', orderItemModifiers);
            
            const { error: modifiersError } = await supabase
              .from("order_item_modifiers")
              .insert(orderItemModifiers);
              
            if (modifiersError) {
              console.error("Error saving modifiers:", modifiersError);
              console.error("Failed modifiers data:", orderItemModifiers);
            } else {
              console.log(`Successfully saved ${orderItemModifiers.length} modifiers for item: ${cartItem.title}`);
            }
          } else {
            console.log(`No modifiers to save for item: ${cartItem?.title || 'unknown'}`);
          }
        }
      } else {
        console.log('No inserted items found, cannot save modifiers');
      }

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
    navigate("/restaurant/tables");
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
      navigate("/restaurant/tables");
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
          onEdit={handleEditItem}
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
          editingItem={editingItem}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDeleteEdit={handleDeleteEdit}
        />
      </div>
    </div>
  );
}

export default Orders;
