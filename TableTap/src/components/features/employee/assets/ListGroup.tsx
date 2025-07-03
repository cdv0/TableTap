interface Props {
    title: string;
    items: string[];
}

const ListGroup = ({ title, items }: Props) => {
    return (
        <>
            <h2>{title}</h2>
            <ul className="list-group list-group-flush">
                {items.map((item, index) => (
                    <li key={index} className="list-group-item">
                        {item}
                    </li>
                ))}
            </ul>
        </>
    );
};

export default ListGroup;