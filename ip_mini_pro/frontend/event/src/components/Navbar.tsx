import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../state/AuthContext';
import logo from '../assets/ssn-logo.webp';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = (): void => {
    navigate(user?.role === 'admin' ? '/admin' : '/');
  };

  return (
    <header className="navbar">
      <div className="navbar-left" onClick={handleLogoClick}>
        <img src={logo} alt="SSN College Logo" className="navbar-logo" />
        <span className="navbar-title">SSN Event Portal</span>
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="navbar-actions" ref={menuRef}>
            <div className="navbar-user-chip">
              <div className="navbar-avatar">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="navbar-user-name-mobile">{user.name}</span>
            </div>

            <button className="menu-btn" onClick={() => setIsMenuOpen((v) => !v)} aria-label="Menu">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </button>

            {isMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <strong>Menu</strong>
                </div>

                <ul className="dropdown-list">
                  <li>
                    <Link to={user.role === 'admin' ? '/admin' : '/user'} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/user/events" onClick={() => setIsMenuOpen(false)}>
                      View Events
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-logout" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <Link className="btn-primary" to="/login">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;

