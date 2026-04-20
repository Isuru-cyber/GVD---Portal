import React, { useState } from 'react';
import { UserManagement } from '../components/settings/UserManagement';
import { ActivityLogs } from '../components/settings/ActivityLogs';
import { Users, History, Palette, Bell } from 'lucide-react';
import { clsx } from 'clsx';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'ui'>('users');

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'logs', label: 'Activity Logs', icon: History },
    { id: 'ui', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <p className="text-sm text-slate-500">Configure portal access and view system history</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              )}
            >
              <tab.icon size={18} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1">
          <div className="card p-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'logs' && <ActivityLogs />}
            {activeTab === 'ui' && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette size={32} className="text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-bold">Appearance Settings</h4>
                <p className="text-slate-500 text-sm mt-2">Personalization features are coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
