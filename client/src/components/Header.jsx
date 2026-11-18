import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="crm-header">
      <div className="d-flex align-items-center gap-2">
        <span className="text-secondary fw-semibold">Workspace</span>
        <span className="text-muted">/</span>
        <span className="text-dark fw-bold">Cloud Enterprise</span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end">
          <div className="fw-semibold text-dark">{user?.name}</div>
          <span className={`badge ${user?.role === 'Admin' ? 'bg-danger' : user?.role === 'Manager' ? 'bg-primary' : 'bg-info text-dark'}`} style={{ fontSize: '0.72rem' }}>
            {user?.role}
          </span>
        </div>

        <button onClick={logout} className="btn btn-outline-secondary btn-sm" title="Sign Out">
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

