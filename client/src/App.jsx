import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import LeadConvert from './pages/LeadConvert';
import Opportunities from './pages/Opportunities';
import PipelineBoard from './pages/PipelineBoard';
import FollowUps from './pages/FollowUps';
import Activities from './pages/Activities';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />

            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/leads/:id/convert" element={<LeadConvert />} />

            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/opportunities/pipeline" element={<PipelineBoard />} />
            <Route path="/pipeline" element={<PipelineBoard />} />

            <Route path="/followups" element={<FollowUps />} />
            <Route path="/activities" element={<Activities />} />

            <Route path="/reports" element={<Reports />} />

            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit"
              element={
                <ProtectedRoute roles={['Admin', 'Manager']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={['Admin', 'Manager']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

