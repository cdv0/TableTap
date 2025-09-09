import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clearCart, loadCart, saveCart, type CartLine } from "../utils/cart";
import { getTableIdByNumber, createCustomerOrder } from "../utils/ordersApi";

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

  const backToMenu = () => navigate(`/order/${tableId}`);

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
      navigate(`/order/${tableId}/orders`);

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
      className="mx-auto bg-white"
      style={{ maxWidth: 480, minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <button
          className="btn btn-link text-decoration-none"
          onClick={backToMenu}
        >
          ‹ Back
        </button>
        <h5 className="m-0">Order Summary</h5>
        <div style={{ width: 56 }} />
      </div>

      <div className="p-3 vstack gap-2">
        {items.length === 0 && (
          <div className="text-center text-muted small py-4">
            Cart is empty
          </div>
        )}

        {items.map((l, i) => (
          <div key={l.id} className="border rounded p-2">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="small text-muted">#{i + 1}</div>
                <div className="fw-semibold">{l.title}</div>
              </div>
              <div className="fw-semibold">
                ${(l.unitPrice * l.qty).toFixed(2)}
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => dec(l.id)}
                >
                  -
                </button>
                <button className="btn btn-light" disabled>
                  {l.qty}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => inc(l.id)}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeLine(l.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <>
            <div className="mt-3 p-3 border rounded small">
              <div className="d-flex justify-content-between">
                <span>SUBTOTAL:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>TAX (8.75%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-semibold">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {err && (
              <div className="text-danger small mt-2">Error: {err}</div>
            )}

            <button
              className="btn btn-danger w-100 mt-3"
              disabled={loading}
              onClick={checkout}
            >
              {loading ? "Placing..." : "Place order"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
