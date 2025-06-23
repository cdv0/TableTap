import SidebarShell from './SidebarShell';

// Testing - Temporary data
const sections = [
  {
    title: "Categories",
    items: ["Pho", "Appetizer", "Vermicelli"]
  },
  {
    title: "Modifier Groups",
    items: ["Pho Broth", "Pho Noodles"]
  },
  {
    title: "Substitution",
    items: ["Meat"]
  },
  {
    title: "All modifier items",
    items: ["Beef", "Chicken"]
  },
]

const AssetNavigationSidebar = () => {
  // TODO: Add state

  return (
    <div className="w-64 p-4 bg-gray-50 border-r h-full overflow-y-auto">
      {sections.map((section => (
        <SidebarShell key={section.title} title={section.title} items={section.items}
        />
      )))}
    </div>
  );
};

export default AssetNavigationSidebar;
