import { type ReactNode } from 'react';
import './OverlaySidebar.css';
import { IoCloseOutline } from 'react-icons/io5';
import { useState } from 'react';


interface Props {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  title: "modifier" | "item" | "substitution";
}

const OverlaySidebarShell = ({ title, isOpen, onClose, children, onSave }: Props) => {
  const [inputTitle, setInputTitle] = useState("");

  if (!isOpen) return null;

  return (
    <aside className="OverlaySidebarShell">
      <div className="OverlayBackground" onClick={onClose}></div>
      <div className="OverlayContainer">
          {/* Sidebar header */}
          <div className="headerOverlaySidebarShell">
            <div className="headerTopBar">
              <button className="buttonX btn btn-light" onClick={onClose}><IoCloseOutline size={24} color="black"/></button>
            </div>
            <h1 className="headerTitle">{inputTitle ? `Add ${inputTitle}` : `Add ${title}`}</h1>
            <input className="titleInput form-control w-100" type="text" id="{title}" name="{title}" placeholder='Enter title' onChange={(e) => setInputTitle(e.target.value)}></input>
            <hr className="rounded"></hr>
          </div>
        
          {/* Middle sidebar content */}
          <div className="contentOverlaySidebarShell">{children}</div>

          {/* Overlay sidebar footer */}
          <hr className="rounded"></hr>
          <div className="footerOverlaySidebarShell">
            <button className="buttonSave btn btn-danger" onClick={() => { onSave(inputTitle); setInputTitle(""); onClose(); }}>Save</button>
          </div>
      </div>
    </aside>
  )
}

export default OverlaySidebarShell;