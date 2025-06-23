interface Props {
  title: string;
  items: string[];
  onClickItem?: (item: string) => void;
  activeItem?: string | null; // For styling the item that's clicked
}

const SidebarShell = ({ title, items, onClickItem, activeItem }: Props) => {
  return (
    <div>
        <h2>{title}</h2>
        <ul className="list-group list-group-flush">
            {items.map(item => (
                <li key={item}             
                className="list-group-item"
                onClick={() => onClickItem?.(item)}>{item}</li>
            ))}
        </ul>
    </div>
  );
};

export default SidebarShell;
