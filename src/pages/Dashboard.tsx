import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { KPISection } from '../components/dashboard/KPISection';
import { ChartsSection } from '../components/dashboard/ChartsSection';
import { RecordsTable } from '../components/dashboard/RecordsTable';
import { supabase } from '../lib/supabase';
import { ProductionRecord, DashboardMetrics, PLANTS } from '../types';
import { Download, RefreshCw, Filter, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { PlantSummaries } from '../components/dashboard/PlantSummaries';
import { MissingEntries } from '../components/dashboard/MissingEntries';

export const Dashboard: React.FC = () => {
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
    
    // Plant restriction (for Entry Users)
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
      // Category restriction: Zero out restricted categories if not "All"
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

    // Subscribe to realtime changes
    const channel = supabase
      .channel('production-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'production' }, () => {
        fetchRecords();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [plantFilter, yearFilter]);

  const metrics = useMemo<DashboardMetrics>(() => {
    const totalGrn = records.reduce((sum, r) => sum + r.grn, 0);
    const totalDispatched = records.reduce((sum, r) => sum + r.dispatched, 0);
    const totalWaste = records.reduce((sum, r) => sum + r.waste, 0);
    const totalBalance = totalGrn - totalDispatched - totalWaste;
    const overallUtilization = totalGrn > 0 ? ((totalDispatched + totalWaste) / totalGrn) * 100 : 0;

    return {
      totalGrn,
      totalDispatched,
      totalWaste,
      totalBalance,
      overallUtilization
    };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Production Dashboard</h2>
          <p className="text-sm text-slate-500">Real-time plant performance overview</p>
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
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
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

      <KPISection metrics={metrics} />
      
      <div className="grid grid-cols-1 gap-8">
        <ChartsSection records={records} />
        
        <div className="card">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Detailed Monthly Breakdown (Latest 12)</h3>
            <div className="flex items-center gap-4">
              <Link 
                to="/records-details"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
              >
                <ExternalLink size={16} />
                View All Details
              </Link>
              <button className="text-sm font-semibold text-slate-600 hover:text-slate-700 flex items-center gap-1">
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
          <RecordsTable records={records.slice(0, 12)} />
        </div>

        <PlantSummaries records={records} year={yearFilter} />
        <MissingEntries records={records} year={yearFilter} />
      </div>
    </div>
  );
};
