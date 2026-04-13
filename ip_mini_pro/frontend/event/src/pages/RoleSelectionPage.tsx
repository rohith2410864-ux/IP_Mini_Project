import { useNavigate } from 'react-router-dom';

import logo from '../assets/ssn-logo.webp';
import bgImage from '../assets/login-bg.jpg';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="login-card">
        <img src={logo} alt="SSN Logo" className="login-logo" />

        <h2 className="login-title">Select Login Type</h2>
        <p className="login-subtitle">Choose how you want to sign in to the SSN Event Portal.</p>

        <div className="login-type-buttons">
          <button type="button" className="login-type-btn" onClick={() => navigate('/admin/login')}>
            Admin Login
          </button>

          <button
            type="button"
            className="login-type-btn secondary"
            onClick={() => navigate('/login')}
          >
            User Login
          </button>
        </div>

        <div style={{ marginTop: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button type="button" className="login-type-btn secondary" onClick={() => navigate('/admin/register')}>
            Faculty Register
          </button>
          <button type="button" className="login-type-btn secondary" onClick={() => navigate('/register')}>
            Student Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

