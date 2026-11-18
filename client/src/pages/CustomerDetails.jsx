import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const CustomerDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading || !data) {
    return <div className="text-center py-5 text-muted">Loading customer profile...</div>;
  }

  const { customer, opportunities, followUps, activities } = data;

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold mb-0">{customer.customerName}</h4>
            <span className="badge bg-light text-dark border">{customer.customerCode}</span>
            <span className={`badge ${customer.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{customer.status}</span>
          </div>
          <p className="text-muted small mb-0 mt-1">Client Profile</p>
        </div>
        <Link to="/customers" className="btn btn-outline-secondary btn-sm">Back to Customers</Link>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="crm-card">
            <div className="crm-card-header">Company Details</div>
            <div className="crm-card-body">
              <div className="mb-3">
                <div className="small text-muted">Legal / Firm Name</div>
                <div className="fw-semibold">{customer.companyName || '—'}</div>
              </div>
              <div className="mb-3">
                <div className="small text-muted">Official Email</div>
                <div className="fw-semibold">{customer.email}</div>
              </div>
              <div className="mb-3">
                <div className="small text-muted">Contact Phone</div>
                <div className="fw-semibold">{customer.phone}</div>
              </div>
              <div className="mb-3">
                <div className="small text-muted">Location</div>
                <div>{customer.city ? `${customer.city}, ${customer.state}` : '—'}</div>
              </div>
              <div>
                <div className="small text-muted">Account Owner</div>
                <div className="fw-semibold">{customer.createdBy?.name || 'System'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="crm-card">
            <div className="crm-card-header">Commercial Deals ({opportunities.length})</div>
            <div className="crm-card-body p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Deal Name</th>
                    <th>Amount</th>
                    <th>Stage</th>
                    <th>Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-3 text-muted">No opportunities registered.</td></tr>
                  ) : (
                    opportunities.map(o => (
                      <tr key={o._id}>
                        <td className="fw-semibold">{o.opportunityName}</td>
                        <td className="fw-bold">₹{o.amount.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${o.stage === 'Won' ? 'bg-success' : o.stage === 'Lost' ? 'bg-danger' : 'bg-primary'}`}>
                            {o.stage}
                          </span>
                        </td>
                        <td>{o.probability}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="crm-card">
            <div className="crm-card-header">Follow-Up Engagements ({followUps.length})</div>
            <div className="crm-card-body p-0">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {followUps.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-3 text-muted">No follow-ups recorded.</td></tr>
                  ) : (
                    followUps.map(f => (
                      <tr key={f._id}>
                        <td>{new Date(f.followUpDate).toLocaleDateString()}</td>
                        <td><span className="badge bg-light text-dark border">{f.followUpType}</span></td>
                        <td className="fw-semibold">{f.subject}</td>
                        <td>
                          <span className={`badge ${f.status === 'Completed' ? 'bg-success' : 'bg-secondary'}`}>{f.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;

