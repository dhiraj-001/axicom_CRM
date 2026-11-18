import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (filter) => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/dashboard?dateFilter=${filter}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(dateFilter);
  }, [dateFilter]);

  if (loading || !data) {
    return <div className="text-center py-5 text-muted">Loading executive dashboard...</div>;
  }

  const doughnutData = {
    labels: data.leadStatusLabels,
    datasets: [
      {
        data: data.leadStatusCounts,
        backgroundColor: ['#0284c7', '#38bdf8', '#10b981', '#ef4444', '#8b5cf6'],
        borderWidth: 2
      }
    ]
  };

  const barData = {
    labels: data.pipelineStageLabels,
    datasets: [
      {
        label: 'Stage Volume (₹)',
        data: data.pipelineStageAmounts,
        backgroundColor: '#2563eb',
        borderRadius: 4
      }
    ]
  };

  const lineData = {
    labels: data.monthlySalesLabels,
    datasets: [
      {
        label: 'Closed Revenue (₹)',
        data: data.monthlySalesValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.35
      }
    ]
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Executive Sales Dashboard</h4>
          <p className="text-muted small mb-0">Role-scoped pipeline health and CRM activity metrics</p>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ width: '150px' }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-buildings"></i>
            </div>
            <div>
              <div className="kpi-title">Total Customers</div>
              <div className="kpi-value">{data.totalCustomers}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-person-lines-fill"></i>
            </div>
            <div>
              <div className="kpi-title">Open Leads</div>
              <div className="kpi-value">{data.openLeads} <span className="text-muted fs-6 fw-normal">/ {data.totalLeads}</span></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-briefcase"></i>
            </div>
            <div>
              <div className="kpi-title">Open Opportunities</div>
              <div className="kpi-value">{data.openOpportunities} <span className="text-muted fs-6 fw-normal">/ {data.totalOpportunities}</span></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div>
              <div className="kpi-title">Active Pipeline</div>
              <div className="kpi-value">₹{data.totalPipelineValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-trophy"></i>
            </div>
            <div>
              <div className="kpi-title">Won Deals</div>
              <div className="kpi-value text-success">{data.wonOpportunities}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-x-circle"></i>
            </div>
            <div>
              <div className="kpi-title">Lost Deals</div>
              <div className="kpi-value text-danger">{data.lostOpportunities}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-pie-chart"></i>
            </div>
            <div>
              <div className="kpi-title">Weighted Value</div>
              <div className="kpi-value">₹{Math.round(data.weightedPipelineValue).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="kpi-card">
            <div className="kpi-icon bg-secondary bg-opacity-10 text-secondary">
              <i className="bi bi-calendar-check"></i>
            </div>
            <div>
              <div className="kpi-title">Pending Follow-Ups</div>
              <div className="kpi-value">
                {data.pendingFollowUps}
                {data.overdueFollowUps > 0 && (
                  <span className="badge bg-danger fs-6 fw-normal ms-1">{data.overdueFollowUps} overdue</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-4">
          <div className="crm-card h-100">
            <div className="crm-card-header">
              <span>Lead Status Distribution</span>
              <i className="bi bi-pie-chart text-muted"></i>
            </div>
            <div className="crm-card-body d-flex align-items-center justify-content-center" style={{ minHeight: '260px' }}>
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="crm-card h-100">
            <div className="crm-card-header">
              <span>Pipeline Stage Volume (₹)</span>
              <i className="bi bi-bar-chart-line text-muted"></i>
            </div>
            <div className="crm-card-body" style={{ minHeight: '260px' }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="crm-card h-100">
            <div className="crm-card-header">
              <span>Won Sales Revenue Trend</span>
              <i className="bi bi-graph-up text-muted"></i>
            </div>
            <div className="crm-card-body" style={{ minHeight: '260px' }}>
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tables */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="crm-card">
            <div className="crm-card-header">
              <span><i className="bi bi-calendar2-week me-1"></i> Upcoming Follow-Ups</span>
              <Link to="/followups" className="btn btn-sm btn-link text-decoration-none p-0">View All</Link>
            </div>
            <div className="crm-card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Related</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingFollowUps.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No scheduled follow-ups.</td></tr>
                    ) : (
                      data.upcomingFollowUps.map((f) => (
                        <tr key={f._id}>
                          <td><span className="badge bg-light text-dark border">{f.followUpType}</span></td>
                          <td className="fw-semibold">{f.subject}</td>
                          <td>{f.customer?.customerName || f.lead?.leadName || '—'}</td>
                          <td>{new Date(f.followUpDate).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="crm-card">
            <div className="crm-card-header">
              <span><i className="bi bi-briefcase me-1"></i> Recent Deals</span>
              <Link to="/opportunities" className="btn btn-sm btn-link text-decoration-none p-0">View All</Link>
            </div>
            <div className="crm-card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Opportunity</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOpportunities.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No deals recorded.</td></tr>
                    ) : (
                      data.recentOpportunities.map((o) => (
                        <tr key={o._id}>
                          <td className="fw-semibold">{o.opportunityName}</td>
                          <td>{o.customer?.customerName || 'N/A'}</td>
                          <td className="fw-bold">₹{o.amount.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${o.stage === 'Won' ? 'bg-success' : o.stage === 'Lost' ? 'bg-danger' : 'bg-primary'}`}>
                              {o.stage}
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
      </div>
    </div>
  );
};

export default Dashboard;

