import React from 'react';
import { 
  FileText, 
  LayoutDashboard, 
  BarChart2, 
  Settings, 
  Plus, 
  ChevronLeft 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Plus size={24} style={{ transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        <div className="logo-icon">L</div>
        {!isCollapsed && <span className="logo-text">LegalGraph AI</span>}
        <button className="sidebar-toggle" onClick={onToggle}>
          <ChevronLeft size={16} style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </button>
      </div>

      <button className="review-docs-btn">
        {!isCollapsed && <span>Review documents</span>}
        <Plus size={18} />
      </button>

      <nav className="sidebar-nav">
        <NavLink to="/vault" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          {!isCollapsed && <span>Contract Vault</span>}
        </NavLink>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          {!isCollapsed && <span>COI Dashboard</span>}
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart2 size={18} />
          {!isCollapsed && <span>Analysis Results</span>}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
          <Settings size={18} />
          {!isCollapsed && <span>Setting</span>}
        </NavLink>
      </nav>
    </aside>
    {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
