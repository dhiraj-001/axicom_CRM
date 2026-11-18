import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Reports = () => {
  const [pipelineData, setPipelineData] = useState(null);
  const [conversionData, setConversionData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [pipeRes, convRes] = await Promise.all([
        api.get('/reports/pipeline'),
        api.get('/reports/conversion')
      ]);
      setPipelineData(pipeRes.data.data);
      setConversionData(convRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadPipelineCSV = () => {
    window.open('/api/reports/pipeline?format=csv', '_blank');
  };

  const downloadConversionCSV = () => {
    window.open('/api/reports/conversion?format=csv', '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Generating business reports...</div>
      </div>
    );
  }

  const { stageReport = [], ownerReport = [] } = pipelineData || {};

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Reports & Analytics</h2>
          <p className="text-muted mb-0">Sales intelligence, funnel metrics, and executive pipeline summaries.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Pipeline Stage Distribution</h5>
              <button className="btn btn-sm btn-outline-success" onClick={downloadPipelineCSV}>
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Stage</th>
                      <th className="text-center">Deals</th>
                      <th className="text-end">Total Amount</th>
                      <th className="text-end pe-3">Weighted Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageReport.map((r) => (
                      <tr key={r.stage}>
                        <td className="ps-3 fw-semibold">{r.stage}</td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border">{r.count}</span>
                        </td>
                        <td className="text-end fw-bold">₹{Number(r.totalAmount).toLocaleString()}</td>
                        <td className="text-end pe-3 text-muted">
                          ₹{Math.round(r.weightedAmount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Sales Performance by Owner</h5>
              <button className="btn btn-sm btn-outline-success" onClick={downloadPipelineCSV}>
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Owner</th>
                      <th className="text-center">Deals</th>
                      <th className="text-end">Booked Pipeline</th>
                      <th className="text-end pe-3">Weighted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerReport.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          No owner metrics available.
                        </td>
                      </tr>
                    ) : (
                      ownerReport.map((o) => (
                        <tr key={o.ownerName}>
                          <td className="ps-3 fw-semibold">{o.ownerName}</td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark border">{o.count}</span>
                          </td>
                          <td className="text-end fw-bold text-success">
                            ₹{Number(o.totalAmount).toLocaleString()}
                          </td>
                          <td className="text-end pe-3 text-muted">
                            ₹{Math.round(o.weightedAmount).toLocaleString()}
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

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Lead Conversion Rates by Acquisition Source</h5>
          <button className="btn btn-sm btn-outline-success" onClick={downloadConversionCSV}>
            <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Acquisition Channel</th>
                  <th className="text-center">Total Inbound</th>
                  <th className="text-center">Converted</th>
                  <th className="text-center">Lost / Disqualified</th>
                  <th className="text-end pe-3">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {conversionData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No lead sources recorded yet.
                    </td>
                  </tr>
                ) : (
                  conversionData.map((c) => (
                    <tr key={c.source}>
                      <td className="ps-3 fw-bold">{c.source}</td>
                      <td className="text-center">{c.totalLeads}</td>
                      <td className="text-center text-success fw-bold">{c.convertedCount}</td>
                      <td className="text-center text-danger">{c.lostCount}</td>
                      <td className="text-end pe-3">
                        <span
                          className={`badge fs-6 ${
                            c.conversionRate >= 30
                              ? 'bg-success'
                              : c.conversionRate >= 15
                              ? 'bg-info text-dark'
                              : 'bg-secondary'
                          }`}
                        >
                          {c.conversionRate}%
                        </span>
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
  );
};

export default Reports;

