import React from 'react';
import { DashboardMetrics } from '../../types';
import { 
  TrendingUp, 
  Package, 
  Trash2, 
  Wallet, 
  Activity 
} from 'lucide-react';
import { motion } from 'motion/react';

interface KPISectionProps {
  metrics: DashboardMetrics;
}

export const KPISection: React.FC<KPISectionProps> = ({ metrics }) => {
  const kpis = [
    {
      title: 'Total GRN',
      value: metrics.totalGrn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    },
    {
      title: 'Total Dispatched',
      value: metrics.totalDispatched.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      title: 'Total Waste',
      value: metrics.totalWaste.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: Trash2,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100'
    },
    {
      title: 'Total Balance',
      value: metrics.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      icon: Wallet,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      title: 'Utilization %',
      value: `${metrics.overallUtilization.toFixed(2)}%`,
      icon: Activity,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-white p-4 sm:p-6 rounded-2xl border ${kpi.border} shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}
        >
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110`}>
              <kpi.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">{kpi.title}</p>
            <p className={`text-xl sm:text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
          <div className={`absolute -right-4 -bottom-4 ${kpi.bg} w-16 h-16 sm:w-24 sm:h-24 rounded-full opacity-20 pointer-events-none group-hover:scale-125 transition-transform`} />
        </motion.div>
      ))}
    </div>
  );
};
