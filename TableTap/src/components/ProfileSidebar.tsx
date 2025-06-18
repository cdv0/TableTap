import { useNavigate } from "react-router-dom";

const ProfileSidebar = () => {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    console.log("Camera clicked!");
    // TODO: Open file picker or modal
  };
  const handleLogOut = () => {
    navigate("/"); // TODO: implement logout auth
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

      {/* log out button */}
      <button className="btn btn-danger w-100 mt-4" onClick={handleLogOut}>
        Log out
      </button>
    </div>
  );
};

export default ProfileSidebar;
