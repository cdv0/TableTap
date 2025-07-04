import { useState } from 'react';

interface Props {
  sections: {
    title: string;
    items: string[];
  }[];
  onSelect: (sectionTitle: string, item: string) => void;
}

const AssetNavigationSidebar = ({ sections, onSelect }: Props) => {
    const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <div className="d-flex flex-column gap-4">
      {sections.map((sec, index) => (
        <div key={index}>
          <h3>{sec.title}</h3>
          <ul className="list-group list-group-flush">
            {sec.items.map((item, itemIndex) => (
              <li className={`list-group-item ${activeItem=== item ? "active" : ""}`}
               key={itemIndex} 
               onClick={() => {setActiveItem(item); onSelect(sec.title, item);}} 
               style={{cursor: "pointer"}}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AssetNavigationSidebar;
