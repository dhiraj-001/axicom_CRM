import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    opportunityName: '',
    customer: '',
    amount: '',
    stage: 'Qualification',
    probability: 20,
    expectedCloseDate: '',
    source: '',
    notes: '',
    assignedTo: ''
  });

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/opportunities?search=${search}&stage=${stage}&status=${status}&page=${page}&limit=10`
      );
      setOpportunities(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [custRes, userRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/users').catch(() => ({ data: { data: [] } }))
      ]);
      setCustomers(custRes.data.data);
      setUsers(userRes.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [page, stage, status]);

  useEffect(() => {
    loadDependencies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (Number(formData.amount) <= 0) {
      setFormError('Amount must be greater than 0.');
      return;
    }

    if (formData.stage !== 'Won' && formData.stage !== 'Lost') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(formData.expectedCloseDate) < today) {
        setFormError('Expected Close Date cannot be in the past.');
        return;
      }
    }

    try {
      await api.post('/opportunities', formData);
      setShowModal(false);
      setFormData({
        opportunityName: '',
        customer: '',
        amount: '',
        stage: 'Qualification',
        probability: 20,
        expectedCloseDate: '',
        source: '',
        notes: '',
        assignedTo: ''
      });
      fetchOpportunities();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating opportunity.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete opportunity '${name}'?`)) {
      try {
        await api.delete(`/opportunities/${id}`);
        fetchOpportunities();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting opportunity');
      }
    }
  };

  const getStageBadge = (st) => {
    switch (st) {
      case 'Qualification': return 'badge bg-secondary';
      case 'Proposal': return 'badge bg-info text-dark';
      case 'Negotiation': return 'badge bg-warning text-dark';
      case 'Won': return 'badge bg-success';
      case 'Lost': return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Sales Opportunities</h2>
          <p className="text-muted mb-0">Manage deals, track probabilities, and drive revenue.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/opportunities/pipeline" className="btn btn-outline-primary">
            <i className="bi bi-kanban me-1"></i> Kanban Pipeline
          </Link>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle me-1"></i> New Opportunity
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search opportunity name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={stage}
                onChange={(e) => { setStage(e.target.value); setPage(1); }}
              >
                <option value="">All Stages</option>
                <option value="Qualification">Qualification</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">Filter</button>
              {(search || stage || status) && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearch('');
                    setStage('');
                    setStatus('');
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
                  <th className="ps-3">Opportunity Name</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Probability</th>
                  <th>Expected Close</th>
                  <th>Owner</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Loading opportunities...
                    </td>
                  </tr>
                ) : opportunities.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No opportunities found.
                    </td>
                  </tr>
                ) : (
                  opportunities.map((opp) => (
                    <tr key={opp._id}>
                      <td className="ps-3 fw-semibold text-primary">{opp.opportunityName}</td>
                      <td>
                        {opp.customer ? (
                          <Link to={`/customers/${opp.customer._id}`} className="text-decoration-none">
                            {opp.customer.customerName}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="fw-bold">₹{Number(opp.amount).toLocaleString()}</td>
                      <td><span className={getStageBadge(opp.stage)}>{opp.stage}</span></td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px', width: '60px' }}>
                            <div
                              className="progress-bar bg-info"
                              role="progressbar"
                              style={{ width: `${opp.probability}%` }}
                            ></div>
                          </div>
                          <span className="small text-muted">{opp.probability}%</span>
                        </div>
                      </td>
                      <td className="small">{new Date(opp.expectedCloseDate).toLocaleDateString()}</td>
                      <td className="small">{opp.assignedTo?.name || 'Unassigned'}</td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(opp._id, opp.opportunityName)}
                          title="Delete Opportunity"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
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
              <form onSubmit={handleCreate}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">New Sales Opportunity</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Opportunity Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.opportunityName}
                        onChange={(e) => setFormData({ ...formData, opportunityName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Customer Account *</label>
                      <select
                        className="form-select"
                        required
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      >
                        <option value="">Select Customer</option>
                        {customers.map(c => (
                          <option key={c._id} value={c._id}>{c.customerName} ({c.customerCode})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Amount (₹) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Expected Close Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={formData.expectedCloseDate}
                        onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Pipeline Stage</label>
                      <select
                        className="form-select"
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      >
                        <option value="Qualification">Qualification</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Win Probability (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Lead Source</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Website, Partner"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      />
                    </div>
                    {users.length > 0 && (
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Assigned Owner</label>
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
                      <label className="form-label small fw-bold">Notes</label>
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Opportunity</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;

