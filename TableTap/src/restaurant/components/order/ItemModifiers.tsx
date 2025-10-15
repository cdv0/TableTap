import { useState } from "react";
import type { CartItem, CartItemModifier, ModifierGroup, Modifier } from "../../../shared/types/OrderTypes";

interface ItemModifiersProps {
  item: CartItem;
  menuItemModifiers?: {
    modifierGroups: ModifierGroup[];
    modifiers: Modifier[];
  };
  onSave: (updatedItem: CartItem) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function ItemModifiers({ 
  item, 
  menuItemModifiers, 
  onSave, 
  onCancel, 
  onDelete 
}: ItemModifiersProps) {
  const [quantity, setQuantity] = useState(item.count);
  const [selectedModifiers, setSelectedModifiers] = useState<CartItemModifier[]>(
    item.modifiers || []
  );
  const [notes, setNotes] = useState(item.note || "");

  // Group modifiers by modifier group
  const modifiersByGroup = menuItemModifiers?.modifierGroups.map(group => {
    const groupModifiers = menuItemModifiers.modifiers.filter(
      mod => mod.modifier_group_id === group.modifier_group_id
    );
    return {
      group,
      modifiers: groupModifiers
    };
  }) || [];

  const handleModifierSelection = (group: ModifierGroup, modifier: Modifier, isSelected: boolean) => {
    console.log(`Modifier selection: ${modifier.name} (${group.name}) - Selected: ${isSelected}`);
    console.log('Current selectedModifiers before change:', selectedModifiers);
    
    setSelectedModifiers(prev => {
      const existing = prev.find(
        m => m.modifier_group_id === group.modifier_group_id && m.modifier_id === modifier.modifier_id
      );

      if (isSelected && !existing) {
        console.log(`Adding modifier: ${modifier.name} (${group.name})`);
        const newState = [...prev, {
          modifier_group_id: group.modifier_group_id,
          modifier_group_name: group.name,
          modifier_id: modifier.modifier_id,
          modifier_name: modifier.name,
          quantity: 1
        }];
        console.log('New selectedModifiers state:', newState);
        return newState;
      } else if (!isSelected && existing) {
        console.log(`Removing modifier: ${modifier.name} (${group.name})`);
        const newState = prev.filter(
          m => !(m.modifier_group_id === group.modifier_group_id && m.modifier_id === modifier.modifier_id)
        );
        console.log('New selectedModifiers state:', newState);
        return newState;
      }
      return prev;
    });
  };

  const updateModifierQuantity = (modifierId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    const modifier = selectedModifiers.find(m => m.modifier_id === modifierId);
    const oldQuantity = modifier?.quantity || 0;
    
    if (newQuantity !== oldQuantity) {
      console.log(`Quantity change for ${modifier?.modifier_name}: ${oldQuantity} → ${newQuantity}`);
    }
    
    setSelectedModifiers(prev => 
      prev.map(mod => 
        mod.modifier_id === modifierId 
          ? { ...mod, quantity: newQuantity }
          : mod
      )
    );
  };

  const isModifierSelected = (group: ModifierGroup, modifier: Modifier) => {
    return selectedModifiers.some(
      m => m.modifier_group_id === group.modifier_group_id && m.modifier_id === modifier.modifier_id
    );
  };

  const getModifierQuantity = (modifierId: string) => {
    const modifier = selectedModifiers.find(m => m.modifier_id === modifierId);
    return modifier?.quantity || 0;
  };

  const handleSave = () => {
    const updatedItem: CartItem = {
      ...item,
      count: quantity,
      modifiers: selectedModifiers,
      note: notes
    };
    
    console.log(`=== ItemModifiers Save for: ${item.title} ===`);
    console.log('Original item modifiers:', item.modifiers || []);
    console.log('Selected modifiers to save:', selectedModifiers);
    console.log('Notes:', notes);
    console.log('Updated item:', updatedItem);
    console.log('=== End ItemModifiers Save ===');
    
    onSave(updatedItem);
  };

  return (
    <div className="item-modifiers-panel">
      <div className="item-modifiers-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={onDelete}
              aria-label="Delete item"
            >
              🗑️
            </button>
            <span className="fw-bold">{quantity}. {item.title}</span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="px-2">{quantity}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="item-modifiers-content">
        {modifiersByGroup.length === 0 ? (
          <p className="text-muted">No customization options available for this item.</p>
        ) : (
          modifiersByGroup.map(({ group, modifiers }) => (
            <div key={group.modifier_group_id} className="modifier-group mb-4">
              <h6 className="fw-bold mb-2">{group.name}</h6>
              <div className="d-flex flex-wrap gap-2">
                {modifiers.map(modifier => {
                  const isSelected = isModifierSelected(group, modifier);
                  const quantity = getModifierQuantity(modifier.modifier_id);
                  
                  return (
                    <div key={modifier.modifier_id} className="modifier-option">
                      {group.name.toLowerCase().includes('topping') || group.name.toLowerCase().includes('addon') ? (
                        // For toppings/addons with quantity controls
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateModifierQuantity(modifier.modifier_id, quantity - 1)}
                            disabled={quantity <= 0}
                          >
                            -
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => handleModifierSelection(group, modifier, !isSelected)}
                          >
                            {modifier.name}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateModifierQuantity(modifier.modifier_id, quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        // For single-selection options (broth, size, noodles, etc.)
                        <button
                          type="button"
                          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleModifierSelection(group, modifier, !isSelected)}
                        >
                          {modifier.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes Section */}
      <div className="notes-section mt-4">
        <h6 className="fw-bold mb-2">Additional Notes</h6>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Enter any special instructions or notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="item-modifiers-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ItemModifiers;
