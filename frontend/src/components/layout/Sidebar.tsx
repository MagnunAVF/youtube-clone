import { NavLink } from 'react-router-dom';
import { HomeIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`}>
        <nav>
          <ul>
            <li>
              <NavLink to="/" end onClick={onClose}>
                <HomeIcon />
                <span>Home</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
