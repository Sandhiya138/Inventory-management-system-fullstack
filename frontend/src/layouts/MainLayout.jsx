import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../components/common/Toast';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const MainLayout = ({ children, title, subtitle }) => {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar title={title} subtitle={subtitle} />
        <main className="content-container animate-fade">
          <ErrorBoundary>
            {children || <Outlet />}
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
