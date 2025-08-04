import { useState } from "react";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import { GoPencil } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline, IoClose, IoCheckmark } from "react-icons/io5";
import AddItemSidebar from "../components/features/employee/assets/OverlaySidebar/AddItemSidebar";
import { supabase } from "../supabaseClient";
import { useEffect } from "react";

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overlaySidebarOpen, setOverlaySidebarOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingModifierGroup, setisAddingModifierGroup] = useState(false);
  const [newCategory, setNewCategory] = useState("");  // Temporarily store the draft input new category value
  const [categories, setCategories] = useState<any[]>([]);  // The array of all category objects from Supabase categories table
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [newModifierGroup, setNewModifierGroup] = useState("");  // Temporarily store the draft input new modifier group value
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);  // The array of all modifier groups from Supabase

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
        .single();  // Expect only one row back

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
    const { data, error } = await supabase.from("categories").select("*");
    if (!error) { // If no error occurred then continue
      setCategories(data);
    } else {
      console.error("Failed to fetch categories:", error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Add Category
  const handleAddCategory = async (name: string, organizationId: string) => {
    const { data, error } = await supabase
      .from("categories")
      // Supabase automatically fills out the other fields e..g category_id and created_at
      .insert([
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

    // Fetch all of the organization's modifier groups
    const fetchModifierGroups = async () => {
      const { data, error } = await supabase.from("modifier_groups").select("*");
      if (!error) { // If no error occurred then continue
        setModifierGroups(data);
      } else {
        console.error("Failed to fetch modifier groups:", error.message);
      }
    };

    useEffect(() => {
      fetchModifierGroups();
    }, []);

    // Handle Add Category
    const handleAddModifierGroup = async (name: string, organizationId: string) => {
      const { data, error } = await supabase
        .from("modifier_groups")
        // Supabase automatically fills out the other fields e..g category_id and created_at
        .insert([
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
        <button
          className="btn btn-danger"
          onClick={() => setIsAddingCategory(true)}
        >
          Add category
        </button>
      </div>

      {/* Add category input section when 'Add category' button is pressed */}
      {isAddingCategory && (
        <div
          id="AddCategoryInput"
          className="d-flex align-items-center w-100 gap-2 mb-3"
        >
          {/* Add category input */}
          <div className="form-floating flex-grow-1">
            <input
              type="text"
              className="form-control"
              id="floatingInput"
              placeholder="Add category"
              value={newCategory}
              onChange={(e)=> setNewCategory(e.target.value)}
            />
            <label htmlFor="floatingInput">Add category</label>
          </div>

          {/* Add category button section */}
          <div id="AddCategoryButtons" className="d-flex">
            <button
              className="btn border-0 bg-transparent"
              type="button"
              id="CancelNewCategory"
              onClick={() => setIsAddingCategory(false)}
            >
              <IoClose
                style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }}
              />
            </button>

            <button
              className="btn border-0 bg-transparent"
              type="submit"
              id="SubmitNewCategory"
              onClick={() => {
                if (!organizationId) {
                  alert("Organization ID not loaded yet");
                  return;
                }
                handleAddCategory(newCategory, organizationId);
              }}
            >
          <IoCheckmark
            style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }}
          />
            </button>
          </div>
        </div>
      )}

      {/* Indiviidual Category Top Bar */}
      {categories.map((group, index) => (
        <div className="mb-4" key={index} id={group.name.toLowerCase().replace(/\s+/g, "")}>
          <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
            <h4 className="m-0">{group.name}</h4>
            <div>
              <button className="btn btn-sm border-0 me-2">
                <GoPencil style={{ fontSize: "18px" }} />
              </button>

              <button className="btn btn-sm border-0 me-2">
                <IoTrashOutline style={{ fontSize: "18px" }} />
              </button>

              <button 
              className="btn btn-sm border-0"
              onClick={() => setOverlaySidebarOpen(true)}
              >
                <FaPlus style={{ fontSize: "18px" }} />
              </button>
            </div>
          </div>

          {/* Indiviidual Category List Item */}
          {/* {group.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className="d-flex justify-content-between align-items-start border rounded px-3 py-2 mb-2"
              style={{ backgroundColor: "#fff" }}
            >
              <div>
                <div className="fw-bold text-danger">{item.name}</div>
                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                  {item.description}
                </div>
              </div>

              <div>
                <button className="btn btn-sm mt-1 border-0">
                  <GoPencil style={{ fontSize: "16px" }} />
                </button>

              </div>
            </div>
          ))} */}
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
        <button
          className="btn btn-danger"
          onClick={() => setisAddingModifierGroup(true)}
        >
          Add modifier group
        </button>
      </div>

      {/* Add modifier group input */}
      {isAddingModifierGroup && (
        <div
          id="AddModifierGroupInput"
          className="d-flex align-items-center w-100 gap-2 mb-3"
        >
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
            <button
              className="btn border-0 bg-transparent"
              type="button"
              id="CancelNewModifierGroup"
              onClick={() => setisAddingModifierGroup(false)}
            >
              <IoClose
                style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }}
              />
            </button>

            <button
              className="btn border-0 bg-transparent"
              type="submit"
              id="SubmitNewModifierGroup"
              onClick={() => {
                if (!organizationId) {
                  alert("Organization ID not loaded yet");
                  return;
                }
                handleAddModifierGroup(newModifierGroup, organizationId);
              }}
            >
            <IoCheckmark
              style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }}
            />
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

            <button className="btn btn-sm border-0 me-2">
              <IoTrashOutline style={{ fontSize: "18px" }} />
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
      <Navbar
        heading="Table Tap"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Page Content */}
      <div
        className="d-flex flex-grow-1 overflow-hidden"
        style={{ height: "100%" }}
      >
        {/* Asset Sidebar (Left Side Content) */}
        <div
          className="border-end p-3"
          style={{ width: "280px", overflowY: "auto" }}
        >
          <div className="d-flex flex-column">
            {/* Categories Nav Section */}
            <a href="#categories" className="fw-semibold fs-4 text-dark text-decoration-none">Categories</a>

            <ul className="list-unstyled ms-3 mt-2">
              {categories.map((c) => (
                <li key={c.category_id} className="mb-2">
                  <a
                    href={`#${c.name.toLowerCase().replace(/\s+/g, "")}`}
                    className="text-dark text-decoration-none"
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Modifier Groups Nav Section */}
            <a href="#modifierGroups" className="fw-semibold fs-4 text-dark text-decoration-none">Modifier Groups</a>

            <ul className="list-unstyled ms-3 mt-2">
              {modifierGroups.map((group) => (
                <li key={group.modifier_group_id || group.name} className="mb-2">
                  <a
                    href={`#${group.name.toLowerCase().replace(/\s+/g, "")}`}
                    className="text-dark text-decoration-none"
                  >
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
          <div id="categories">
            {renderCategories()}
          </div>

          {/* Modifier Groups */}
          <div id="modifierGroups">
            {renderModifiers()}
          </div>

          {/* Close overlay sidebar when it's open */}
          { overlaySidebarOpen && (
            <AddItemSidebar onClose={() => setOverlaySidebarOpen(false)}>

            </AddItemSidebar>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assets;
