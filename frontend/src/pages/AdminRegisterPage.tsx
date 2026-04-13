import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import bgImage from '../assets/login-bg.jpg';
import logo from '../assets/ssn-logo.webp';
import { FacultyService } from '../services/FacultyService';
import type { FacultyRegisterPayload } from '../types/models';

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FacultyRegisterPayload>({
    facultyId: '',
    facultyName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await FacultyService.register(form);
      alert('Faculty registration successful. Please log in.');
      navigate('/admin/login', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Unable to register faculty';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="login-card">
        <img src={logo} alt="SSN Logo" className="login-logo" />
        <h2 className="login-title">Faculty Registration</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="facultyId"
            placeholder="Faculty ID"
            value={form.facultyId}
            onChange={(e) => setForm((prev) => ({ ...prev, facultyId: e.target.value }))}
            required
          />
          <input
            type="text"
            name="facultyName"
            placeholder="Faculty Name"
            value={form.facultyName}
            onChange={(e) => setForm((prev) => ({ ...prev, facultyName: e.target.value }))}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Faculty Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Create Faculty Account'}
          </button>
        </form>
        <p style={{ marginTop: '12px', textAlign: 'center' }}>
          Already have an account? <Link to="/admin/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
