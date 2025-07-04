import { BsThreeDotsVertical } from "react-icons/bs";
import { useState, useEffect, useRef } from "react";

interface Props {
  title: string;
  items: string[];
}

const ListGroup = ({ title, items }: Props) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Detect outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <h2>{title}</h2>
      <ul className="list-group list-group-flush">
        {items.map((item, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {item}
            <div
              style={{ position: "relative" }}
              ref={openMenuIndex === index ? menuRef : null}
            >
              <button
                onClick={() =>
                  setOpenMenuIndex(openMenuIndex === index ? null : index)
                }
                className="btn rounded-circle border-0"
              >
                <BsThreeDotsVertical />
              </button>
              {openMenuIndex === index && (
                <div
                  className="position-absolute bg-white border rounded shadow-sm d-grid row-gap-2 p-2 px-3"
                  style={{ top: "100%", right: 0, zIndex: 1000 }}
                >
                  <button className="dropdown-item">Edit</button>
                  <button className="dropdown-item">Delete</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ListGroup;
