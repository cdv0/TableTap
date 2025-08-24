import type { CartItem } from "../../../../types/OrderTypes";
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
  onEdit?: (item: CartItem, index: number) => void;
}

function CartPanel({
  cart,
  tableNumber,
  saveError,
  saving,
  onSave,
  onBack,
  onClose,
  onEdit,
}: CartPanelProps) {
  // Helper function to group modifiers by modifier group
  const groupModifiersByGroup = (modifiers: CartItem['modifiers'] = []) => {
    const grouped: { [key: string]: { groupName: string; modifiers: CartItem['modifiers'] } } = {};
    
    // Handle null/undefined modifiers
    if (!modifiers || modifiers.length === 0) {
      return [];
    }
    
    modifiers.forEach(modifier => {
      if (!grouped[modifier.modifier_group_id]) {
        grouped[modifier.modifier_group_id] = {
          groupName: modifier.modifier_group_name,
          modifiers: []
        };
      }
      grouped[modifier.modifier_group_id].modifiers?.push(modifier);
    });
    
    return Object.values(grouped);
  };

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
            cart.map((ci, index) => {
              const groupedModifiers = groupModifiersByGroup(ci.modifiers);
              
              return (
                <div
                  key={`${ci.title}-${index}`}
                  className="list-group-item cart-item"
                >
                  {/* Main item row */}
                  <div className="d-flex justify-content-between align-items-center w-100 mt-1 mb-1">
                    <div className="d-flex gap-3">
                      <small className="text-secondary">{ci.count}</small>
                      <span style={{ fontWeight: 600 }}>
                        {ci.title}
                      </span>
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit?.(ci, index)}
                        aria-label={`Edit ${ci.title}`}
                      >
                        edit
                      </button>
                    </div>
                  </div>
                  
                  {/* Modifiers section - show if there are modifiers or notes */}
                  {(groupedModifiers.length > 0 || ci.note) && (
                    <div className="modifiers-section mt-2">
                      {/* Show modifier groups */}
                      {groupedModifiers.map((group, groupIndex) => (
                        <div key={groupIndex} className="modifier-group-display">
                          <small className="text-muted fw-semibold">
                            {group.groupName}:
                          </small>
                          <div className="modifier-items">
                            {group.modifiers?.map((modifier, modIndex) => (
                              <span key={modIndex} className="modifier-item">
                                {modifier.modifier_name}
                                {modifier.quantity && modifier.quantity > 1 && (
                                  <span className="modifier-quantity"> (x{modifier.quantity})</span>
                                )}
                                {modIndex < (group.modifiers?.length || 0) - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Show notes */}
                      {ci.note && (
                        <div className="modifier-group-display">
                          <small className="text-muted fw-semibold">
                            Notes:
                          </small>
                          <div className="modifier-items">
                            <span className="modifier-item">{ci.note}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPanel;
