import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User as UserType, PLANTS, UserRole, CATEGORIES } from '../../types';
import { UserPlus, Trash2, Shield, Factory, Filter, User as UserIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    role: 'Entry User' as UserRole,
    plant: PLANTS[0],
    category: 'All' as any
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) return;

    // Viewers and Admins are Global/All by default
    const submissionData = {
      ...formData,
      plant: (formData.role === 'Admin' || formData.role === 'Viewer') ? 'Global' : formData.plant,
      category: (formData.role === 'Admin' || formData.role === 'Viewer') ? 'All' : formData.category
    };

    const { error } = await supabase
      .from('users')
      .insert([submissionData]);

    if (!error) {
      toast.success(`User ${formData.username} registered successfully`);
      // Log action
      await supabase.from('logs').insert([{
        username: 'admin', // Current user is admin
        action: `Created user ${formData.username}`,
        plant: submissionData.plant,
        timestamp: new Date().toISOString()
      }]);

      setFormData({ username: '', role: 'Entry User', plant: PLANTS[0], category: 'All' });
      setIsAdding(false);
      fetchUsers();
    } else {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (!error) {
        toast.success(`User ${username} deleted`);
        // Log action
        await supabase.from('logs').insert([{
          username: 'admin',
          action: `Deleted user ${username}`,
          plant: 'System',
          timestamp: new Date().toISOString()
        }]);
        fetchUsers();
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">User Management</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary"
        >
          <UserPlus size={18} />
          {isAdding ? 'Cancel' : 'Register New User'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddUser} className="card p-6 border-indigo-100 bg-indigo-50/20 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="form-group">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input bg-white"
              placeholder="unique_username"
              required
            />
          </div>
          <div className="form-group">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="input bg-white"
            >
              <option value="Admin">Admin</option>
              <option value="Entry User">Entry User</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Assigned Plant</label>
            <select
              value={formData.role === 'Admin' || formData.role === 'Viewer' ? 'Global' : formData.plant}
              onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
              className="input bg-white disabled:bg-slate-50 disabled:text-slate-400"
              disabled={formData.role === 'Admin' || formData.role === 'Viewer'}
            >
              <option value="Global">Global / All</option>
              {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group flex items-end">
            <button type="submit" className="btn btn-primary w-full h-11">
              Create User
            </button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Assignment</th>
              <th>Created At</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading users...</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td className="font-bold text-slate-700">{u.username}</td>
                <td>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 
                    u.role === 'Viewer' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {u.role === 'Admin' ? <Shield size={10} /> : u.role === 'Viewer' ? <UserIcon size={10} /> : <Factory size={10} />}
                    {u.role}
                  </span>
                </td>
                <td className="text-slate-500">
                  {u.role === 'Admin' ? 'Full System' : `${u.plant} - ${u.category || 'All'}`}
                </td>
                <td className="text-slate-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => handleDeleteUser(u.id, u.username)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    disabled={u.username === 'admin'}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
