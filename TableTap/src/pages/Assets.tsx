import { useState } from "react";
import Navbar from "../components/features/employee/global/Navbar";
import Sidebar from "../components/features/employee/global/Sidebar";
import OverlaySidebarShell from "../components/features/employee/assets/OverlaySidebar/AddItemSidebar";
import { GoPencil } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline, IoClose, IoCheckmark } from "react-icons/io5";
import AddItemSidebar from "../components/features/employee/assets/OverlaySidebar/AddItemSidebar";

{ /* TEST DATA for Categories */ }
const sampleCategoryData = [
  {
    title: "Pho",
    items: [
      {
        name: "1. Happy Pho Special",
        description:
          "Served with Rare Steak, Brisket, Tendon, Tripe, and Meatball",
      },
      {
        name: "2. Rare Steak Beef, Brisket, and Tripe",
        description: "Served with Rare Steak, Brisket, and Tripe",
      },
    ],
  },
  {
    title: "Appetizer",
    items: [
      {
        name: "Sampler Roll",
        description:
          "Served with 2 Egg rolls, 2 Shrimp rolls, and 2 Spring rolls",
      },
      {
        name: "Vietnamese Grilled Pork Sausage",
        description: "Served with 2 Grilled Pork Sausage spring rolls",
      },
    ],
  },
  {
    title: "Vermicelli",
    items: [
      {
        name: "Vermicelli Soup",
        description: "Served with either Chicken or Shrimp",
      },
      {
        name: "Vermicelli Bowl",
        description:
          "Served with a choice of 1 item. Comes with an egg roll, shredded lettuce, carrots, cucumbers, crushed peanuts, and a side of fish sauce",
      },
    ],
  },
];

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overlaySidebarOpen, setOverlaySidebarOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingModifierGroup, setisAddingModifierGroup] = useState(false);

  {/* Event handlers */}

  {/* Category section renderer */}
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
            />
            <label htmlFor="floatingInput">Add category</label>
          </div>

          {/* Add category button section */}
          <div id="AddCategoryButtons" className="d-flex">
            <button
              className="btn border-0 bg-trasnparent"
              type="button"
              id="CancelNewCategory"
              onClick={() => setIsAddingCategory(false)}
            >
              <IoClose
                style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }}
              />
            </button>

            <button
              className="btn border-0 bg-trasnparent"
              type="submit"
              id="SubmitNewCategory"
            >
              <IoCheckmark
                style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }}
              />
            </button>
          </div>
        </div>
      )}

      {/* TEMPORARY: Replace with database data */}
      {/* Indiviidual Category Top Bar */}
      {sampleCategoryData.map((group, index) => (
        <div className="mb-4" key={index} id={group.title.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toLowerCase())}
>
          <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
            <h4 className="m-0">{group.title}</h4>
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
          {group.items.map((item, itemIndex) => (
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
          ))}
        </div>
      ))}
    </>
  );

  {/* Modifier (Group) Renderer */}
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
            />
            <label htmlFor="floatingInput">Add modifier group</label>
          </div>

          {/* Modifier group button section */}
          <div id="AddModifierButtons" className="d-flex">
            <button
              className="btn border-0 bg-trasnparent"
              type="button"
              id="CancelNewModifierGroup"
              onClick={() => setisAddingModifierGroup(false)}
            >
              <IoClose
                style={{ color: "rgba(153, 35, 35, 1)", fontSize: "24px" }}
              />
            </button>

            <button
              className="btn border-0 bg-trasnparent"
              type="submit"
              id="SubmitNewModifierGroup"
            >
              <IoCheckmark
                style={{ color: "rgba(29, 114, 26, 1)", fontSize: "24px" }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Modifier Group Top Bar*/}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2" id="other">
        <h5 className="m-0">Other</h5>
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

      {/* TEMPORARY: Replace with database data */}
      {/* Modifier Group List Item */}
      <div
        className="d-flex justify-content-between align-items-center border rounded px-3 py-2 mb-2"
        style={{ backgroundColor: "#fff" }}
      >
        <div>
          <div className="fw-bold text-danger">No Onion</div>
        </div>
        <div>
          <button className="btn btn-sm mt-1 border-0">
            <GoPencil style={{ fontSize: "16px" }} />
          </button>

        </div>
      </div>
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

            {/* TODO: Temporary data. Replace with database data. */}
            <ul className="list-unstyled ms-3 mt-2">
              <li className="mb-2">
                <a href="#pho" className="text-dark text-decoration-none">Pho</a>
              </li>

              <li>
                <a href="#appetizer" className="text-dark text-decoration-none">Appetizer</a>
              </li>
            </ul>

            {/* Modifier Groups Nav Section */}
            <a href="#modifierGroups" className="fw-semibold fs-4 text-dark text-decoration-none">Modifier Groups</a>

            {/* TODO: Temporary data. Replace with database data. */}
            <ul className="list-unstyled ms-3 mt-2">
              <li className="mb-2">
                <a href="#other" className="text-dark text-decoration-none">Other</a>
              </li>
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
