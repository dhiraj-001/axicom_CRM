import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STAGES = ['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const PipelineBoard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/opportunities?limit=200');
      setOpportunities(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleStageChange = async (oppId, newStage) => {
    setUpdatingId(oppId);
    try {
      await api.put(`/opportunities/${oppId}`, { stage: newStage });
      setOpportunities((prev) =>
        prev.map((opp) => (opp._id === oppId ? { ...opp, stage: newStage } : opp))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stage');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStageHeaderColor = (stage) => {
    switch (stage) {
      case 'Qualification': return '#6c757d';
      case 'Proposal': return '#0d6efd';
      case 'Negotiation': return '#fd7e14';
      case 'Won': return '#198754';
      case 'Lost': return '#dc3545';
      default: return '#495057';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item"><Link to="/opportunities">Opportunities</Link></li>
              <li className="breadcrumb-item active">Pipeline Board</li>
            </ol>
          </nav>
          <h2 className="fw-bold mb-1">Kanban Pipeline Board</h2>
          <p className="text-muted mb-0">Visual pipeline tracking across deal stages.</p>
        </div>
        <Link to="/opportunities" className="btn btn-outline-secondary">
          <i className="bi bi-table me-1"></i> Table View
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-2 text-muted">Loading pipeline board...</div>
        </div>
      ) : (
        <div className="row g-3 flex-nowrap overflow-auto pb-4" style={{ minHeight: '75vh' }}>
          {STAGES.map((stage) => {
            const stageDeals = opportunities.filter((o) => o.stage === stage);
            const stageTotal = stageDeals.reduce((sum, o) => sum + Number(o.amount || 0), 0);
            const headerColor = getStageHeaderColor(stage);

            return (
              <div key={stage} className="col-12 col-md-6 col-lg" style={{ minWidth: '280px', maxWidth: '340px' }}>
                <div className="card h-100 border-0 shadow-sm bg-light">
                  <div
                    className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center"
                    style={{ borderTop: `4px solid ${headerColor}` }}
                  >
                    <div>
                      <h6 className="fw-bold mb-0">{stage}</h6>
                      <small className="text-muted fw-semibold">₹{stageTotal.toLocaleString()}</small>
                    </div>
                    <span className="badge rounded-pill bg-light text-dark border">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="card-body p-2 d-flex flex-column gap-2 overflow-auto">
                    {stageDeals.length === 0 ? (
                      <div className="text-center py-4 text-muted small">No deals in this stage</div>
                    ) : (
                      stageDeals.map((opp) => (
                        <div
                          key={opp._id}
                          className="card border-0 shadow-sm p-3 bg-white"
                          style={{ opacity: updatingId === opp._id ? 0.6 : 1 }}
                        >
                          <div className="fw-bold text-dark mb-1">{opp.opportunityName}</div>
                          <div className="small text-muted mb-2">
                            {opp.customer?.customerName || 'No Customer'}
                          </div>

                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-success">
                              ₹{Number(opp.amount).toLocaleString()}
                            </span>
                            <span className="badge bg-light text-secondary border">
                              {opp.probability}% win
                            </span>
                          </div>

                          <div className="progress mb-2" style={{ height: '4px' }}>
                            <div
                              className="progress-bar bg-info"
                              role="progressbar"
                              style={{ width: `${opp.probability}%` }}
                            ></div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
                            <span>
                              <i className="bi bi-calendar3 me-1"></i>
                              {new Date(opp.expectedCloseDate).toLocaleDateString()}
                            </span>
                            <span>{opp.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                            <label className="small text-muted mb-0">Move to:</label>
                            <select
                              className="form-select form-select-sm py-0 ps-2 pe-4"
                              style={{ width: 'auto', fontSize: '0.75rem' }}
                              value={opp.stage}
                              disabled={updatingId === opp._id}
                              onChange={(e) => handleStageChange(opp._id, e.target.value)}
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PipelineBoard;

