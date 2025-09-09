import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/authContext";

const ProfileSidebar = () => {
  const { session, SignOutUser } = useAuth();
  const navigate = useNavigate();

  const handleCameraClick = () => {
    console.log("Camera clicked!");
    // TODO: Open file picker or modal
  };
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

  return (
    <div
      className="d-flex flex-column justify-content-between align-items-center"
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "400px",
        padding: "2rem 1rem",
        backgroundColor: "#e0e0e0",
      }}
    >
      {/* profile pic if we want that */}
      <button
        onClick={handleCameraClick}
        className="d-flex justify-content-center align-items-center bg-white rounded-circle border-0 shadow"
        style={{
          width: "120px",
          height: "120px",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "2rem" }}>icon</span>
      </button>
      <div>
        Hello! {session?.user?.email}
      </div>

      {/* log out button */}
      <button className="btn btn-danger w-100 mt-4" onClick={handleSignout}>
        Log out
      </button>
    </div>
  );
};

export default ProfileSidebar;
