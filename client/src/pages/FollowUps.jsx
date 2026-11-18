import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    followUpType: 'Call',
    followUpDate: '',
    relatedTo: 'customer',
    customerId: '',
    leadId: '',
    remarks: ''
  });

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      let queryUrl = `/followups?page=${page}&limit=10`;
      if (activeTab !== 'all') {
        queryUrl += `&filter=${activeTab}`;
      }
      if (type) {
        queryUrl += `&type=${type}`;
      }

      const res = await api.get(queryUrl);
      setFollowUps(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      const [custRes, leadRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/leads?limit=100')
      ]);
      setCustomers(custRes.data.data);
      setLeads(leadRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [activeTab, type, page]);

  useEffect(() => {
    loadEntities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(formData.followUpDate) < today) {
      setFormError('Follow-up date cannot be earlier than today.');
      return;
    }

    const payload = {
      subject: formData.subject,
      followUpType: formData.followUpType,
      followUpDate: formData.followUpDate,
      remarks: formData.remarks,
      customer: formData.relatedTo === 'customer' ? formData.customerId : null,
      lead: formData.relatedTo === 'lead' ? formData.leadId : null
    };

    try {
      await api.post('/followups', payload);
      setShowModal(false);
      setFormData({
        subject: '',
        followUpType: 'Call',
        followUpDate: '',
        relatedTo: 'customer',
        customerId: '',
        leadId: '',
        remarks: ''
      });
      fetchFollowUps();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create follow-up.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/followups/${id}`, { status: 'Completed' });
      fetchFollowUps();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const isOverdue = (date, status) => {
    if (status === 'Completed') return false;
    return new Date(date) < new Date();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Follow-Ups & Reminders</h2>
          <p className="text-muted mb-0">Never miss client interactions, calls, or deadlines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-calendar-plus me-1"></i> Schedule Follow-Up
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => { setActiveTab('upcoming'); setPage(1); }}
              >
                Upcoming
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overdue' ? 'active' : ''}`}
                onClick={() => { setActiveTab('overdue'); setPage(1); }}
              >
                Overdue
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => { setActiveTab('completed'); setPage(1); }}
              >
                Completed
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveTab('all'); setPage(1); }}
              >
                All
              </button>
            </li>
          </ul>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select form-select-sm"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="Call">Call</option>
              <option value="Meeting">Meeting</option>
              <option value="Email">Email</option>
              <option value="Task">Task</option>
            </select>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Subject</th>
                  <th>Related To</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Loading follow-ups...
                    </td>
                  </tr>
                ) : followUps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No follow-ups found for this tab.
                    </td>
                  </tr>
                ) : (
                  followUps.map((item) => {
                    const overdue = isOverdue(item.followUpDate, item.status);
                    return (
                      <tr key={item._id} className={overdue ? 'table-danger' : ''}>
                        <td className="ps-3">
                          <div className="fw-bold">{item.subject}</div>
                          {item.remarks && <small className="text-muted">{item.remarks}</small>}
                        </td>
                        <td>
                          {item.customer && (
                            <span className="badge bg-light text-dark border">
                              Customer: {item.customer.customerName}
                            </span>
                          )}
                          {item.lead && (
                            <span className="badge bg-light text-dark border">
                              Lead: {item.lead.leadName}
                            </span>
                          )}
                          {!item.customer && !item.lead && '-'}
                        </td>
                        <td>
                          <span className="badge bg-secondary">{item.followUpType}</span>
                        </td>
                        <td>
                          <div className={overdue ? 'text-danger fw-bold' : ''}>
                            {new Date(item.followUpDate).toLocaleString()}
                          </div>
                          {overdue && <small className="badge bg-danger">OVERDUE</small>}
                        </td>
                        <td className="small">{item.assignedTo?.name || 'Self'}</td>
                        <td>
                          <span className={`badge ${item.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          {item.status !== 'Completed' && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleComplete(item._id)}
                            >
                              <i className="bi bi-check-lg me-1"></i> Mark Done
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
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

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreate}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Schedule Follow-Up</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject / Purpose *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Follow-Up Type</label>
                      <select
                        className="form-select"
                        value={formData.followUpType}
                        onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
                      >
                        <option value="Call">Call</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Email">Email</option>
                        <option value="Task">Task</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        required
                        value={formData.followUpDate}
                        onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Relate To</label>
                    <div className="d-flex gap-3 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="relCustomer"
                          name="relatedTo"
                          checked={formData.relatedTo === 'customer'}
                          onChange={() => setFormData({ ...formData, relatedTo: 'customer', leadId: '' })}
                        />
                        <label className="form-check-label small" htmlFor="relCustomer">Customer</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="relLead"
                          name="relatedTo"
                          checked={formData.relatedTo === 'lead'}
                          onChange={() => setFormData({ ...formData, relatedTo: 'lead', customerId: '' })}
                        />
                        <label className="form-check-label small" htmlFor="relLead">Lead</label>
                      </div>
                    </div>

                    {formData.relatedTo === 'customer' ? (
                      <select
                        className="form-select"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      >
                        <option value="">Select Customer (Optional)</option>
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>{c.customerName}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        className="form-select"
                        value={formData.leadId}
                        onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                      >
                        <option value="">Select Lead (Optional)</option>
                        {leads.map((l) => (
                          <option key={l._id} value={l._id}>{l.leadName}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Remarks / Agenda</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Schedule</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;

