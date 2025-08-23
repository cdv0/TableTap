import { IoTrashOutline } from "react-icons/io5";
import type { CartItem } from "../../../../types/OrderTypes";
import { updateCartCount, removeFromCart } from "../../../../utils/cartUtils";
import type { Dispatch, SetStateAction } from "react";

interface CartPanelProps {
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  tableNumber: number | null;
  saveError: string | null;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
  onClose: () => void;
}

function CartPanel({
  cart,
  setCart,
  tableNumber,
  saveError,
  saving,
  onSave,
  onBack,
  onClose,
}: CartPanelProps) {
  return (
    <div className="cart-panel">
      <div className="cart-panel-content">
        <h1>Table {tableNumber ?? "Loading..."}</h1>
        <hr />
        {saveError && (
          <p className="text-danger mb-3" role="alert">
            Error: {saveError}
          </p>
        )}
        <div className="list-group">
          {cart.length === 0 ? (
            <p className="text-muted">No items in order</p>
          ) : (
            cart.map((ci, index) => (
              <div
                key={`${ci.title}-${index}`} // Unique key with index
                className="list-group-item d-flex justify-content-between align-items-center cart-item"
              >
                <div className="d-flex justify-content-between align-items-center w-100 mt-1 mb-1">
                  <div className="d-flex gap-3">
                    <small className="text-secondary">{ci.count}</small>
                    <span style={{ fontWeight: 600 }}>
                      {ci.title}
                      {ci.note && (
                        <small className="text-muted"> - {ci.note}</small>
                      )}
                    </span>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateCartCount(cart, setCart, index, -1)}
                      aria-label={`Decrease ${ci.title}`}
                    >
                      -
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => updateCartCount(cart, setCart, index, +1)}
                      aria-label={`Increase ${ci.title}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => removeFromCart(cart, setCart, index)}
                      aria-label={`Remove ${ci.title}`}
                    >
                      <IoTrashOutline
                        style={{ fontSize: "1rem", color: "#ad2929" }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="cart-panel-footer">
        <div className="d-flex flex-row justify-content-center align-items-center gap-3">
          <button
            type="button"
            className="btn cart-buttons"
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none"
            }}
            onClick={onSave}
            disabled={cart.length === 0 || saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn cart-buttons"
            onClick={onBack}
            disabled={saving}
          >
            Back
          </button>
          <button
            type="button"
            className="btn cart-buttons"
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none"
            }}
            onClick={onClose}
            disabled={saving}
          >
            Closed
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPanel;
