import { useState, useEffect } from "react";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import { GoPencil } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline, IoClose, IoCheckmark } from "react-icons/io5";
import AddItemSidebar from "../components/features/employee/assets/OverlaySidebar/AddItemSidebar";
import {
  selectCategories,
  insertCategory,
  updateCategoryName,
  deleteCategoryCascade,
} from "../services/Categories";
import {
  selectModifierGroups,
  insertModifierGroup,
  updateModifierGroupName,
  deleteModifierGroupCascade,
} from "../services/ModifierGroups";
import {
  selectModifiersByGroupIds,
  insertModifier,
  updateModifierName,
  deleteModifierById,
} from "../services/Modifiers";
import {
  selectMenuItems
} from "../services/MenuItems"
import { useOrganizationId } from "../hooks/useOrganizationId";
import { useDbCategories } from "../hooks/useDbCategories";
import { useModifierGroups } from "../hooks/useModifierGroups";
import { useModifiersByGroup } from "../hooks/useModifiers";
import { supabase } from "../supabaseClient";

interface ModifierGroup {
  modifier_group_id: string;
  name: string;
}

const Assets = () => {
  //Left sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Right sidebar state
  const [overlaySidebarOpen, setOverlaySidebarOpen] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]); // The array of all modifier groups from Supabase
  // Delete modifier groups (and all modifiers)
  const [deleteModifierGroupIds, setDeleteModifierGroupIds] = useState<string | null>(null);

  // Inline edit: modifier groups
  const [editingModifierGroupId, setEditingModifierGroupId] = useState<string | null>(null);
  const [editModifierGroupName, setEditModifierGroupName] = useState("");

  // Add modifier
  const [isAddingModifier, setIsAddingModifier] = useState(false);
  const [newModifier, setNewModifier] = useState("");  // Temporarily store the new modifier input value
  const [modifierGroupId, setModifierGroupId] = useState<string | null>(null);

  // Store modifiers grouped by modifier_group_id
  const [modifiersByGroup, setModifiersByGroup] = useState<Record<string, any[]>>({});

  // Edit modifier
  const [editingModifierId, setEditingModifierId] = useState<string | null>(null);
  const [editModifierName, setEditModifierName] = useState("");

  // Delete modifier
  const [deleteModifierId, setDeleteModifierId] = useState<string | null>(null);

  // useEffect hooks
  useOrganizationId(setOrganizationId);
  useDbCategories(organizationId, setCategories);
  useModifierGroups(organizationId, setModifierGroups);
  useModifiersByGroup(modifierGroups, setModifiersByGroup);

  const [menuItemsByCategory, setMenuItemsByCategory] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const refreshMenuItems = async () => {
      if (!organizationId) return;
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("organization_id", organizationId);
      if (!error) {
        const grouped: Record<string, any[]> = {};
        (data ?? []).forEach((it: any) => {
          const key = it.category_id;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(it);
        });
        setMenuItemsByCategory(grouped);
      } else {
        console.error("Failed to fetch menu items:", error.message);
      }
    };
    refreshMenuItems();
  }, [organizationId]);

  // HELPER FUNCTIONS

  // Handle Add Category
  const handleAddCategory = async (name: string, orgId: string) => {
    const { error } = await insertCategory(name, orgId);
    if (error) {
      console.error("Error adding category:", error.message);
      return;
    }
    if (organizationId) {
      const { data: list, error: listErr } = await selectCategories(organizationId);
      if (!listErr) setCategories(list ?? []);
    }
    setNewCategory("");
    setIsAddingCategory(false);
  };

  // Save edit category
  const saveEditCategory = async () => {
    if (!organizationId || !editingCategoryId) return;
    const { error } = await updateCategoryName(organizationId, editingCategoryId, editCategoryName);
    if (error) {
      console.error("Update category failed:", error.message);
      return;
    }
    if (organizationId) {
      const { data: list, error: listErr } = await selectCategories(organizationId);
      if (!listErr) setCategories(list ?? []);
    }
    cancelEditCategory();
  };

  // Handle Delete Categories and Category items (children first, then parent)
  const handleDeleteCategoryAndItems = async (categoryId: string) => {
    if (!organizationId) {
      console.error("Delete category: No organization ID detected.");
      return;
    }
    setDeleteCategoryIds(categoryId);
    try {
      await deleteCategoryCascade(organizationId, categoryId);
      // Refresh categories
      const { data: list, error: listErr } = await selectCategories(organizationId);
      if (!listErr) setCategories(list ?? []);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("organization_id", organizationId);
      if (!error) {
        const grouped: Record<string, any[]> = {};
        (data ?? []).forEach((it: any) => {
          const key = it.category_id;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(it);
        });
        setMenuItemsByCategory(grouped);
      }
    } catch (err: any) {
      console.error(err?.message || err);
    } finally {
      setDeleteCategoryIds(null);
    }
  };

  // Inline edit handlers: Categories
  const startEditCategory = (cat: any) => {
    setEditingCategoryId(cat.category_id);
    setEditCategoryName(cat.name ?? "");
  };
  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryName("");
  };

  // Handle Add Modifier (submit)
  const handleAddModifier = async (name: string, mGroupId: string) => {
    const trimmed = name.trim();
    const { error } = await insertModifier(trimmed, mGroupId);
    if (error) {
      console.error("Error adding modifier:", error.message);
      return;
    }

    // refresh modifiers for all groups so the UI re-renders the new one
    const ids = modifierGroups.map((g) => g.modifier_group_id).filter(Boolean);
    const { data, error: mErr } = await selectModifiersByGroupIds(ids);
    if (!mErr) {
      const grouped: Record<string, any[]> = {};
      (data ?? []).forEach((m: any) => {
        const key = m.modifier_group_id;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
      });
      setModifiersByGroup(grouped);
    }

    setNewModifier("");
    setIsAddingModifier(false);
    setModifierGroupId(null);
  };

  // Save edit modifier
  const saveEditModifier = async () => {
    if (!editingModifierId) return;
    const { error } = await updateModifierName(editingModifierId, editModifierName);
    if (error) {
      console.error("Update modifier failed:", error.message);
      return;
    }

    // Refresh modifiers
    const ids = modifierGroups.map((g) => g.modifier_group_id).filter(Boolean);
    const { data, error: mErr } = await selectModifiersByGroupIds(ids);
    if (!mErr) {
      const grouped: Record<string, any[]> = {};
      (data ?? []).forEach((m: any) => {
        const key = m.modifier_group_id;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
      });
      setModifiersByGroup(grouped);
    }

    cancelEditModifier();
  };

  // Handle delete modifier
  const handleDeleteModifier = async (modId: string) => {
    if (!modId) {
      console.error("Delete modifier: No modifier ID detected.");
      return;
    }
    setDeleteModifierId(modId);
    try {
      const { error: modError } = await deleteModifierById(modId);
      if (modError) throw modError;

      // Refresh modifiers
      const ids = modifierGroups.map((g) => g.modifier_group_id).filter(Boolean);
      const { data, error: mErr } = await selectModifiersByGroupIds(ids);
      if (!mErr) {
        const grouped: Record<string, any[]> = {};
        (data ?? []).forEach((m: any) => {
          const key = m.modifier_group_id;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(m);
        });
        setModifiersByGroup(grouped);
      }
    } catch (err: any) {
      console.error(err?.message || err);
    } finally {
      setDeleteModifierId(null);
    }
  };

  // Edit Modifier Groups
  const startEditModifierGroup = (group: any) => {
    setEditingModifierGroupId(group.modifier_group_id);
    setEditModifierGroupName(group.name ?? "");
  };
  const cancelEditModifierGroup = () => {
    setEditingModifierGroupId(null);
    setEditModifierGroupName("");
  };

  // Handle Add Modifier Group
  const handleAddModifierGroup = async (name: string, orgId: string) => {
    const { error } = await insertModifierGroup(name, orgId);
    if (error) {
      console.error("Error adding modifier group:", error.message);
      return;
    }

    // Refetch after adding
    if (organizationId) {
      const { data: groups, error: gErr } = await selectModifierGroups(organizationId);
      if (!gErr) setModifierGroups(groups ?? []);
    }

    setNewModifierGroup("");
    setisAddingModifierGroup(false);
  };

  // Save edit modifier group
  const saveEditModifierGroup = async () => {
    if (!organizationId || !editingModifierGroupId) return;
    const { error } = await updateModifierGroupName(
      organizationId,
      editingModifierGroupId,
      editModifierGroupName
    );
    if (error) {
      console.error("Update modifier group failed:", error.message);
      return;
    }

    // Refresh groups after update
    const { data: groups, error: gErr } = await selectModifierGroups(organizationId);
    if (!gErr) setModifierGroups(groups ?? []);

    cancelEditModifierGroup();
  };

  // Handle Delete Modifier Groups and Modifiers (children first, then parent)
  const handleDeleteModifierGroupsAndModifers = async (mGroupId: string) => {
    if (!organizationId) {
      console.error("Delete modifier group: No organization ID detected.");
      return;
    }
    setDeleteModifierGroupIds(mGroupId);
    try {
      await deleteModifierGroupCascade(organizationId, mGroupId);
      // Refresh groups
      const { data: groups, error: gErr } = await selectModifierGroups(organizationId);
      if (!gErr) setModifierGroups(groups ?? []);
    } catch (err: any) {
      console.error(err?.message || err);
    } finally {
      setDeleteModifierGroupIds(null);
    }
  };

  // Edit modifier handlers
  const startEditModifier = (mod: any) => {
    setEditingModifierId(mod.modifier_id);
    setEditModifierName(mod.name ?? "");
  };
  const cancelEditModifier = () => {
    setEditingModifierId(null);
    setEditModifierName("");
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
              autoFocus
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
              // --- EDITING MODE ---
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
                    autoFocus
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
              // --- VIEW MODE ---
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

                  <button className="btn btn-sm border-0" onClick={() => { setSelectedCategoryId(group.category_id); setOverlaySidebarOpen(true); }}>
                    <FaPlus style={{ fontSize: "18px" }} />
                  </button>
                </div>
              </>
            )}
          </div>

          {(menuItemsByCategory[group.category_id] ?? []).map((item) => (
            <div
              key={item.item_id}
              className="d-flex justify-content-between align-items-start border rounded px-3 py-3 mb-2"
              style={{ backgroundColor: "#fff" }}
            >
              <>
                <div className="fw-bold text-danger">
                  {item.name}
                </div>
                <div></div>
              </>
            </div>
          ))}
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
              autoFocus
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
            {editingModifierGroupId === group.modifier_group_id ? (
              // --- EDITING MODE ---
              <div className="d-flex align-items-center w-100 gap-2">
                <div className="form-floating flex-grow-1">
                  <input
                    type="text"
                    className="form-control"
                    id={`editModGroup-${group.modifier_group_id}`}
                    placeholder="Edit modifier group"
                    value={editModifierGroupName}
                    onChange={(e) => setEditModifierGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEditModifierGroup()}
                    autoFocus
                  />
                  <label htmlFor={`editModGroup-${group.modifier_group_id}`}>Edit modifier group</label>
                </div>

                <button className="btn border-0 bg-transparent" onClick={cancelEditModifierGroup} title="Cancel">
                  <IoClose style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }} />
                </button>
                <button className="btn border-0 bg-transparent" onClick={saveEditModifierGroup} title="Save">
                  <IoCheckmark style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }} />
                </button>
              </div>
            ) : (
              // --- VIEW MODE ---
              <>
                <h5 className="m-0">{group.name}</h5>
                <div>
                  <button className="btn btn-sm border-0 me-2" onClick={() => startEditModifierGroup(group)} title="Edit modifier group">
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

                  <button
                    className="btn btn-sm border-0"
                    onClick={() => {
                      // open the inline input for THIS group
                      setIsAddingModifier(true);
                      setModifierGroupId(group.modifier_group_id);
                      setNewModifier("");
                    }}
                    title="Add modifier"
                  >
                    <FaPlus style={{ fontSize: "18px" }} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* List all modifiers for this group */}
          {(modifiersByGroup[group.modifier_group_id] ?? []).map((mod) => (
            <div
              key={mod.modifier_id}
              className="d-flex justify-content-between align-items-start border rounded px-3 py-3 mb-2"
              style={{ backgroundColor: "#fff" }}
            >
              {editingModifierId === mod.modifier_id ? (
                // --- EDITING A MODIFIER ---
                <div className="d-flex align-items-center w-100 gap-2">
                  <div className="form-floating flex-grow-1">
                    <input
                      type="text"
                      className="form-control"
                      id={`editMod-${mod.modifier_id}`}
                      placeholder="Edit modifier"
                      value={editModifierName}
                      onChange={(e) => setEditModifierName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEditModifier()}
                      autoFocus
                    />
                    <label htmlFor={`editMod-${mod.modifier_id}`}>Edit modifier</label>
                  </div>

                  <button className="btn border-0 bg-transparent" onClick={cancelEditModifier} title="Cancel">
                    <IoClose style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }} />
                  </button>
                  <button className="btn border-0 bg-transparent" onClick={saveEditModifier} title="Save">
                    <IoCheckmark style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }} />
                  </button>
                </div>
              ) : (
                // --- VIEW A MODIFIER ---
                <>
                  <div className="fw-bold text-danger">{mod.name}</div>
                  <div>
                    <button className="btn btn-sm border-0 me-2" onClick={() => startEditModifier(mod)} title="Edit modifier">
                      <GoPencil style={{ fontSize: "18px" }} />
                    </button>

                    <button
                      className="btn btn-sm border-0 me-2"
                      onClick={() => handleDeleteModifier(mod.modifier_id)}
                      disabled={deleteModifierId === mod.modifier_id}
                      title="Delete modifier"
                    >
                      <IoTrashOutline style={{ fontSize: "18px" }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add new modifier input row (new line under the group) */}
          {isAddingModifier && modifierGroupId === group.modifier_group_id && (
            <div id="AddModifierInput" className="d-flex align-items-center w-100 gap-2 mb-3">
              {/* Input */}
              <div className="form-floating flex-grow-1">
                <input
                  type="text"
                  className="form-control"
                  id={`addModifier-${group.modifier_group_id}`}
                  placeholder="Add modifier"
                  value={newModifier}
                  onChange={(e) => setNewModifier(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && modifierGroupId) {
                      await handleAddModifier(newModifier, modifierGroupId);
                    }
                  }}
                  autoFocus
                />
                <label htmlFor={`addModifier-${group.modifier_group_id}`}>Add modifier</label>
              </div>

              {/* Buttons */}
              <div id="AddModifierButtons" className="d-flex">
                <button
                  className="btn border-0 bg-transparent"
                  type="button"
                  id="CancelNewModifier"
                  onClick={() => {
                    setIsAddingModifier(false);
                    setNewModifier("");
                    setModifierGroupId(null);
                  }}
                  title="Cancel"
                >
                  <IoClose style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }} />
                </button>

                <button
                  className="btn border-0 bg-transparent"
                  type="submit"
                  id="SubmitNewModifier"
                  onClick={async () => {
                    if (!modifierGroupId) {
                      console.error("Modifier group ID not found.");
                      return;
                    }
                    await handleAddModifier(newModifier, modifierGroupId);
                  }}
                  title="Save"
                >
                  <IoCheckmark style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Return TSX
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
          {overlaySidebarOpen && (
            <AddItemSidebar
              onClose={() => {
                setOverlaySidebarOpen(false);
                setSelectedCategoryId(null);
              }}
              categoryId={selectedCategoryId}
              modifierGroups={modifierGroups}
              organizationId={organizationId}
              onSaved={async () => {
                if (!organizationId) {
                  setOverlaySidebarOpen(false);
                  setSelectedCategoryId(null);
                  return;
                }
                const { data, error } = await selectMenuItems(organizationId);
                if (!error) {
                  const grouped: Record<string, any[]> = {};
                  (data ?? []).forEach((it: any) => {
                    const key = it.category_id;
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(it);
                  });
                  setMenuItemsByCategory(grouped);
                }
                setOverlaySidebarOpen(false);
                setSelectedCategoryId(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Assets;
