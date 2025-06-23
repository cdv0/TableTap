import type { ReactNode } from "react";

interface Props {
    group: string;
    title: string;
    onClose: () => void;
    onSave: () => void;
    children: ReactNode;
}

const OverlaySidebarShell = ({ title, group, onClose, onSave, children }: Props) => {
    return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: "40vw",
        backgroundColor: "#fff",
        zIndex: 9999, // very high to appear above all
        boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
      }}>
            {/* Section: Top Bar Buttons*/}
            <div className="text-end">
                <button className="btn" onClick={onClose}>X</button>
            </div>

            {/* Scrollable Content*/}
            <div style={{ flexGrow: 1, overflowY: "auto", padding: "1rem"}}>
                {/* Section: Title*/}
                <div>
                    <p>{group}</p>
                    <h1>{title}</h1>
                    <input placeholder="Enter title"></input>
                </div>
 
                <hr/>

                {/* Section: Content*/}
                <div>
                    {children}
                </div>
            </div>

            <hr/>

            {/* Section: Save*/}
            <div className="text-end">
                <button type="button" className=" btn btn-primary">Save</button> {/*TODO: Implement save button*/}
            </div>
        </div>
    );
};

export default OverlaySidebarShell;