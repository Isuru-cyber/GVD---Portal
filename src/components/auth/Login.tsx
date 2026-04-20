import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, ShieldCheck, Factory, User } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setLoading(true);
    setError('');
    
    const success = await login(username);
    if (!success) {
      setError('User not found. Please try again or contact admin.');
    }
    setLoading(false);
  };

  const quickLogins = [
    { name: 'Admin', user: 'admin', icon: ShieldCheck, color: 'text-indigo-600' },
    { name: 'Viewer', user: 'viewer', icon: User, color: 'text-slate-600' },
    { name: 'STR 1 GRN', user: 'entry_str1_grn', icon: Factory, color: 'text-emerald-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-indigo-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 text-3xl font-extrabold">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GVD Portal</h1>
          <p className="text-indigo-100 mt-2 text-sm">Industrial Production Monitoring System</p>
          
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg border-4 border-slate-50">
            <LogIn size={20} />
          </div>
        </div>

        <div className="p-8 pt-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input h-12 bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !username}
              className="btn btn-primary w-full h-12 text-sm shadow-xl shadow-indigo-100"
            >
              {loading ? 'Logging in...' : 'Enter System'}
            </button>
          </form>
        </div>
      </motion.div>
      
      <p className="text-slate-400 text-[10px] mt-8 uppercase tracking-[0.2em] font-bold">
        Powered by GVD Operational Excellence © 2026
      </p>
    </div>
  );
};
