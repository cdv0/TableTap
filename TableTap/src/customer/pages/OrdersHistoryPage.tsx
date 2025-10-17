import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../shared/supabaseClient";

type OpenOrder = {
  order_id: string;
  table_id: string;
  status: "pending" | "preparing" | "closed";
  created_at: string;
  item_count: number;
  table_number: number | null;
};

type OrderItem = {
  order_item_id: string;
  order_id: string;
  item_id: string | null;
  quantity: number;
  price_each: number;
  note: string | null;
};

type MenuRow = { item_id: string; name: string };

export default function OrdersHistoryPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OpenOrder[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menuIndex, setMenuIndex] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        //Open orders for this table 
        const { data: openOrders, error: oErr } = await supabase
          .from("open_orders_with_items")
          .select("order_id, table_id, status, created_at, item_count, table_number")
          .eq("table_number", Number(tableId));
        if (oErr) throw oErr;
        setOrders((openOrders ?? []) as OpenOrder[]);

        const orderIds = (openOrders ?? []).map(o => o.order_id);
        if (orderIds.length === 0) {
          setItems([]);
          setMenuIndex({});
          return;
        }

        //Items for orders
        const { data: orderItems, error: iErr } = await supabase
          .from("order_items")
          .select("order_item_id, order_id, item_id, quantity, price_each, note")
          .in("order_id", orderIds);
        if (iErr) throw iErr;
        setItems((orderItems ?? []) as OrderItem[]);

        // C) Menu titles (optional, for nicer display)
        const itemIds = Array.from(
          new Set((orderItems ?? []).map(i => i.item_id).filter(Boolean) as string[])
        );
        if (itemIds.length) {
          const { data: menuRows, error: mErr } = await supabase
            .from("menu_items")
            .select("item_id, name")
            .in("item_id", itemIds);
          if (mErr) throw mErr;
          const idx: Record<string, string> = {};
          (menuRows as MenuRow[]).forEach(r => (idx[r.item_id] = r.name));
          setMenuIndex(idx);
        } else {
          setMenuIndex({});
        }
      } catch (e: any) {
        setErr(e.message ?? "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [tableId]);

  // Group items by order_id and compute per-order totals
  const itemsByOrder = useMemo(() => {
    const map = new Map<string, { lines: OrderItem[]; total: number }>();
    for (const it of items) {
      const bucket = map.get(it.order_id) ?? { lines: [], total: 0 };
      bucket.lines.push(it);
      bucket.total += it.quantity * it.price_each;
      map.set(it.order_id, bucket);
    }
    return map;
  }, [items]);

  return (
    <div 
      className="mx-auto" 
      style={{ 
        maxWidth: 480, 
        minHeight: "100vh", 
        backgroundColor: "#F5F5F5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Header with white background */}
      <div 
        className="d-flex justify-content-between align-items-center p-3"
        style={{ 
          backgroundColor: "white",
          borderBottom: "1px solid #E0E0E0"
        }}
      >
        <button 
          className="btn btn-link text-decoration-none" 
          onClick={() => navigate(`/customer/order/${tableId}`)}
          style={{ color: "#333", fontSize: "18px" }}
        >
          ‹ Back
        </button>
        <h5 
          className="m-0" 
          style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#333" 
          }}
        >
          Your Orders
        </h5>
        <div style={{ width: 56 }} />
      </div>

      {loading && <div className="p-3 text-muted">Loading…</div>}
      {err && <div className="p-3 text-danger small">{err}</div>}

      {!loading && !err && (
        <div className="px-3 pb-4">
          {orders.length === 0 && (
            <div 
              className="mx-3 mt-4"
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden"
              }}
            >
              <div 
                className="text-center py-4"
                style={{ 
                  color: "#666",
                  fontSize: "16px",
                  padding: "40px 20px"
                }}
              >
                No open orders for this table.
              </div>
            </div>
          )}

          {orders.map((o, index) => {
            const bucket = itemsByOrder.get(o.order_id);
            const lines = bucket?.lines ?? [];
            const orderTotal = bucket?.total ?? 0;
            const taxRate = 0.0875;
            const tax = orderTotal * taxRate;
            const total = orderTotal + tax;

            return (
              <div 
                key={o.order_id} 
                className="mx-3"
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  marginTop: index === 0 ? "16px" : "16px",
                  marginBottom: index < orders.length - 1 ? "16px" : "0",
                  overflow: "hidden"
                }}
              >
                {/* Order header */}
                <div 
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid #E0E0E0"
                  }}
                >
                  <div 
                    style={{ 
                      fontSize: "18px", 
                      fontWeight: "600", 
                      color: "#000",
                      marginBottom: "8px"
                    }}
                  >
                    Order #{o.order_id.slice(0, 10)}
                  </div>
                  <div 
                    style={{ 
                      fontSize: "14px", 
                      color: "#666" 
                    }}
                  >
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Order items */}
                <div style={{ padding: "16px" }}>
                  {lines.length === 0 && (
                    <div 
                      style={{ 
                        color: "#666", 
                        fontSize: "14px",
                        textAlign: "center",
                        padding: "20px 0"
                      }}
                    >
                      No items yet.
                    </div>
                  )}
                  
                  {lines.map((it, index) => {
                    const title = it.item_id ? (menuIndex[it.item_id] ?? "Item") : "Item";
                    const status = o.status === "pending" ? "Pending" : 
                                  o.status === "preparing" ? "Preparing" : 
                                  o.status === "closed" ? "Served" : "Pending";
                    
                    return (
                      <div key={it.order_item_id}>
                        <div 
                          className="d-flex justify-content-between align-items-start"
                          style={{ padding: "12px 0" }}
                        >
                          <div style={{ flex: 1 }}>
                            <div 
                              style={{ 
                                fontSize: "16px", 
                                fontWeight: "600", 
                                color: "#000",
                                marginBottom: "4px"
                              }}
                            >
                              {it.quantity} {title}
                            </div>
                            {it.note && (
                              <div 
                                style={{ 
                                  fontSize: "12px", 
                                  color: "#666",
                                  marginLeft: "8px",
                                  marginTop: "2px"
                                }}
                              >
                                {it.note}
                              </div>
                            )}
                          </div>
                          <div 
                            style={{ 
                              fontSize: "14px", 
                              color: "#666",
                              fontWeight: "500"
                            }}
                          >
                            {status}
                          </div>
                        </div>
                        {index < lines.length - 1 && (
                          <div 
                            style={{ 
                              borderBottom: "1px solid #E0E0E0",
                              margin: "0 -16px"
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Order summary */}
                  {lines.length > 0 && (
                    <div 
                      style={{
                        borderTop: "1px solid #E0E0E0",
                        paddingTop: "16px",
                        marginTop: "16px"
                      }}
                    >
                      <div 
                        className="d-flex justify-content-between mb-2"
                        style={{ fontSize: "16px", color: "#000" }}
                      >
                        <span>SUBTOTAL:</span>
                        <span>${orderTotal.toFixed(2)}</span>
                      </div>
                      <div 
                        className="d-flex justify-content-between mb-2"
                        style={{ fontSize: "16px", color: "#000" }}
                      >
                        <span>TAX (8.75%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div 
                        className="d-flex justify-content-between"
                        style={{ 
                          fontSize: "16px", 
                          fontWeight: "600", 
                          color: "#000",
                          paddingTop: "8px",
                          borderTop: "1px solid #E0E0E0"
                        }}
                      >
                        <span>TOTAL:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Order more button */}
          {orders.length > 0 && (
            <div className="text-center mt-4">
              <button
                className="btn"
                onClick={() => navigate(`/customer/order/${tableId}`)}
                style={{
                  backgroundColor: "#E74C3C",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  padding: "12px 32px",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 2px 8px rgba(231, 76, 60, 0.3)",
                  width: "auto",
                  margin: "0 auto",
                  display: "block"
                }}
              >
                Order more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
