import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">
          G
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">GVD Portal</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
          <Bell size={20} />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.username}</p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <User size={20} />
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-2"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
