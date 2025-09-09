interface Props {
  heading: string;
  onToggleSidebar: () => void;
}

const Navbar = ({ heading, onToggleSidebar }: Props) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <nav
      className="navbar navbar-expand-lg pb-0 pt-0 navbar-dark"
      style={{ backgroundColor: "#484848" }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <button
            className="btn text-white fs-2 me-2"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <span className="navbar-brand mb-0 h1 fs-4">{heading}</span>
        </div>

        <span className="navbar-brand mb-0 h1 fs-4">{today}</span>
      </div>
    </nav>
  );
};

export default Navbar;
