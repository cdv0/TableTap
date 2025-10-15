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

type MenuRow = { item_id: string; title: string };

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
            .select("item_id, title")
            .in("item_id", itemIds);
          if (mErr) throw mErr;
          const idx: Record<string, string> = {};
          (menuRows as MenuRow[]).forEach(r => (idx[r.item_id] = r.title));
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
    <div className="mx-auto bg-white" style={{ maxWidth: 480, minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <button className="btn btn-link text-decoration-none" onClick={() => navigate(`/customer/order/${tableId}`)}>‹ Back</button>
        <h5 className="m-0">Your Orders</h5>
        <span style={{ width: 40 }} />
      </div>

      {loading && <div className="p-3 text-muted">Loading…</div>}
      {err && <div className="p-3 text-danger small">{err}</div>}

      {!loading && !err && (
        <div className="p-3 vstack gap-3">
          <div className="fw-semibold mb-2">Open orders ({orders.length})</div>

          {orders.length === 0 && (
            <div className="text-muted small">No open orders for this table.</div>
          )}

          {orders.map((o) => {
            const bucket = itemsByOrder.get(o.order_id);
            const lines = bucket?.lines ?? [];
            const orderTotal = bucket?.total ?? 0;

            return (
              <div key={o.order_id} className="border rounded">
                <div className="d-flex justify-content-between align-items-start p-2 border-bottom">
                  <div>
                    <div className="small text-muted">Order #{o.order_id.slice(0, 6)}</div>
                    <div className="small">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-end">
                    <div className="badge text-bg-secondary">{o.status}</div>
                    <div className="small text-muted">{o.item_count} items</div>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="p-2">
                  {lines.length === 0 && (
                    <div className="text-muted small">No items yet.</div>
                  )}
                  {lines.map((it) => {
                    const title = it.item_id ? (menuIndex[it.item_id] ?? "Item") : "Item";
                    const lineTotal = it.quantity * it.price_each;
                    return (
                      <div key={it.order_item_id} className="d-flex justify-content-between border-bottom py-2">
                        <div>
                          <div className="fw-semibold">{title}</div>
                          <div className="small text-muted">
                            Qty {it.quantity} × ${it.price_each.toFixed(2)}
                            {it.note ? ` · ${it.note}` : ""}
                          </div>
                        </div>
                        <div className="fw-semibold">${lineTotal.toFixed(2)}</div>
                      </div>
                    );
                  })}

                  {lines.length > 0 && (
                    <div className="d-flex justify-content-between pt-2 fw-semibold">
                      <span>Order total</span>
                      <span>${orderTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
