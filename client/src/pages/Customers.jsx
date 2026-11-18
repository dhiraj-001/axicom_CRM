import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}&status=${status}&page=${page}&limit=10`);
      setCustomers(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        companyName: '',
        address: '',
        city: '',
        state: '',
        status: 'Active'
      });
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save customer.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer '${name}'?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting customer');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Customer Accounts</h4>
          <p className="text-muted small mb-0">Client master database, company contacts, and engagement histories</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i> Add Customer
        </button>
      </div>

      <div className="crm-card">
        <div className="crm-card-header">
          <form onSubmit={handleSearchSubmit} className="row g-2 w-100 align-items-center">
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name, code, phone, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select form-select-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <button type="submit" className="btn btn-secondary btn-sm w-100">Filter</button>
            </div>
          </form>
        </div>

        <div className="crm-card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Customer Name</th>
                  <th>Contact</th>
                  <th>Company</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">Loading customer records...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">No customers found.</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c._id}>
                      <td><span className="badge bg-light text-dark border">{c.customerCode}</span></td>
                      <td className="fw-semibold">
                        <Link to={`/customers/${c._id}`} className="text-decoration-none text-dark">{c.customerName}</Link>
                      </td>
                      <td>
                        <div className="small"><i className="bi bi-envelope text-muted me-1"></i>{c.email}</div>
                        <div className="small text-muted"><i className="bi bi-telephone text-muted me-1"></i>{c.phone}</div>
                      </td>
                      <td>{c.companyName || '—'}</td>
                      <td>{c.city || '—'}</td>
                      <td>
                        <span className={`badge ${c.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{c.status}</span>
                      </td>
                      <td className="small text-muted">{c.createdBy?.name || 'System'}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link to={`/customers/${c._id}`} className="btn btn-outline-secondary" title="View Details">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button onClick={() => handleDelete(c._id, c.customerName)} className="btn btn-outline-danger" title="Delete">
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
          <div className="crm-card-header justify-content-end">
            <ul className="pagination pagination-sm mb-0">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                  <button onClick={() => setPage(p)} className="page-link">{p}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Customer Record</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCustomer}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Customer Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Phone (10 digits starting with 6-9) *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Office Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Customer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

