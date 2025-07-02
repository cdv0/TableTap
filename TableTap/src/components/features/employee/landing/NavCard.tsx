interface Props {
  color: string;
  label: string;
  icon: string;
  onClick?: () => void; // TODO: need to implement navigation
}

const NavCard = ({ color, label, icon, onClick }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="d-flex flex-column align-items-center justify-content-center shadow border-0"
      style={{
        width: "200px",
        height: "200px",
        backgroundColor: color,
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: "2rem" }}>{icon}</div>
      <h5 className="mt-2 text-white">{label}</h5>
    </button>
  );
};

export default NavCard;
