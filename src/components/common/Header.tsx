import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg mr-1 focus:ring-2 focus:ring-indigo-100 transition-all"
        >
          <Menu size={20} />
        </button>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-indigo-200 shadow-lg shrink-0">
          G
        </div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 line-clamp-1">GVD Portal</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hidden xs:block">
          <Bell size={18} className="sm:w-5 sm:h-5" />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-1 sm:mx-2 hidden xs:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.username}</p>
            <p className="text-[10px] text-slate-500 mt-1 capitalize">{user?.role}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <User size={18} className="sm:w-5 sm:h-5" />
          </div>
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
