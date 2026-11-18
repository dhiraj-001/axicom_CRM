import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const LeadDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpData, setFollowUpData] = useState({
    title: '',
    followUpDate: '',
    followUpType: 'Call',
    priority: 'Medium',
    notes: ''
  });

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState({
    activityType: 'Call',
    subject: '',
    description: '',
    durationMinutes: 15
  });

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leads/${id}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    try {
      await api.post('/followups', {
        subject: followUpData.title,
        remarks: followUpData.notes,
        followUpDate: followUpData.followUpDate,
        followUpType: followUpData.followUpType,
        lead: id
      });
      setShowFollowUpModal(false);
      setFollowUpData({
        title: '',
        followUpDate: '',
        followUpType: 'Call',
        priority: 'Medium',
        notes: ''
      });
      fetchLeadDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule follow-up');
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activities', { ...activityData, lead: id });
      setShowActivityModal(false);
      setActivityData({
        activityType: 'Call',
        subject: '',
        description: '',
        durationMinutes: 15
      });
      fetchLeadDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log activity');
    }
  };

  const handleCompleteFollowUp = async (fId) => {
    try {
      await api.put(`/followups/${fId}`, { status: 'Completed' });
      fetchLeadDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update follow-up');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Loading lead details...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger">
        <h5>Error</h5>
        <p>{error || 'Lead not found.'}</p>
        <Link to="/leads" className="btn btn-sm btn-outline-danger">Back to Leads</Link>
      </div>
    );
  }

  const { lead, followUps, activities } = data;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item"><Link to="/leads">Leads</Link></li>
              <li className="breadcrumb-item active">{lead.leadCode}</li>
            </ol>
          </nav>
          <h2 className="fw-bold mb-0">{lead.leadName}</h2>
        </div>
        <div className="d-flex gap-2">
          {lead.status !== 'Converted' && (
            <Link to={`/leads/${lead._id}/convert`} className="btn btn-success">
              <i className="bi bi-arrow-repeat me-1"></i> Convert Lead
            </Link>
          )}
          <Link to="/leads" className="btn btn-outline-secondary">
            Back to List
          </Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">Lead Profile</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="text-muted small d-block">Status</label>
                <span className="badge bg-primary fs-6">{lead.status}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Priority</label>
                <span className="badge bg-warning text-dark">{lead.priority}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Source</label>
                <span className="fw-semibold">{lead.source}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Email</label>
                <a href={`mailto:${lead.email}`} className="text-decoration-none">{lead.email}</a>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Phone</label>
                <span className="fw-semibold">{lead.phone}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Company</label>
                <span className="fw-semibold">{lead.companyName || '-'}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Expected Value</label>
                <span className="fw-bold text-success fs-5">
                  ₹{Number(lead.expectedValue || 0).toLocaleString()}
                </span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Assigned To</label>
                <span>{lead.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Created On</label>
                <span className="small text-muted">{new Date(lead.createdDate).toLocaleDateString()}</span>
              </div>
              {lead.convertedCustomer && (
                <div className="p-3 bg-light rounded mt-3 border">
                  <div className="small text-success fw-bold">Converted Customer:</div>
                  <Link to={`/customers/${lead.convertedCustomer._id}`} className="fw-semibold text-decoration-none">
                    {lead.convertedCustomer.customerName} ({lead.convertedCustomer.customerCode})
                  </Link>
                </div>
              )}
            </div>
          </div>

          {lead.notes && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0">Notes</h6>
              </div>
              <div className="card-body">
                <p className="mb-0 text-muted small">{lead.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Scheduled Follow-Ups</h5>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setShowFollowUpModal(true)}>
                <i className="bi bi-calendar-plus me-1"></i> Add Follow-Up
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Title</th>
                      <th>Type</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                      <th className="text-end pe-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {followUps && followUps.length > 0 ? (
                      followUps.map((f) => (
                        <tr key={f._id}>
                          <td className="ps-3">
                            <div className="fw-semibold">{f.subject || f.title}</div>
                            {(f.remarks || f.notes) && <div className="small text-muted">{f.remarks || f.notes}</div>}
                          </td>
                          <td><span className="badge bg-light text-dark border">{f.followUpType}</span></td>
                          <td>{new Date(f.followUpDate).toLocaleString()}</td>
                          <td>
                            <span className={f.status === 'Completed' ? 'badge bg-success' : 'badge bg-warning text-dark'}>
                              {f.status}
                            </span>
                          </td>
                          <td className="text-end pe-3">
                            {f.status !== 'Completed' && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleCompleteFollowUp(f._id)}
                              >
                                Mark Done
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No follow-ups scheduled for this lead.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Activity History</h5>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setShowActivityModal(true)}>
                <i className="bi bi-clock-history me-1"></i> Log Activity
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Type</th>
                      <th>Subject</th>
                      <th>Duration</th>
                      <th>Logged By</th>
                      <th className="text-end pe-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities && activities.length > 0 ? (
                      activities.map((a) => (
                        <tr key={a._id}>
                          <td className="ps-3">
                            <span className="badge bg-secondary">{a.activityType}</span>
                          </td>
                          <td>
                            <div className="fw-semibold">{a.subject}</div>
                            {a.description && <div className="small text-muted">{a.description}</div>}
                          </td>
                          <td>{a.durationMinutes} mins</td>
                          <td>{a.assignedTo?.name || 'Self'}</td>
                          <td className="text-end pe-3 small text-muted">
                            {new Date(a.activityDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No activities logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFollowUpModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateFollowUp}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Schedule Follow-Up</h5>
                  <button type="button" className="btn-close" onClick={() => setShowFollowUpModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject / Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={followUpData.title}
                      onChange={(e) => setFollowUpData({ ...followUpData, title: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Type</label>
                      <select
                        className="form-select"
                        value={followUpData.followUpType}
                        onChange={(e) => setFollowUpData({ ...followUpData, followUpType: e.target.value })}
                      >
                        <option value="Call">Call</option>
                        <option value="Email">Email</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Demo">Demo</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Priority</label>
                      <select
                        className="form-select"
                        value={followUpData.priority}
                        onChange={(e) => setFollowUpData({ ...followUpData, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      required
                      value={followUpData.followUpDate}
                      onChange={(e) => setFollowUpData({ ...followUpData, followUpDate: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={followUpData.notes}
                      onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowFollowUpModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Schedule</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showActivityModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateActivity}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Log Activity</h5>
                  <button type="button" className="btn-close" onClick={() => setShowActivityModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Activity Type</label>
                    <select
                      className="form-select"
                      value={activityData.activityType}
                      onChange={(e) => setActivityData({ ...activityData, activityType: e.target.value })}
                    >
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Email">Email</option>
                      <option value="Task">Task</option>
                      <option value="Note">Note</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={activityData.subject}
                      onChange={(e) => setActivityData({ ...activityData, subject: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={activityData.durationMinutes}
                      onChange={(e) => setActivityData({ ...activityData, durationMinutes: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description / Summary</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={activityData.description}
                      onChange={(e) => setActivityData({ ...activityData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowActivityModal(false)}>Cancel</button>
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

export default LeadDetails;
