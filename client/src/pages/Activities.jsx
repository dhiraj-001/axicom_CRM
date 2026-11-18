import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    activityType: 'Call',
    description: '',
    activityDate: new Date().toISOString().slice(0, 16),
    relatedTo: 'customer',
    customerId: '',
    leadId: ''
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/activities?type=${type}&status=${status}&page=${page}&limit=10`);
      setActivities(res.data.data);
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
    fetchActivities();
  }, [type, status, page]);

  useEffect(() => {
    loadEntities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.subject) {
      setFormError('Subject is required.');
      return;
    }

    const payload = {
      subject: formData.subject,
      activityType: formData.activityType,
      description: formData.description,
      activityDate: formData.activityDate,
      customer: formData.relatedTo === 'customer' ? formData.customerId : null,
      lead: formData.relatedTo === 'lead' ? formData.leadId : null
    };

    try {
      await api.post('/activities', payload);
      setShowModal(false);
      setFormData({
        subject: '',
        activityType: 'Call',
        description: '',
        activityDate: new Date().toISOString().slice(0, 16),
        relatedTo: 'customer',
        customerId: '',
        leadId: ''
      });
      fetchActivities();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to log activity.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Activities Timeline</h2>
          <p className="text-muted mb-0">Record and review logs for phone calls, emails, client meetings, and tasks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-clock-history me-1"></i> Log Activity
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <select
                className="form-select"
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
              >
                <option value="">All Activity Types</option>
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
                <option value="Task">Task</option>
                <option value="Note">Note</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-4">
              {(type || status) && (
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => { setType(''); setStatus(''); setPage(1); }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Type</th>
                  <th>Subject</th>
                  <th>Entity</th>
                  <th>Logged By</th>
                  <th>Date & Time</th>
                  <th className="text-end pe-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      Loading activities...
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No activities found.
                    </td>
                  </tr>
                ) : (
                  activities.map((a) => (
                    <tr key={a._id}>
                      <td className="ps-3">
                        <span className="badge bg-secondary">{a.activityType}</span>
                      </td>
                      <td>
                        <div className="fw-semibold">{a.subject}</div>
                        {a.description && <small className="text-muted">{a.description}</small>}
                      </td>
                      <td>
                        {a.customer && (
                          <span className="badge bg-light text-dark border">
                            Customer: {a.customer.customerName}
                          </span>
                        )}
                        {a.lead && (
                          <span className="badge bg-light text-dark border">
                            Lead: {a.lead.leadName}
                          </span>
                        )}
                        {!a.customer && !a.lead && '-'}
                      </td>
                      <td className="small">{a.assignedTo?.name || 'Self'}</td>
                      <td className="small">{new Date(a.activityDate).toLocaleString()}</td>
                      <td className="text-end pe-3">
                        <span className="badge bg-success">{a.status}</span>
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
                  <h5 className="modal-title fw-bold">Log New Activity</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Discovery call regarding enterprise license"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Type</label>
                      <select
                        className="form-select"
                        value={formData.activityType}
                        onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                      >
                        <option value="Call">Call</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Email">Email</option>
                        <option value="Task">Task</option>
                        <option value="Note">Note</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.activityDate}
                        onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
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
                          id="actRelCust"
                          name="actRel"
                          checked={formData.relatedTo === 'customer'}
                          onChange={() => setFormData({ ...formData, relatedTo: 'customer', leadId: '' })}
                        />
                        <label className="form-check-label small" htmlFor="actRelCust">Customer</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="actRelLead"
                          name="actRel"
                          checked={formData.relatedTo === 'lead'}
                          onChange={() => setFormData({ ...formData, relatedTo: 'lead', customerId: '' })}
                        />
                        <label className="form-check-label small" htmlFor="actRelLead">Lead</label>
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
                    <label className="form-label small fw-bold">Description / Minutes of Discussion</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Activity</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;

