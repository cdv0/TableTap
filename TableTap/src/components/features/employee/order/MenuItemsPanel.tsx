import CategoryNavButton from "./CategoryNavButton";
import type { MenuItem } from "../../../../types/OrderTypes";
interface MenuItemsPanelProps {
  items: MenuItem[];
  itemsLoading: boolean;
  itemsError: string | null;
  search: string;
  setSearch: (search: string) => void;
  selectedCategory: string;
  addItemToCart: (item: MenuItem) => void;
}

function MenuItemsPanel({
  items,
  itemsLoading,
  itemsError,
  search,
  setSearch,
  selectedCategory,
  addItemToCart,
}: MenuItemsPanelProps) {
  const searchItems = items
    .filter(
      (it) => selectedCategory === "All" || it.category === selectedCategory
    )
    .filter((it) => it.title.toLowerCase().includes(search.toLowerCase()));

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
