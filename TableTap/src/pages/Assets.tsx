import Navbar from "../components/Navbar";
import AssetNavigationSidebar from "../components/AssetNavigationSidebar"

const Assets = () => {
  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>
      <Navbar heading="Assets" />

      <div className="d-flex flex-row flex-grow-1 overflow-hidden">
        <AssetNavigationSidebar/>

        <div>
          <h1>Assets</h1>
        </div>

      </div>
    </div>
  );
};

export default Assets;
