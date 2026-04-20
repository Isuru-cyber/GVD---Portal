import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  FileEdit, 
  Settings, 
  Users, 
  History,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isViewer = user?.role === 'Viewer';
  const isEntry = user?.role === 'Entry User';

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      show: true
    },
    {
      title: 'Data Entry',
      icon: FileEdit,
      path: '/data-entry',
      show: isAdmin || isEntry
    },
    {
      title: 'Records Details',
      icon: BarChart3,
      path: '/records-details',
      show: true
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/users',
      show: isAdmin
    },
    {
      title: 'Activity Logs',
      icon: History,
      path: '/logs',
      show: isAdmin
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      show: isAdmin
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col fixed h-[calc(100vh-64px)] top-16 transition-all duration-300">
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">
          General
        </p>
        {menuItems.filter(item => item.show).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                : "hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn(
                  "transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-500"
                )} />
                <span className="font-medium text-sm">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 font-medium">Current Plant</p>
          <p className="text-sm font-bold text-white mt-1">
            {user?.role === 'Admin' ? 'Global Admin' : user?.plant || 'N/A'}
          </p>
        </div>
      </div>
    </aside>
  );
};
