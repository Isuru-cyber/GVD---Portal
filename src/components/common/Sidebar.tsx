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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col fixed h-[calc(100vh-64px)] top-16 z-50 transition-all duration-300",
        isOpen ? "left-0" : "-left-64"
      )}>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">
            General
          </p>
          {menuItems.filter(item => item.show).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={cn(
                    "transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500"
                  )} />
                  <span className="font-medium">{item.title}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Current Plant</p>
            <p className="text-xs font-bold text-white mt-1 truncate">
              {user?.role === 'Admin' ? 'Global Admin' : user?.plant || 'N/A'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
