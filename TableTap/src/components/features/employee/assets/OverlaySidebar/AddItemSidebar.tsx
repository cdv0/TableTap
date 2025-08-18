import { useState } from "react";
import { IoClose } from "react-icons/io5";
import "./addItemSidebar.css";

interface Props {
  onClose: () => void;
}

function AddItemSidebar({ onClose }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="overlayBackground">
      <div className="overlayContainer d-flex flex-column">
        {/* Top & Middle */}
        <div className="flex-grow-1 d-flex flex-column">
          {/* Top title Section */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">Add item</h1>
            <button
              className="btn border-0 bg-transparent"
              type="button"
              id="ButtonClose"
              onClick={onClose}
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Middle Section */}
          <div className="flex-grow-1 overflow-auto">
            <form>

              {/* Name Section */}
              <div className="mb-3">
                <p className="mb-1 fw-semibold">Name</p>
                <input
                  placeholder="Name"
                  type="text"
                  className="form-control"
                />
              </div>

              {/* Description Section */}
              <div className="mb-3">
                <p className="mb-1 fw-semibold">Description</p>
                <textarea
                  className="form-control"
                  placeholder="Description"
                ></textarea>
              </div>

              {/* Upload Image Section */}
              <div className="mb-3">
                <p className="mb-1 fw-semibold">Image</p>
                <input type="file" id="file" name="filename"></input>
              </div>

              {/* Modifier Groups Section */}
              <div className="mb-3">
                <p className="mb-1 fw-semibold">Modifier Groups</p>
                
                {/* Modifier Groups Dropdown */}
                <div className="dropdown">
                  <button
                    className="custom-dropdown-style btn dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    style={{}}
                    onClick={() =>
                      setIsDropdownOpen((prev: boolean) => !prev)
                    }
                  >
                    Select modifier group
                  </button>
                  <div
                    className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}
                    aria-labelledby="dropdownMenuButton"
                  >
                    <button className="dropdown-item" type="button">
                      Toppings
                    </button>
                    <button className="dropdown-item" type="button">
                      Sides
                    </button>
                    <button className="dropdown-item" type="button">
                      Extras
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-3 border-top d-flex gap-2 justify-content-end">
          <button className="btn border-0 fw-semibold">Delete</button>
          <button className="btn btn-danger fw-semibold">Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddItemSidebar;
