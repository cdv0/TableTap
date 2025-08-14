import CategoryNavButton from "./CategoryNavButton";
import type { Category } from "../../../../types/OrderTypes";

interface CategoriesPanelProps {
  categories: Category[];
  catsLoading: boolean;
  catsError: string | null;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  setSearch: (search: string) => void;
}

function CategoriesPanel({
  categories,
  catsLoading,
  catsError,
  selectedCategory,
  setSelectedCategory,
  setSearch,
}: CategoriesPanelProps) {
  return (
    <div className="categories-panel">
      <div className="d-flex flex-column justify-content-between align-items-center mb-3 gap-2">
        {catsLoading ? (
          <p>Loading categories...</p>
        ) : catsError ? (
          <p className="text-danger">Error: {catsError}</p>
        ) : (
          categories.map((cat) => (
            <CategoryNavButton
              key={cat.title}
              text={cat.title}
              color={cat.color}
              onClick={() => {
                setSelectedCategory(cat.title);
                setSearch("");
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CategoriesPanel;
