import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import bgImage from '../assets/login-bg.jpg';
import logo from '../assets/ssn-logo.webp';
import { StudentService } from '../services/StudentService';
import type { StudentRegisterPayload } from '../types/models';

const UserRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<StudentRegisterPayload>({
    rollNumber: '',
    name: '',
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
      await StudentService.register(form);
      alert('Student registration successful. Please log in.');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Unable to register student';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="login-card">
        <img src={logo} alt="SSN Logo" className="login-logo" />
        <h2 className="login-title">Student Registration</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            value={form.rollNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, rollNumber: e.target.value }))}
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="College Email"
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
            {loading ? 'Registering...' : 'Create Student Account'}
          </button>
        </form>
        <p style={{ marginTop: '12px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default UserRegisterPage;
