interface Props {
    title: string;
    items: string[];
    onSelect: (item: string) => void;
}

const Dropdown = ({ items, title, onSelect }: Props) => {
    return (
        <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {title}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                {items.map((item, index) => (
                    <button className="dropdown-item" 
                    key={index}
                    onClick={ () => onSelect(item)}
                    type="button">
                        {item}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Dropdown;