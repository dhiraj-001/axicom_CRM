import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SalesExecutive',
    isActive: true
  });
  const [createError, setCreateError] = useState('');

  // Reset Password Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await api.post('/users', createForm);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'SalesExecutive',
        isActive: true
      });
      fetchUsers();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/toggle-lock`);
      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle account lock status');
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await api.post(`/users/${selectedUser._id}/reset-password`, { newPassword });
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('Password reset successfully.');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return 'badge bg-danger';
      case 'Manager': return 'badge bg-warning text-dark';
      case 'SalesExecutive': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">User & Role Management</h2>
          <p className="text-muted mb-0">Manage system operators, assign access privileges, and unlock accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-person-plus-fill me-1"></i> Create User
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Lockout</th>
                  <th>Last Login</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isLocked = u.lockoutEnd && new Date(u.lockoutEnd) > new Date();
                    return (
                      <tr key={u._id}>
                        <td className="ps-3 fw-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={getRoleBadge(u.role)}>{u.role}</span></td>
                        <td>
                          <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {isLocked ? (
                            <span className="badge bg-danger">Locked</span>
                          ) : (
                            <span className="badge bg-light text-dark border">Unlocked</span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {u.lastLoginDate ? new Date(u.lastLoginDate).toLocaleString() : 'Never'}
                        </td>
                        <td className="text-end pe-3">
                          <div className="btn-group btn-group-sm">
                            <button
                              className={`btn btn-outline-${isLocked ? 'success' : 'warning'}`}
                              onClick={() => handleToggleLock(u._id)}
                              title={isLocked ? 'Unlock Account' : 'Lock Account'}
                            >
                              <i className={`bi bi-${isLocked ? 'unlock-fill' : 'lock-fill'}`}></i>
                            </button>
                            <button
                              className="btn btn-outline-info"
                              onClick={() => {
                                setSelectedUser(u);
                                setNewPassword('');
                                setResetError('');
                                setShowResetModal(true);
                              }}
                              title="Reset Password"
                            >
                              <i className="bi bi-key-fill"></i>
                            </button>
                            <button
                              className={`btn btn-outline-${u.isActive ? 'secondary' : 'success'}`}
                              onClick={() => handleToggleActive(u)}
                              title={u.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              <i className={`bi bi-${u.isActive ? 'person-dash' : 'person-check'}`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateUser}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Create System User</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <div className="modal-body">
                  {createError && <div className="alert alert-danger py-2">{createError}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Initial Password * (min 8 characters)</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      minLength={8}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Role *</label>
                    <select
                      className="form-select"
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    >
                      <option value="SalesExecutive">Sales Executive</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showResetModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleResetPassword}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Reset Password</h5>
                  <button type="button" className="btn-close" onClick={() => setShowResetModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted small">
                    Resetting password for: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                  </p>
                  {resetError && <div className="alert alert-danger py-2">{resetError}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">New Password * (min 8 characters)</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Password</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

