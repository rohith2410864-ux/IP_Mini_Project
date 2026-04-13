import { NavLink } from 'react-router-dom';

import logo from '../assets/ssn-logo.webp';
import { useAuth } from '../state/AuthContext';

const UserSidebar = () => {
  const { logout } = useAuth();

  const activeClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? 'admin-nav-link active' : 'admin-nav-link';

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <img src={logo} alt="SSN Logo" className="navbar-logo" />
        <span className="sidebar-title">User Portal</span>
      </div>

      <nav className="admin-nav">
        <NavLink to="/user" end className={activeClass}>
          Dashboard
        </NavLink>
        <span className="admin-nav-section">Activities</span>
        <NavLink to="/user/events" className={activeClass}>
          Browse Events
        </NavLink>
        <NavLink to="/user/registrations" className={activeClass}>
          My Registrations
        </NavLink>

        <span className="admin-nav-section">Account</span>

        <button
          onClick={logout}
          className="admin-nav-link"
          style={{
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            width: '100%',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
          }}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default UserSidebar;

