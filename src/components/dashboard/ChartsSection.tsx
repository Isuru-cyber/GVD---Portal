import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { ProductionRecord } from '../../types';

interface ChartsSectionProps {
  records: ProductionRecord[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ records }) => {
  // Aggregate data by plant
  const plantData = records.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.plant);
    if (existing) {
      existing.grn += curr.grn;
      existing.dispatched += curr.dispatched;
      existing.waste += curr.waste;
    } else {
      acc.push({
        name: curr.plant,
        grn: curr.grn,
        dispatched: curr.dispatched,
        waste: curr.waste
      });
    }
    return acc;
  }, []);

  // Aggregate data by month for trends
  const monthlyData = records.reduce((acc: any[], curr) => {
    const monthYear = `${curr.year}-${curr.month}`;
    const existing = acc.find(item => item.name === monthYear);
    if (existing) {
      existing.grn += curr.grn;
      existing.dispatched += curr.dispatched;
      existing.waste += curr.waste;
    } else {
      acc.push({
        name: monthYear,
        month: curr.month,
        year: curr.year,
        grn: curr.grn,
        dispatched: curr.dispatched,
        waste: curr.waste
      });
    }
    return acc;
  }, []).sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Plant Comparison Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          Plant Comparison
          <span className="text-xs font-normal text-slate-400">Total volume by plant</span>
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend verticalAlign="top" iconType="circle" />
              <Bar dataKey="grn" name="GRN" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dispatched" name="Dispatched" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="waste" name="Waste" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          Monthly Trends
          <span className="text-xs font-normal text-slate-400">Production evolution over time</span>
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }} 
                tickFormatter={(val) => {
                  const [y, m] = val.split('-');
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return months[parseInt(m) - 1];
                }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" iconType="circle" />
              <Line type="monotone" dataKey="grn" name="GRN" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="dispatched" name="Dispatched" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Utilization Distribution */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          Utilization Distribution
          <span className="text-xs font-normal text-slate-400">Relative contribution by plant</span>
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={plantData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="dispatched"
                nameKey="name"
              >
                {plantData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Utilization Trend */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          Average Utilization Trend (%)
          <span className="text-xs font-normal text-slate-400">Monthly dispatched / GRN</span>
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData.map(d => ({ ...d, util: d.grn > 0 ? (d.dispatched / d.grn) * 100 : 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }}
                tickFormatter={(val) => {
                  const [y, m] = val.split('-');
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return months[parseInt(m) - 1];
                }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} unit="%" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="stepAfter" dataKey="util" name="Utilization %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} fill="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
