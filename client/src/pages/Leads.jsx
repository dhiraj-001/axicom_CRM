import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leadName: '',
    email: '',
    phone: '',
    companyName: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    expectedValue: '',
    notes: '',
    assignedTo: ''
  });
  const [formError, setFormError] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/leads?search=${search}&status=${status}&source=${source}&priority=${priority}&page=${page}&limit=10`
      );
      setLeads(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      // not admin/manager or error
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, status, source, priority]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.leadName || !formData.email || !formData.phone) {
      setFormError('Lead name, email, and phone number are required.');
      return;
    }

    try {
      await api.post('/leads', formData);
      setShowModal(false);
      setFormData({
        leadName: '',
        email: '',
        phone: '',
        companyName: '',
        source: 'Website',
        status: 'New',
        priority: 'Medium',
        expectedValue: '',
        notes: '',
        assignedTo: ''
      });
      fetchLeads();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating lead');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete lead '${name}'?`)) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting lead');
      }
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'New': return 'badge bg-info text-dark';
      case 'Contacted': return 'badge bg-primary';
      case 'Qualified': return 'badge bg-warning text-dark';
      case 'Converted': return 'badge bg-success';
      case 'Lost': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const getPriorityBadge = (pr) => {
    switch (pr) {
      case 'High': return 'badge bg-danger';
      case 'Medium': return 'badge bg-warning text-dark';
      case 'Low': return 'badge bg-secondary';
      default: return 'badge bg-light text-dark';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Leads Management</h2>
          <p className="text-muted mb-0">Track prospect lifecycles from initial contact to conversion.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus-fill me-1"></i> Add New Lead
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search name, code, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={source}
                onChange={(e) => { setSource(e.target.value); setPage(1); }}
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Partner">Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={priority}
                onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">
                <i className="bi bi-search me-1"></i> Search
              </button>
              {(search || status || source || priority) && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                    setSource('');
                    setPriority('');
                    setPage(1);
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Lead Code</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Source</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No leads found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l._id}>
                      <td className="ps-3 fw-bold text-primary">{l.leadCode}</td>
                      <td>
                        <Link to={`/leads/${l._id}`} className="text-decoration-none fw-semibold">
                          {l.leadName}
                        </Link>
                      </td>
                      <td>{l.companyName || '-'}</td>
                      <td>
                        <div className="small">{l.email}</div>
                        <div className="small text-muted">{l.phone}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{l.source}</span></td>
                      <td><span className={getPriorityBadge(l.priority)}>{l.priority}</span></td>
                      <td><span className={getStatusBadge(l.status)}>{l.status}</span></td>
                      <td className="small">{l.assignedTo?.name || 'Unassigned'}</td>
                      <td className="text-end pe-3">
                        <div className="btn-group btn-group-sm">
                          <Link to={`/leads/${l._id}`} className="btn btn-outline-secondary" title="View Details">
                            <i className="bi bi-eye"></i>
                          </Link>
                          {l.status !== 'Converted' && (
                            <Link to={`/leads/${l._id}/convert`} className="btn btn-outline-success" title="Convert to Customer/Deal">
                              <i className="bi bi-arrow-repeat"></i>
                            </Link>
                          )}
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(l._id, l.leadName)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
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
            <span className="small text-muted">Page {page} of {totalPages}</span>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCreateLead}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">New Lead Registration</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Lead Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.leadName}
                        onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Phone Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Lead Source</label>
                      <select
                        className="form-select"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      >
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Advertisement">Advertisement</option>
                        <option value="Partner">Partner</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Initial Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Estimated Deal Value (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 50000"
                        value={formData.expectedValue}
                        onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                      />
                    </div>
                    {users.length > 0 && (
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Assign Executive</label>
                        <select
                          className="form-select"
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        >
                          <option value="">Assign to Me (Default)</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label small fw-bold">Notes / Requirements</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;

