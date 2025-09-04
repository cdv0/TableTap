import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import "./Catalog.css";

interface OrderItem {
  order_item_id: string;
  item_id: string;
  quantity: number;
  price_each: number;
  note?: string;
  menu_items: {
    name: string;
  } | null;
  order_item_modifiers?: {
    modifier_id: string;
    quantity: number;
    modifier: {
      name: string;
      modifier_group: {
        name: string;
      };
    };
  }[];
}

interface ClosedOrder {
  order_id: string;
  table_id: string;
  table_number: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

function Catalog() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<ClosedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ClosedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Fetch closed orders from Supabase
  useEffect(() => {
    const fetchClosedOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("customer_orders")
          .select(`
            order_id,
            table_id,
            status,
            created_at,
            tables(table_number),
            order_items(
              order_item_id,
              item_id,
              quantity,
              price_each,
              note,
              menu_items(name),
              order_item_modifiers(
                modifier_id,
                quantity,
                modifier:modifier_id(
                  name,
                  modifier_group:modifier_group_id(
                    name
                  )
                )
              )
            )
          `)
          .eq("status", "closed")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch closed orders: ${error.message}`);
        }

        // Transform the data to match our interface
        const transformedData = (data || []).map((order: any) => ({
          order_id: order.order_id,
          table_id: order.table_id,
          table_number: order.tables?.table_number || 0,
          status: order.status,
          created_at: order.created_at,
          order_items: (order.order_items || []).map((item: any) => ({
            order_item_id: item.order_item_id,
            item_id: item.item_id,
            quantity: item.quantity,
            price_each: item.price_each,
            note: item.note,
            menu_items: item.menu_items,
            order_item_modifiers: item.order_item_modifiers || []
          }))
        }));
        
        setOrders(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching closed orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.table_number.toString().includes(searchTerm) ||
    order.order_items.some(item => 
      item.menu_items?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Handle undo action (reopen order)
  const handleUndo = async (orderId: string, tableId: string) => {
    try {
      // First, check if there's already an active order at this table
      const { data: existingOrder, error: checkError } = await supabase
        .from("customer_orders")
        .select("order_id, status")
        .eq("table_id", tableId)
        .in("status", ["preparing", "ready", "pending"])
        .single();

      if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows"
        throw new Error(`Failed to check existing orders: ${checkError.message}`);
      }

      // If there's already an active order, show popup
      if (existingOrder) {
        setPopupMessage(`There is already an active order at this table (Status: ${existingOrder.status}). Cannot undo this closed order.`);
        setShowPopup(true);
        return;
      }

      // Update order status to "preparing"
      const { error: updateOrderError } = await supabase
        .from("customer_orders")
        .update({ status: "preparing" })
        .eq("order_id", orderId);

      if (updateOrderError) {
        throw new Error(`Failed to undo order: ${updateOrderError.message}`);
      }

      // Update table status to "occupied"
      const { error: updateTableError } = await supabase
        .from("tables")
        .update({ status: "occupied" })
        .eq("table_id", tableId);

      if (updateTableError) {
        throw new Error(`Failed to update table status: ${updateTableError.message}`);
      }

      // Remove the order from the list
      setOrders(prev => prev.filter(order => order.order_id !== orderId));
      setSelectedOrder(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error undoing order:", err);
    }
  };

  if (loading) {
    return (
      <div className="catalog-container">
        <div className="loading">Loading closed orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <Navbar
        heading="Catalog"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="catalog-content">
        {/* Left Panel - Order List */}
        <div className="catalog-left-panel">
          <div className="search-filter-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>
            <button className="filter-button">Filter</button>
          </div>

          <div className="orders-list">
            {filteredOrders.length === 0 ? (
              <div className="no-orders">No closed orders found</div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.order_id}
                  className={`order-item ${selectedOrder?.order_id === order.order_id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-table">Table {order.table_number}</div>
                  <div className="order-status">
                    Closed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Order Details */}
        <div className="catalog-right-panel">
          {selectedOrder ? (
            <div className="order-details">
              <div className="order-header">
                <h2>Table {selectedOrder.table_number}</h2>
                <div className="order-status-info">
                  Closed on {formatDate(selectedOrder.created_at)} at {formatTime(selectedOrder.created_at)}
                </div>
              </div>

              <div className="order-items">
                {selectedOrder.order_items.map((item) => (
                  <div key={item.order_item_id} className="order-item-detail">
                    <div className="item-quantity-name">
                      {item.quantity} {item.menu_items?.name || 'Unknown Item'}
                    </div>
                    {item.order_item_modifiers && item.order_item_modifiers.length > 0 && (
                      <div className="item-modifiers">
                        {item.order_item_modifiers.map((modifier, index) => (
                          <div key={index} className="modifier">
                            {modifier.modifier.modifier_group.name}: {modifier.modifier.name}
                            {modifier.quantity > 1 && ` (${modifier.quantity})`}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <div className="item-note">Note: {item.note}</div>
                    )}
                  </div>
                ))}
              </div>

              <button 
                className="undo-button"
                onClick={() => handleUndo(selectedOrder.order_id, selectedOrder.table_id)}
              >
                Undo
              </button>
            </div>
          ) : (
            <div className="no-selection">
              Select an order to view details
            </div>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Warning</h3>
            </div>
            <div className="popup-body">
              <p>{popupMessage}</p>
            </div>
            <div className="popup-footer">
              <button 
                className="popup-button"
                onClick={() => setShowPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalog;
