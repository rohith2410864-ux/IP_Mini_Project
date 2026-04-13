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
        backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0) 0%)',
        backgroundPosition: 'center',
        backgroundSize: '8px 1px',
        backgroundRepeat: 'repeat-x',
      }}
    />
  </div>
);

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleLogout = (): void => {
    if (window.confirm('Are you sure you want to logout from the Admin Portal?')) {
      logout();
      navigate('/admin/login');
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
    .admin-badge {
      animation: fadeInSlide 0.6s ease-out forwards, shimmer 3s infinite linear;
      background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
      background-size: 200% 100%;
    }
    .admin-nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
    }
    .admin-nav-link.active {
      background-color: rgba(255, 255, 255, 0.2) !important;
      font-weight: 600;
    }
  `;

  const activeClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? 'admin-nav-link active' : 'admin-nav-link';

  return (
    <div
      className="admin-layout-wrapper"
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
        className="admin-topbar"
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
            <span style={{ fontSize: '1.1rem', color: 'white', fontWeight: '600' }}>SSN Admin Portal</span>
            <span
              className="admin-badge"
              style={{
                fontSize: '0.65rem',
                color: '#e0e0e0',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '2px 6px',
                borderRadius: '4px',
                width: 'fit-content',
              }}
            >
              Logged in as Admin
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
            SSN College Event Management
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
              A
            </div>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>System Administrator</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside
          style={{
            width: isSidebarOpen ? '260px' : '85px',
            transition: 'width 0.3s ease',
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
              <nav className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <DottedIndexLine />
                <NavLink
                  to="/admin"
                  end
                  className={activeClass}
                  style={{
                    padding: '12px 20px',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    display: 'block',
                  }}
                >
                  Dashboard
                </NavLink>

                <DottedIndexLine />
                <span
                  style={{
                    padding: '10px 20px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  Events
                </span>

                <NavLink
                  to="/admin/manage-events"
                  className={activeClass}
                  style={{
                    padding: '12px 20px',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    display: 'block',
                  }}
                >
                  Manage Events
                </NavLink>

                <DottedIndexLine />
                <span
                  style={{
                    padding: '10px 20px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  Participants
                </span>

                <NavLink
                  to="/admin/participants"
                  className={activeClass}
                  style={{
                    padding: '12px 20px',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    display: 'block',
                  }}
                >
                  View Participants
                </NavLink>

                <div style={{ marginTop: 'auto', padding: '20px 0' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: 'rgba(255,77,77,0.1)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#ff4d4d',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          )}
        </aside>

        <main className="admin-content" style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

