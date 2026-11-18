import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style={{ width: '56px', height: '56px' }}>
              <i className="bi bi-shield-check fs-2"></i>
            </div>
            <h3 className="fw-bold mb-1">AcxiomCRM</h3>
            <p className="text-muted small">Sign in to your Cloud MERN sales workspace</p>
          </div>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-3 border-top text-center">
            <span className="small text-muted">Need an account?</span>
            <Link to="/register" className="small fw-semibold text-primary text-decoration-none ms-1">Register user</Link>
          </div>

          <div className="mt-4 bg-light p-3 rounded small">
            <div className="fw-bold text-dark mb-1"><i className="bi bi-info-circle me-1"></i> Quick Test Accounts:</div>
            <div className="d-flex flex-wrap gap-1 mt-2">
              <button type="button" onClick={() => setTestAccount('admin@acxiomcrm.com', 'Admin@123')} className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.75rem' }}>Admin</button>
              <button type="button" onClick={() => setTestAccount('manager@acxiomcrm.com', 'Manager@123')} className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem' }}>Manager</button>
              <button type="button" onClick={() => setTestAccount('sales@acxiomcrm.com', 'Sales@123')} className="btn btn-sm btn-outline-info text-dark" style={{ fontSize: '0.75rem' }}>Sales Rep</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

