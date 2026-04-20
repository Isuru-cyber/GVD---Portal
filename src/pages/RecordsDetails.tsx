import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RecordsTable } from '../components/dashboard/RecordsTable';
import { supabase } from '../lib/supabase';
import { ProductionRecord, PLANTS } from '../types';
import { RefreshCw, Filter, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const RecordsDetails: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [plantFilter, setPlantFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const fetchRecords = async () => {
    setLoading(true);
    let query = supabase.from('production').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    
    if (user?.role === 'Entry User' && user.plant) {
      query = query.eq('plant', user.plant);
    } else if (plantFilter !== 'All') {
      query = query.eq('plant', plantFilter);
    }
    
    if (yearFilter !== 'All') {
      query = query.eq('year', parseInt(yearFilter));
    }

    const { data, error } = await query;
    if (!error && data) {
      const processedData = data.map(record => {
        const restricted = { ...record };
        if (user?.category && user.category !== 'All') {
          if (user.category === 'GRN') {
            restricted.dispatched = 0;
            restricted.waste = 0;
          } else if (user.category === 'Dispatched') {
            restricted.grn = 0;
            restricted.waste = 0;
          } else if (user.category === 'Waste') {
            restricted.grn = 0;
            restricted.dispatched = 0;
          }
        }
        return restricted;
      });
      setRecords(processedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [plantFilter, yearFilter]);

  const availableYears = useMemo(() => {
    const years = new Set(records.map(r => r.year));
    // If no records, at least show current year
    if (years.size === 0) return [new Date().getFullYear()];
    return Array.from(years).sort((a: any, b: any) => b - a);
  }, [records]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Records Details</h2>
            <p className="text-sm text-slate-500">Comprehensive list of all entered production data</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={plantFilter} 
              onChange={(e) => setPlantFilter(e.target.value)}
              className="text-sm font-medium text-slate-600 outline-none bg-transparent"
            >
              <option value="All">All Plants</option>
              {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="text-sm font-medium text-slate-600 outline-none bg-transparent"
            >
              <option value="All">All Years</option>
              {availableYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={fetchRecords}
            className="p-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Full Records History</h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <Download size={16} />
            Export Full Log
          </button>
        </div>
        <RecordsTable records={records} />
      </div>
    </div>
  );
};
