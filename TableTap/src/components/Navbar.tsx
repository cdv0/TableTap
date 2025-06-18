interface Props {
  heading: string;
}

const Navbar = ({ heading }: Props) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <nav className="navbar" style={{ backgroundColor: "#484848" }}>
      <div className="container-fluid d-flex justify-content-between text-white">
        <span className="navbar-brand mb-0 h1 text-white">{heading}</span>
        <span className="navbar-brand mb-0 h1 text-white">{today}</span>
      </div>
    </nav>
  );
};

export default Navbar;
