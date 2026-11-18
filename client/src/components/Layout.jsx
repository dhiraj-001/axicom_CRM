import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-content">
        <Header />
        <main className="crm-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

