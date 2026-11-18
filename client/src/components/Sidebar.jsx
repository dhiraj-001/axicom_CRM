import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="crm-sidebar">
      <NavLink to="/" className="crm-brand">
        <i className="bi bi-shield-check text-primary fs-4"></i>
        <span>AcxiomCRM</span>
        <span className="badge bg-primary ms-auto" style={{ fontSize: '0.65rem' }}>MERN</span>
      </NavLink>

      <div className="crm-nav">
        <div className="crm-nav-header">Analytics</div>
        <NavLink to="/" end className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </NavLink>

        <div className="crm-nav-header">Sales Operations</div>
        <NavLink to="/customers" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-buildings"></i>
          <span>Customers</span>
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-person-lines-fill"></i>
          <span>Leads</span>
        </NavLink>
        <NavLink to="/opportunities" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-briefcase"></i>
          <span>Opportunities</span>
        </NavLink>
        <NavLink to="/pipeline" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-kanban"></i>
          <span>Pipeline Board</span>
        </NavLink>
        <NavLink to="/followups" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-calendar-event"></i>
          <span>Follow-Ups</span>
        </NavLink>
        <NavLink to="/activities" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-journal-check"></i>
          <span>Activities</span>
        </NavLink>

        <div className="crm-nav-header">Intelligence</div>
        <NavLink to="/reports" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
          <i className="bi bi-graph-up-arrow"></i>
          <span>Reports & BI</span>
        </NavLink>

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <>
            <div className="crm-nav-header">Governance</div>
            {user?.role === 'Admin' && (
              <NavLink to="/users" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
                <i className="bi bi-people"></i>
                <span>User Management</span>
              </NavLink>
            )}
            <NavLink to="/audit" className={({ isActive }) => `crm-nav-item ${isActive ? 'active' : ''}`}>
              <i className="bi bi-shield-shaded"></i>
              <span>Audit Logs</span>
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

