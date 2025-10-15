import CategoryNavButton from "./CategoryNavButton";
import ItemModifiers from "./ItemModifiers";
import type { MenuItem, CartItem } from "../../../shared/types/OrderTypes";
import type { MenuItemWithModifiers } from "../../../shared/hooks/useMenuItems";

interface MenuItemsPanelProps {
  items: MenuItemWithModifiers[];
  itemsLoading: boolean;
  itemsError: string | null;
  search: string;
  setSearch: (search: string) => void;
  selectedCategory: string;
  addItemToCart: (item: MenuItem) => void;
  editingItem?: CartItem | null;
  onSaveEdit?: (updatedItem: CartItem) => void;
  onCancelEdit?: () => void;
  onDeleteEdit?: () => void;
}

function MenuItemsPanel({
  items,
  itemsLoading,
  itemsError,
  search,
  setSearch,
  selectedCategory,
  addItemToCart,
  editingItem,
  onSaveEdit,
  onCancelEdit,
  onDeleteEdit,
}: MenuItemsPanelProps) {
  const searchItems = items
    .filter(
      (it) => selectedCategory === "All" || it.category === selectedCategory
    )
    .filter((it) => it.title.toLowerCase().includes(search.toLowerCase()));

  // If we're editing an item, show the modifiers panel
  if (editingItem) {
    const menuItem = items.find(item => item.item_id === editingItem.item_id);
    const menuItemModifiers = menuItem ? {
      modifierGroups: menuItem.modifierGroups || [],
      modifiers: menuItem.modifiers || []
    } : undefined;

    return (
      <div className="menu-items-panel">
        <ItemModifiers
          item={editingItem}
          menuItemModifiers={menuItemModifiers}
          onSave={onSaveEdit || (() => {})}
          onCancel={onCancelEdit || (() => {})}
          onDelete={onDeleteEdit || (() => {})}
        />
      </div>
    );
  }

  // Otherwise show the regular menu items
  return (
    <div className="menu-items-panel">
      <input
        type="text"
        placeholder="Search…"
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {itemsLoading ? (
        <p>Loading items...</p>
      ) : itemsError ? (
        <p className="text-danger">Error: {itemsError}</p>
      ) : searchItems.length === 0 ? (
        <p className="text-muted">No items match filter</p>
      ) : (
        <div className="d-flex flex-wrap gap-2">
          {searchItems.map((item) => (
            <CategoryNavButton
              key={item.title}
              text={item.title}
              color={item.color}
              onClick={() => addItemToCart(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuItemsPanel;
