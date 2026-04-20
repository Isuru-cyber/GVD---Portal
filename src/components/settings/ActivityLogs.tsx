import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityLog } from '../../types';
import { Clock, Info, User, Tag } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();

    // Realtime subscription for logs
    const subscription = supabase
      .channel('logs-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs' }, payload => {
        setLogs(prev => [payload.new as ActivityLog, ...prev.slice(0, 99)]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">System Activity Logs</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          Showing last 100 actions
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-slate-400 italic">No activity recorded yet.</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="group">
                <td className="text-slate-400 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-300" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <User size={14} className="text-indigo-400" />
                    {log.username}
                  </div>
                </td>
                <td className="max-w-md">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Info size={14} className="text-amber-400 flex-shrink-0" />
                    {log.action}
                  </div>
                </td>
                <td>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                    <Tag size={10} />
                    {log.plant}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
