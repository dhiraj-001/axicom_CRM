import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('SalesExecutive');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">Create Account</h3>
            <p className="text-muted small">Register a new user in AcxiomCRM</p>
          </div>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="corporate@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">System Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="SalesExecutive">Sales Executive</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Password (Min. 8 characters)</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
              {loading ? 'Creating...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-top text-center">
            <span className="small text-muted">Already registered?</span>
            <Link to="/login" className="small fw-semibold text-primary text-decoration-none ms-1">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

