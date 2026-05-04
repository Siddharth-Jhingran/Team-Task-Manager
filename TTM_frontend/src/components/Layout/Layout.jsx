import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineFolder, HiOutlineClipboardList, HiOutlineUserGroup, HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import './Layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/projects', label: 'Projects', icon: HiOutlineFolder },
  { path: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
  { path: '/team', label: 'Team', icon: HiOutlineUserGroup },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPageTitle = () => {
    const current = navItems.find(item => location.pathname.startsWith(item.path));
    return current ? current.label : 'Dashboard';
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">T</div>
            <div>
              <span className="sidebar-logo-text">TTM</span>
              <span className="sidebar-logo-sub">Task Manager</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-nav-label">Menu</span>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user?.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>
            <h1 className="topbar-title">{getPageTitle()}</h1>
          </div>
          <div className="topbar-right">
            <span className={`topbar-role-badge ${user?.role}`}>
              {user?.role === 'admin' ? '⚡ Admin' : '👤 Member'}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              <HiOutlineLogout />
              Logout
            </button>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
