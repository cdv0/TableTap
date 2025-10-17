import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clearCart, loadCart, saveCart, type CartLine } from "../../shared/utils/cart";
import { getTableIdByNumber, createCustomerOrder } from "../../shared/utils/ordersApi";

export default function CartPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<CartLine[]>(() => loadCart(tableId));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    saveCart(tableId, items);
  }, [items, tableId]);

  const subtotal = useMemo(
    () => items.reduce((s, l) => s + l.unitPrice * l.qty, 0),
    [items]
  );
  const taxRate = 0.0875;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const inc = (id: string) =>
    setItems((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
    );

  const dec = (id: string) =>
    setItems((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    );

  const removeLine = (id: string) =>
    setItems((prev) => prev.filter((l) => l.id !== id));

  const backToMenu = () => navigate(`/customer/order/${tableId}`);

  const checkout = async () => {
    try {
      if (!tableId || items.length === 0) return;
      setLoading(true);
      setErr(null);

      //map table number -> table_id (uuid)
      const tableUuid = await getTableIdByNumber(Number(tableId));

      // insert order + items
      const order_id = await createCustomerOrder({
        table_id: tableUuid,
        status: "pending",
        items,
      });

      //clear cart and go to orders page
      clearCart(tableId);
      setItems([]);
      navigate(`/customer/order/${tableId}/orders`);

      console.log("Order placed:", order_id);
    } catch (e: any) {
      console.error("Checkout failed:", e.message);
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={backToMenu}
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
          Order Summary
        </h5>
        <div style={{ width: 56 }} />
      </div>

      {/* White cart component */}
      <div 
        className="mx-3 mt-3"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}
      >
        {items.length === 0 && (
          <div 
            className="text-center py-4"
            style={{ 
              color: "#666",
              fontSize: "16px",
              padding: "40px 20px"
            }}
          >
            Cart is empty
          </div>
        )}

        {items.map((l, i) => (
          <div 
            key={l.id} 
            style={{
              padding: "16px",
              borderBottom: i < items.length - 1 ? "1px solid #E0E0E0" : "none"
            }}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div style={{ flex: 1 }}>
                <div 
                  style={{ 
                    fontSize: "14px", 
                    color: "#666", 
                    marginBottom: "4px" 
                  }}
                >
                  {l.qty}
                </div>
                <div 
                  style={{ 
                    fontSize: "16px", 
                    fontWeight: "600", 
                    color: "#333",
                    marginBottom: "4px"
                  }}
                >
                  {l.title}
                </div>
                {l.meta && (
                  <div style={{ fontSize: "14px", color: "#666", marginLeft: "8px" }}>
                    {Object.entries(l.meta).map(([key, value]) => (
                      <div key={key} style={{ fontSize: "12px", color: "#999" }}>
                        {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div 
                style={{ 
                  fontSize: "16px", 
                  fontWeight: "500", 
                  color: "#333",
                  textAlign: "right"
                }}
              >
                ${(l.unitPrice * l.qty).toFixed(2)}
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => dec(l.id)}
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                >
                  -
                </button>
                <button 
                  className="btn btn-light" 
                  disabled
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                >
                  {l.qty}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => inc(l.id)}
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeLine(l.id)}
                style={{ fontSize: "12px", padding: "4px 8px" }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <>
            {/* Order Summary Section */}
            <div 
              style={{
                padding: "16px",
                borderTop: "1px solid #E0E0E0",
                backgroundColor: "white"
              }}
            >
              <div 
                className="d-flex justify-content-between mb-2"
                style={{ fontSize: "14px", color: "#333" }}
              >
                <span>SUBTOTAL:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div 
                className="d-flex justify-content-between mb-2"
                style={{ fontSize: "14px", color: "#333" }}
              >
                <span>TAX (8.75%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div 
                className="d-flex justify-content-between"
                style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  color: "#333",
                  paddingTop: "8px",
                  borderTop: "1px solid #E0E0E0"
                }}
              >
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Place Order Button */}
      {items.length > 0 && (
        <div className="px-3 pb-3 mt-3">
          {err && (
            <div 
              className="text-danger small mb-2" 
              style={{ color: "#E74C3C", fontSize: "14px" }}
            >
              Error: {err}
            </div>
          )}

          <button
            className="btn"
            disabled={loading}
            onClick={checkout}
            style={{
              backgroundColor: "#E74C3C",
              color: "white",
              border: "none",
              borderRadius: "25px",
              padding: "12px 32px",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(231, 76, 60, 0.3)",
              width: "70%",
              margin: "0 auto",
              display: "block"
            }}
          >
            {loading ? "Placing..." : "Place order"}
          </button>
        </div>
      )}
    </div>
  );
}
