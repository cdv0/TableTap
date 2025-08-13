import { useState } from "react";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import { GoPencil } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";
import { IoClose, IoCheckmark } from "react-icons/io5";
import AddItemSidebar from "../components/features/employee/assets/OverlaySidebar/AddItemSidebar";
import { supabase } from "../supabaseClient";
import { useEffect } from "react";

const Assets = () => {
  //Left sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Right sidebar state
  const [overlaySidebarOpen, setOverlaySidebarOpen] = useState(false);

  // Fetch data from Supabase
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Category States
  // Add Category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState(""); // Temporarily store the draft input new category value
  const [categories, setCategories] = useState<any[]>([]); // The array of all category objects from Supabase categories table
  // Delete Category (and all category items)
  const [deleteCategoryIds, setDeleteCategoryIds] = useState<string | null>(null);

  // Inline edit: categories
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Modifier Group States
  // Add modifier group
  const [isAddingModifierGroup, setisAddingModifierGroup] = useState(false);
  const [newModifierGroup, setNewModifierGroup] = useState(""); // Temporarily store the draft input new modifier group value
  const [modifierGroups, setModifierGroups] = useState<any[]>([]); // The array of all modifier groups from Supabase
  // Delete modifier groups (and all modifiers)
  const [deleteModifierGroupIds, setDeleteModifierGroupIds] = useState<string | null>(null);

  // Event Handlers
  // Fetch the organization id
  useEffect(() => {
    const fetchOrgId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No logged-in user.");
        return;
      }

      const { data, error } = await supabase
        .from("employee")
        .select("organization_id")
        .eq("employee_id", user.id)
        .single(); // Expect only one row back

      if (error) {
        console.error("Error fetching organization ID:", error.message);
      } else {
        setOrganizationId(data.organization_id);
      }
    };

    fetchOrgId();
  }, []);

  // Fetch all of the organization's categories
  const fetchCategories = async () => {
    if (!organizationId) return;
    const { data, error } = await supabase.from("categories").select("*").eq("organization_id", organizationId);
    if (!error) setCategories(data ?? []);
  };

  useEffect(() => {
    fetchCategories();
  }, [organizationId]);

  // Handle Add Category
  const handleAddCategory = async (name: string, organizationId: string) => {
    const { data, error } = await supabase.from("categories").insert([
      {
        name: name,
        organization_id: organizationId,
      },
    ]);

    if (error) {
      console.error("Error adding category:", error.message);
    } else {
      console.log("Category added:", data);
      fetchCategories(); // Refetch after adding
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  // Handle Delete Categories and Category items (children first, then parent)
  const handleDeleteCategoryAndItems = async (categoryId: string) => {
    if (!organizationId) {
      console.error("Delete category: No organization ID detected.");
      return;
    }

    setDeleteCategoryIds(categoryId);

    try {
      // Delete menu items first (child table)
      const { error: itemsError } = await supabase
        .from("menu_items")
        .delete()
        .eq("category_id", categoryId)
        .eq("organization_id", organizationId);

      if (itemsError) throw itemsError;

      // Delete the category (parent)
      const { error: catError } = await supabase
        .from("categories")
        .delete()
        .eq("category_id", categoryId)
        .eq("organization_id", organizationId);

      if (catError) throw catError;

      await fetchCategories();
    } catch (err: any) {
      console.error(err?.message || err);
    } finally {
      setDeleteCategoryIds(null);
    }
  };

  // Edit Category Title Event Handlers
  const startEditCategory = (cat: any) => {
    setEditingCategoryId(cat.category_id);
    setEditCategoryName(cat.name ?? "");
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryName("");
  };

  const saveEditCategory = async () => {
    if (!organizationId || !editingCategoryId) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editCategoryName })
      .eq("category_id", editingCategoryId)
      .eq("organization_id", organizationId);
    if (error) {
      console.error("Update category failed:", error.message);
      return;
    }
    await fetchCategories();
    cancelEditCategory();
  };

  // Fetch all of the organization's modifier groups (scoped by org)
  const fetchModifierGroups = async () => {
    if (!organizationId) return;
    const { data, error } = await supabase.from("modifier_group").select("*").eq("organization_id", organizationId);
    if (!error) {
      setModifierGroups(data ?? []);
    } else {
      console.error("Failed to fetch modifier groups:", error.message);
    }
  };

  useEffect(() => {
    fetchModifierGroups();
  }, [organizationId]);

  // Handle Delete Modifier Groups and Modifiers (children first, then parent)
  const handleDeleteModifierGroupsAndModifers = async (modifierGroupId: string) => {
    if (!organizationId) {
      console.error("Delete modifier group: No organization ID detected.");
      return;
    }

    setDeleteModifierGroupIds(modifierGroupId);

    try {
      // Delete modifiers first (child table). Note: no org filter here because `modifier` has no org column.
      const { error: itemsError } = await supabase.from("modifier").delete().eq("modifier_group_id", modifierGroupId);

      if (itemsError) throw itemsError;

      // Delete the modifier group (parent)
      const { error: modifierError } = await supabase
        .from("modifier_group")
        .delete()
        .eq("modifier_group_id", modifierGroupId)
        .eq("organization_id", organizationId);

      if (modifierError) throw modifierError;

      await fetchModifierGroups();
    } catch (err: any) {
      console.error(err?.message || err);
    } finally {
      setDeleteModifierGroupIds(null);
    }
  };

  // Handle Add Modifier Group
  const handleAddModifierGroup = async (name: string, organizationId: string) => {
    const { data, error } = await supabase.from("modifier_group").insert([
      {
        name: name,
        organization_id: organizationId,
      },
    ]);

    if (error) {
      console.error("Error adding modifier group:", error.message);
    } else {
      console.log("Modifier group added:", data);
      fetchModifierGroups(); // Refetch after adding
      setNewModifierGroup("");
      setisAddingModifierGroup(false);
    }
  };

  // Category section renderer
  const renderCategories = () => (
    <>
      {/* Title Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Categories</h1>
        <button className="btn btn-danger" onClick={() => setIsAddingCategory(true)}>
          Add category
        </button>
      </div>

      {/* Add category input section when 'Add category' button is pressed */}
      {isAddingCategory && (
        <div id="AddCategoryInput" className="d-flex align-items-center w-100 gap-2 mb-3">
          {/* Add category input */}
          <div className="form-floating flex-grow-1">
            <input
              type="text"
              className="form-control"
              id="floatingInput"
              placeholder="Add category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <label htmlFor="floatingInput">Add category</label>
          </div>

          {/* Add category button section */}
          <div id="AddCategoryButtons" className="d-flex">
            <button className="btn border-0 bg-transparent" type="button" id="CancelNewCategory" onClick={() => setIsAddingCategory(false)}>
              <IoClose style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }} />
            </button>

            <button
              className="btn border-0 bg-transparent"
              type="submit"
              id="SubmitNewCategory"
              onClick={() => {
                if (!organizationId) {
                  console.error("Organization ID not loaded yet");
                  return;
                }
                handleAddCategory(newCategory, organizationId);
              }}
            >
              <IoCheckmark style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }} />
            </button>
          </div>
        </div>
      )}

      {/* Individual Category Blocks */}
      {categories.map((group) => (
        <div className="mb-4" key={group.category_id} id={group.name.toLowerCase().replace(/\s+/g, "")}>
          <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
            {editingCategoryId === group.category_id ? (
              // Edit Category Title
              <div className="d-flex align-items-center w-100 gap-2">
                <div className="form-floating flex-grow-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`editCat-${group.category_id}`}
                    placeholder="Edit category"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEditCategory()}
                  />
                  <label htmlFor={`editCat-${group.category_id}`}>Edit category</label>
                </div>

                <button className="btn border-0 bg-transparent" onClick={cancelEditCategory} title="Cancel">
                  <IoClose style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }} />
                </button>
                <button className="btn border-0 bg-transparent" onClick={saveEditCategory} title="Save">
                  <IoCheckmark style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }} />
                </button>
              </div>
            ) : (
              // Exit Category Title Edit Mode
              <>
                <h4 className="m-0">{group.name}</h4>
                <div>
                  <button className="btn btn-sm border-0 me-2" onClick={() => startEditCategory(group)} title="Edit category">
                    <GoPencil style={{ fontSize: "18px" }} />
                  </button>

                  <button
                    className="btn btn-sm border-0 me-2"
                    onClick={() => handleDeleteCategoryAndItems(group.category_id)}
                    disabled={deleteCategoryIds === group.category_id}
                    title="Delete category"
                  >
                    <IoTrashOutline style={{ fontSize: "18px", opacity: deleteCategoryIds === group.category_id ? 0.5 : 1 }} />
                  </button>

                  <button className="btn btn-sm border-0" onClick={() => setOverlaySidebarOpen(true)}>
                    <FaPlus style={{ fontSize: "18px" }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );

  // Modifier (Group) Renderer
  const renderModifiers = () => (
    <div className="mt-5">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Modifier Groups</h4>
        <button className="btn btn-danger" onClick={() => setisAddingModifierGroup(true)}>
          Add modifier group
        </button>
      </div>

      {/* Add modifier group input */}
      {isAddingModifierGroup && (
        <div id="AddModifierGroupInput" className="d-flex align-items-center w-100 gap-2 mb-3">
          {/* Add modifier group input */}
          <div className="form-floating flex-grow-1">
            <input
              type="text"
              className="form-control"
              id="floatingInput"
              placeholder="Add modifier group"
              value={newModifierGroup}
              onChange={(e) => setNewModifierGroup(e.target.value)}
            />
            <label htmlFor="floatingInput">Add modifier group</label>
          </div>

          {/* Modifier group button section */}
          <div id="AddModifierButtons" className="d-flex">
            <button className="btn border-0 bg-transparent" type="button" id="CancelNewModifierGroup" onClick={() => setisAddingModifierGroup(false)}>
              <IoClose style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }} />
            </button>

            <button
              className="btn border-0 bg-transparent"
              type="submit"
              id="SubmitNewModifierGroup"
              onClick={() => {
                if (!organizationId) {
                  console.error("Organization ID not loaded yet");
                  return;
                }
                handleAddModifierGroup(newModifierGroup, organizationId);
              }}
            >
              <IoCheckmark style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }} />
            </button>
          </div>
        </div>
      )}

      {/* Modifier Group Content */}
      {modifierGroups.map((group, index) => (
        <div key={index} className="mb-4" id={group.name.toLowerCase().replace(/\s+/g, "")}>
          <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
            <h5 className="m-0">{group.name}</h5>
            <div>
              <button className="btn btn-sm border-0 me-2">
                <GoPencil style={{ fontSize: "18px" }} />
              </button>

              <button
                className="btn btn-sm border-0 me-2"
                onClick={() => handleDeleteModifierGroupsAndModifers(group.modifier_group_id)}
                disabled={deleteModifierGroupIds === group.modifier_group_id}
                title="Delete modifier group"
              >
                <IoTrashOutline
                  style={{
                    fontSize: "18px",
                    opacity: deleteModifierGroupIds === group.modifier_group_id ? 0.5 : 1,
                  }}
                />
              </button>

              <button className="btn btn-sm border-0">
                <FaPlus style={{ fontSize: "18px" }} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  {/* Return TSX */}
  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      {/* Global Header & Navigation Sidebar*/}
      <Navbar heading="Table Tap" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Page Content */}
      <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: "100%" }}>
        {/* Asset Sidebar (Left Side Content) */}
        <div className="border-end p-3" style={{ width: "280px", overflowY: "auto" }}>
          <div className="d-flex flex-column">
            {/* Categories Nav Section */}
            <a href="#categories" className="fw-semibold fs-4 text-dark text-decoration-none">
              Categories
            </a>

            <ul className="list-unstyled ms-3 mt-2">
              {categories.map((c) => (
                <li key={c.category_id} className="mb-2">
                  <a href={`#${c.name.toLowerCase().replace(/\s+/g, "")}`} className="text-dark text-decoration-none">
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Modifier Groups Nav Section */}
            <a href="#modifierGroups" className="fw-semibold fs-4 text-dark text-decoration-none">
              Modifier Groups
            </a>

            <ul className="list-unstyled ms-3 mt-2">
              {modifierGroups.map((group) => (
                <li key={group.modifier_group_id || group.name} className="mb-2">
                  <a href={`#${group.name.toLowerCase().replace(/\s+/g, "")}`} className="text-dark text-decoration-none">
                    {group.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
          {/* Categories */}
          <div id="categories">{renderCategories()}</div>

          {/* Modifier Groups */}
          <div id="modifierGroups">{renderModifiers()}</div>

          {/* Close overlay sidebar when it's open */}
          {overlaySidebarOpen && <AddItemSidebar onClose={() => setOverlaySidebarOpen(false)}></AddItemSidebar>}
        </div>
      </div>
    </div>
  );
};

export default Assets;
