import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import logo from '../assets/ssn-logo.webp';
import { useAuth } from '../state/AuthContext';

const DottedIndexLine = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: '2px',
      margin: '15px 0',
      paddingLeft: '24px',
      position: 'relative',
    }}
  >
    <div
      style={{
        width: '6px',
        height: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '50%',
        flexShrink: 0,
      }}
    />
    <div
      style={{
        flexGrow: 1,
        height: '1px',
        marginLeft: '8px',
        backgroundImage:
          'linear-gradient(to right, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0) 0%)',
        backgroundPosition: 'center',
        backgroundSize: '8px 1px',
        backgroundRepeat: 'repeat-x',
      }}
    />
  </div>
);

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleLogout = (): void => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const styleTag = `
    @keyframes fadeInSlide {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .dept-badge {
      animation: fadeInSlide 0.6s ease-out forwards;
      background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
      background-size: 200% 100%;
      animation: fadeInSlide 0.6s ease-out, shimmer 3s infinite linear;
    }
  `;

  const activeClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <div
      className="app-shell"
      style={{
        background: '#f4f6fb',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      <style>{styleTag}</style>

      <header
        className="navbar"
        style={{
          height: '70px',
          zIndex: 1200,
          backgroundColor: '#0b4f9f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <img src={logo} alt="Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '15px' }}>
            <span style={{ fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>SSN User Portal</span>
            <span
              className="dept-badge"
              style={{
                fontSize: '0.65rem',
                color: '#93c5fd',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                padding: '2px 6px',
                borderRadius: '4px',
                width: 'fit-content',
              }}
            >
              {user?.department || 'Department Not Set'}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2
            style={{
              color: 'white',
              margin: 0,
              fontSize: '1rem',
              fontWeight: '500',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            SSN college Event Management
          </h2>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 16px',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#6366f1',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                marginRight: '12px',
                fontSize: '0.8rem',
              }}
            >
              U
            </div>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>{user?.name || 'Student'}</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside
          style={{
            width: isSidebarOpen ? '280px' : '85px',
            transition: 'width 0.35s ease',
            display: 'flex',
            flexDirection: 'column',
            background: '#0b4f9f',
            height: '100%',
            zIndex: 1100,
            paddingTop: '25px',
          }}
        >
          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: '20px',
              marginBottom: '35px',
            }}
          >
            {isSidebarOpen ? (
              <div style={{ position: 'relative', width: '14px', height: '14px' }}>
                <span
                  style={{
                    position: 'absolute',
                    width: '14px',
                    height: '2px',
                    background: 'white',
                    transform: 'rotate(45deg)',
                    top: '6px',
                    left: '0',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    width: '14px',
                    height: '2px',
                    background: 'white',
                    transform: 'rotate(-45deg)',
                    top: '6px',
                    left: '0',
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ width: '18px', height: '2px', background: 'white' }} />
                <span style={{ width: '12px', height: '2px', background: 'white' }} />
                <span style={{ width: '18px', height: '2px', background: 'white' }} />
              </div>
            )}
          </button>

          {isSidebarOpen && (
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 15px' }}>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <DottedIndexLine />
                <NavLink
                  to="/user"
                  end
                  className={activeClass}
                  style={{
                    padding: '12px 20px',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                  }}
                >
                  Dashboard
                </NavLink>

                <DottedIndexLine />
                <NavLink
                  to="/user/events"
                  className={activeClass}
                  style={{
                    padding: '12px 20px',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                  }}
                >
                  Browse Events
                </NavLink>

                <DottedIndexLine />
                <NavLink
                  to="/user/registrations"
                  className={activeClass}
                  style={{
                    padding: '12px 20px',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                  }}
                >
                  My Registrations
                </NavLink>

                <div style={{ marginTop: 'auto', padding: '20px 0' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fca5a5',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          )}
        </aside>

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;

