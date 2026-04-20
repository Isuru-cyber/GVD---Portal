/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './components/auth/Login';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DataEntry } from './pages/DataEntry';
import { Settings } from './pages/Settings';
import { ActivityLogs } from './components/settings/ActivityLogs';
import { UserManagement } from './components/settings/UserManagement';
import { Toaster } from 'react-hot-toast';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Toaster position="top-right" />
        <Header />
        <div className="flex flex-1 pt-0">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/data-entry" element={<DataEntry />} />
                {user.role === 'Admin' && (
                  <>
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/logs" element={<ActivityLogs />} />
                  </>
                )}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
        <footer className="ml-64 py-6 px-8 border-t border-slate-200 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-white">
          GVD Opex Management System &copy; 2026 | Proprietary & Confidential
        </footer>
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
