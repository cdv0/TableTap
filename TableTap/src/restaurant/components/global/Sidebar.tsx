import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { session, SignOutUser } = useAuth();

  const handleSignout = async (e: any) => {
    e.preventDefault();
    try {
      await SignOutUser();
    } catch (error) {
      console.error("Error logging out:", error);
    }
    console.log("Signed out!")
    navigate("/");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", zIndex: 1039 }}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className="position-fixed top-0 start-0 bg-dark text-white shadow d-flex flex-column justify-content-between p-4"
        style={{ width: "300px", height: "100vh", zIndex: 1040 }}
      >
        {/* Top: Heading and Nav Links */}
        <div>
          <h4 className="fw-bold mb-4">Happy Pho</h4>
          <ul className="list-unstyled">
            <li className="mb-3 border-bottom pb-2">
              <Link
                to="/restaurant/admin-dashboard"
                className="text-white text-decoration-none"
                onClick={onClose}
              >
                Home
              </Link>
            </li>
            <li className="mb-3 border-bottom pb-2">
              <Link
                to="/restaurant/tables"
                className="text-white text-decoration-none"
                onClick={onClose}
              >
                Tables
              </Link>
            </li>
            <li className="mb-3 border-bottom pb-2">
              <Link
                to="/restaurant/catalog"
                className="text-white text-decoration-none"
                onClick={onClose}
              >
                Catalog
              </Link>
            </li>
            <li className="mb-3 border-bottom pb-2">
              <Link
                to="/restaurant/assets"
                className="text-white text-decoration-none"
                onClick={onClose}
              >
                Assets
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom: Log Out Button */}
        <button className="btn btn-danger w-100 mt-3" onClick={handleSignout}>
          Log out
        </button>
      </div>
    </>
  );
};

export default Sidebar;
