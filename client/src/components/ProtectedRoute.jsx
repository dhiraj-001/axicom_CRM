import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-5 text-center text-muted">Loading workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="p-5 text-center">
        <div className="text-danger fs-1 mb-2"><i className="bi bi-shield-x"></i></div>
        <h3>Access Denied</h3>
        <p className="text-muted">You do not have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

