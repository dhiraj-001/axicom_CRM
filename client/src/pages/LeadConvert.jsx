import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const LeadConvert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    createOpportunity: true,
    opportunityName: '',
    opportunityAmount: '',
    stage: 'Qualification',
    probability: 30,
    expectedCloseDate: ''
  });

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await api.get(`/leads/${id}`);
        const l = res.data.data.lead;
        setLead(l);
        if (l.status === 'Converted') {
          setError('This lead has already been converted.');
        }

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const yyyy = futureDate.getFullYear();
        const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
        const dd = String(futureDate.getDate()).padStart(2, '0');

        setFormData({
          customerName: l.companyName || l.leadName,
          createOpportunity: true,
          opportunityName: `${l.leadName} Deal`,
          opportunityAmount: l.expectedValue || 50000,
          stage: 'Qualification',
          probability: 30,
          expectedCloseDate: `${yyyy}-${mm}-${dd}`
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading lead.');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/leads/${id}/convert`, formData);
      const custId = res.data.data.customer._id;
      navigate(`/customers/${custId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert lead.');
      setSubmitting(false);
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

  return (
    <div className="container-fluid max-w-750" style={{ maxWidth: '750px' }}>
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item"><Link to="/leads">Leads</Link></li>
            <li className="breadcrumb-item"><Link to={`/leads/${id}`}>{lead?.leadCode}</Link></li>
            <li className="breadcrumb-item active">Convert</li>
          </ol>
        </nav>
        <h2 className="fw-bold">Convert Lead to Customer</h2>
        <p className="text-muted">
          Promote this lead into an official Customer Account and optionally create an associated Pipeline Opportunity.
        </p>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light py-3">
          <h6 className="fw-bold mb-0">Lead Summary</h6>
        </div>
        <div className="card-body">
          <div className="row g-2 small">
            <div className="col-sm-6">
              <span className="text-muted">Lead Name:</span> <span className="fw-semibold">{lead?.leadName}</span>
            </div>
            <div className="col-sm-6">
              <span className="text-muted">Company:</span> <span className="fw-semibold">{lead?.companyName || 'N/A'}</span>
            </div>
            <div className="col-sm-6">
              <span className="text-muted">Email:</span> <span className="fw-semibold">{lead?.email}</span>
            </div>
            <div className="col-sm-6">
              <span className="text-muted">Phone:</span> <span className="fw-semibold">{lead?.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="fw-bold mb-0">Customer Account Details</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-bold small">Customer Account Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
              <div className="form-text">
                Existing customers with matching email/phone will be linked automatically.
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Sales Opportunity</h5>
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="createOppCheck"
                checked={formData.createOpportunity}
                onChange={(e) => setFormData({ ...formData, createOpportunity: e.target.checked })}
              />
              <label className="form-check-label small fw-bold" htmlFor="createOppCheck">
                Create Opportunity
              </label>
            </div>
          </div>
          {formData.createOpportunity && (
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Opportunity Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required={formData.createOpportunity}
                    value={formData.opportunityName}
                    onChange={(e) => setFormData({ ...formData, opportunityName: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Deal Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    required={formData.createOpportunity}
                    value={formData.opportunityAmount}
                    onChange={(e) => setFormData({ ...formData, opportunityAmount: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Initial Stage</label>
                  <select
                    className="form-select"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  >
                    <option value="Qualification">Qualification</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Expected Close Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end gap-2 mb-5">
          <Link to={`/leads/${id}`} className="btn btn-outline-secondary">Cancel</Link>
          <button
            type="submit"
            className="btn btn-success px-4"
            disabled={submitting || lead?.status === 'Converted'}
          >
            {submitting ? 'Converting...' : 'Complete Conversion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadConvert;

