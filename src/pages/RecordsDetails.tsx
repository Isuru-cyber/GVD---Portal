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
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);

  const fetchRecords = async () => {
    setLoading(true);
    let query = supabase.from('production').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    
    if (user?.role === 'Entry User' && user.plant && user.plant !== 'Global' && user.plant !== 'All') {
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

  const fetchAvailableYears = async () => {
    const { data } = await supabase.from('production').select('year');
    if (data) {
      const years = new Set<number>(data.map(r => r.year));
      years.add(new Date().getFullYear());
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
    }
  };

  useEffect(() => {
    fetchAvailableYears();
    fetchRecords();
  }, [plantFilter, yearFilter]);

  const handleExportCSV = () => {
    if (records.length === 0) return;
    
    // Using simple CSV generation
    const headers = ['Month', 'Year', 'Plant', 'GRN', 'Dispatched', 'Waste', 'Gap Stock', 'Percentage %', 'Created By', 'Created At'];
    const csvData = records.map(r => {
      const gapStock = r.grn - r.dispatched - r.waste;
      const percentage = r.grn > 0 ? ((r.dispatched + r.waste) / r.grn) * 100 : 0;
      return [
        r.month,
        r.year,
        r.plant,
        r.grn,
        r.dispatched,
        r.waste,
        gapStock,
        `${percentage.toFixed(2)}%`,
        r.created_by,
        new Date(r.created_at).toISOString()
      ].join(',');
    });

    const csvString = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GVD_Full_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 sm:p-2 bg-white text-slate-600 border border-slate-200 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">Records Details</h2>
            <p className="text-[10px] sm:text-sm text-slate-500 truncate">Comprehensive list of production data</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0 flex-1 sm:flex-none">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select 
              value={plantFilter} 
              onChange={(e) => setPlantFilter(e.target.value)}
              className="text-[10px] sm:text-sm font-medium text-slate-600 outline-none bg-transparent min-w-0 truncate"
            >
              <option value="All">All Plants</option>
              {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="w-[1px] h-3 sm:h-4 bg-slate-200 shrink-0" />
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="text-[10px] sm:text-sm font-medium text-slate-600 outline-none bg-transparent shrink-0"
            >
              {availableYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={fetchRecords}
            className="p-2 sm:p-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors shadow-sm shrink-0"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin sm:w-[18px] sm:h-[18px]' : 'sm:w-[18px] sm:h-[18px]'} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Your Recent Records</h3>
          <button 
            onClick={handleExportCSV}
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors self-start sm:self-auto"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            Export Full Log (CSV)
          </button>
        </div>
        <RecordsTable records={records} showExtended={true} />
      </div>
    </div>
  );
};
