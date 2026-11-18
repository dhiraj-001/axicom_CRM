import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userQuery, setUserQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [availableModules, setAvailableModules] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/audit-logs?user=${userQuery}&module=${selectedModule}&action=${selectedAction}&fromDate=${fromDate}&toDate=${toDate}&page=${page}&limit=15`
      );
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages);
      if (res.data.filters) {
        setAvailableModules(res.data.filters.modules || []);
        setAvailableActions(res.data.filters.actions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedModule, selectedAction]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setUserQuery('');
    setSelectedModule('');
    setSelectedAction('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const getActionBadge = (act) => {
    switch (act) {
      case 'Create': return 'badge bg-success';
      case 'Update': return 'badge bg-primary';
      case 'Delete': return 'badge bg-danger';
      case 'Login': return 'badge bg-info text-dark';
      case 'Failed Login': return 'badge bg-danger';
      case 'Account Lockout': return 'badge bg-dark';
      case 'Lead Conversion': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Security Audit Trail</h2>
          <p className="text-muted mb-0">Immutable compliance logs tracking user operations and security events.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search user or record..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={selectedModule}
                onChange={(e) => { setSelectedModule(e.target.value); setPage(1); }}
              >
                <option value="">All Modules</option>
                {availableModules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={selectedAction}
                onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
              >
                <option value="">All Actions</option>
                {availableActions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From date"
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To date"
              />
            </div>
            <div className="col-md-1 d-flex gap-1">
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
          {(userQuery || selectedModule || selectedAction || fromDate || toDate) && (
            <div className="mt-2 text-end">
              <button className="btn btn-sm btn-link text-decoration-none" onClick={handleReset}>
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 font-monospace small">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Timestamp</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th className="pe-3">Details / Changes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 font-sans-serif">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Loading audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted font-sans-serif">
                      No audit logs match current filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className="ps-3 text-nowrap">
                        {new Date(log.createdDate).toLocaleString()}
                      </td>
                      <td>
                        <span className={getActionBadge(log.action)}>{log.action}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{log.entityName}</span>
                      </td>
                      <td className="fw-bold">{log.userName || 'System'}</td>
                      <td>{log.ipAddress || '127.0.0.1'}</td>
                      <td className="pe-3 text-break">
                        {log.details || (
                          <div>
                            {log.oldValues && <span className="text-muted">Prev: {log.oldValues} </span>}
                            {log.newValues && <span className="text-primary">New: {log.newValues}</span>}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <span className="small text-muted font-sans-serif">Page {page} of {totalPages}</span>
            <div className="btn-group font-sans-serif">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;

