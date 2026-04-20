import React, { useMemo } from 'react';
import { ProductionRecord, PLANTS, MONTHS } from '../../types';

interface PlantSummariesProps {
  records: ProductionRecord[];
  year: number | string;
}

export const PlantSummaries: React.FC<PlantSummariesProps> = ({ records, year }) => {
  // Determine which year to display. If 'All' is selected, find the most recent year in the records.
  // If no records exist, default to the system's current year.
  const currentYear = useMemo(() => {
    if (year !== 'All') return parseInt(year as string);
    if (records.length === 0) return new Date().getFullYear();
    const years = records.map(r => r.year);
    return Math.max(...years);
  }, [records, year]);

  const getPlantData = (plantName: string) => {
    const dataByMonth = MONTHS.map((month, index) => {
      const monthIndex = index + 1;
      const record = records.find(r => r.plant === plantName && r.year === currentYear && r.month === monthIndex);
      
      const grn = record?.grn || 0;
      const dispatched = record?.dispatched || 0;
      const waste = record?.waste || 0;
      const gapStock = grn - dispatched - waste;
      const percentage = grn > 0 ? ((dispatched + waste) / grn) * 100 : 0;

      return {
        month,
        grn,
        dispatched,
        waste,
        gapStock,
        percentage
      };
    });

    const totals = dataByMonth.reduce((acc, curr) => ({
      grn: acc.grn + curr.grn,
      dispatched: acc.dispatched + curr.dispatched,
      waste: acc.waste + curr.waste,
      gapStock: acc.gapStock + curr.gapStock,
    }), { grn: 0, dispatched: 0, waste: 0, gapStock: 0 });

    const totalPercentage = totals.grn > 0 ? ((totals.dispatched + totals.waste) / totals.grn) * 100 : 0;

    return { dataByMonth, totals, totalPercentage };
  };

  const globalTotals = useMemo(() => {
    const dataByMonth = MONTHS.map((month, index) => {
      const monthIndex = index + 1;
      const monthRecords = records.filter(r => r.year === currentYear && r.month === monthIndex);
      
      const grn = monthRecords.reduce((sum, r) => sum + r.grn, 0);
      const dispatched = monthRecords.reduce((sum, r) => sum + r.dispatched, 0);
      const waste = monthRecords.reduce((sum, r) => sum + r.waste, 0);
      const gapStock = grn - dispatched - waste;
      const percentage = grn > 0 ? ((dispatched + waste) / grn) * 100 : 0;

      return {
        month,
        grn,
        dispatched,
        waste,
        gapStock,
        percentage
      };
    });

    const totals = dataByMonth.reduce((acc, curr) => ({
      grn: acc.grn + curr.grn,
      dispatched: acc.dispatched + curr.dispatched,
      waste: acc.waste + curr.waste,
      gapStock: acc.gapStock + curr.gapStock,
    }), { grn: 0, dispatched: 0, waste: 0, gapStock: 0 });

    const totalPercentage = totals.grn > 0 ? ((totals.dispatched + totals.waste) / totals.grn) * 100 : 0;

    return { dataByMonth, totals, totalPercentage };
  }, [records, currentYear]);

  return (
    <div className="space-y-12 py-8">
      <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Plant & Monthly Summary ({currentYear})</h3>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {PLANTS.map((plant, pIdx) => {
          const { dataByMonth, totals, totalPercentage } = getPlantData(plant);

          const colors = [
            'bg-blue-50 border-blue-200',
            'bg-emerald-50 border-emerald-200',
            'bg-orange-50 border-orange-200',
            'bg-purple-50 border-purple-200'
          ];
          const colorClass = colors[pIdx % colors.length];

          return (
            <div key={plant} className={`card border-t-4 ${colorClass}`}>
              <div className="p-4 border-b font-bold text-center uppercase tracking-widest bg-white/50">
                {plant}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 uppercase font-bold text-[10px] text-slate-600">
                    <tr>
                      <th className="px-4 py-3 border-r">MONTH</th>
                      <th className="px-4 py-3 border-r text-center">GRN (ROW YARN)</th>
                      <th className="px-4 py-3 border-r text-center">DISPATCHED QTY</th>
                      <th className="px-4 py-3 border-r text-center">WAST (EP+CP)</th>
                      <th className="px-4 py-3 border-r bg-slate-100/50 text-center">GAP STOCK</th>
                      <th className="px-4 py-3 text-center">PERCENTAGE %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataByMonth.map((m) => (
                      <tr key={m.month} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-center text-slate-700">
                        <td className="px-4 py-2 border-r font-medium text-slate-500 text-left">{m.month}</td>
                        <td className="px-4 py-2 border-r tabular-nums">{m.grn > 0 ? m.grn.toLocaleString() : '-'}</td>
                        <td className="px-4 py-2 border-r tabular-nums">{m.dispatched > 0 ? m.dispatched.toLocaleString() : '-'}</td>
                        <td className="px-4 py-2 border-r tabular-nums">{m.waste > 0 ? m.waste.toLocaleString() : '-'}</td>
                        <td className={`px-4 py-2 border-r tabular-nums font-bold ${m.gapStock < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                          {m.gapStock !== 0 ? `(${Math.abs(m.gapStock).toLocaleString()})` : '-'}
                        </td>
                        <td className="px-4 py-2 tabular-nums font-bold">
                          {m.percentage > 0 ? `${m.percentage.toFixed(0)}%` : '0%'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold text-center text-slate-800">
                      <td className="px-4 py-3 border-r text-left">TOTAL</td>
                      <td className="px-4 py-3 border-r tabular-nums">{totals.grn.toLocaleString()}</td>
                      <td className="px-4 py-3 border-r tabular-nums">{totals.dispatched.toLocaleString()}</td>
                      <td className="px-4 py-3 border-r tabular-nums">{totals.waste.toLocaleString()}</td>
                      <td className={`px-4 py-3 border-r tabular-nums ${totals.gapStock < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {`(${Math.abs(totals.gapStock).toLocaleString()})`}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{totalPercentage.toFixed(0)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Total Table */}
      <div className="card border-t-8 border-yellow-400 bg-yellow-50/10">
        <div className="p-4 border-b font-bold text-center uppercase tracking-widest bg-yellow-400 text-slate-900">
          GLOBAL CONSOLIDATED TOTAL ({currentYear})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 uppercase font-bold text-[11px] text-slate-700">
              <tr>
                <th className="px-6 py-4 border-r">MONTH</th>
                <th className="px-6 py-4 border-r text-center">GRN (ROW YARN)</th>
                <th className="px-6 py-4 border-r text-center">DISPATCHED QTY</th>
                <th className="px-6 py-4 border-r text-center">WAST</th>
                <th className="px-6 py-4 border-r bg-slate-200/50 text-center">GAP STOCK</th>
                <th className="px-6 py-4 text-center">PERCENTAGE %</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {globalTotals.dataByMonth.map((m) => (
                <tr key={m.month} className="border-b border-slate-100 hover:bg-yellow-50/30 transition-colors text-center font-medium">
                  <td className="px-6 py-3 border-r font-semibold text-slate-600 text-left">{m.month}</td>
                  <td className="px-6 py-3 border-r tabular-nums">{m.grn > 0 ? m.grn.toLocaleString() : '-'}</td>
                  <td className="px-6 py-3 border-r tabular-nums">{m.dispatched > 0 ? m.dispatched.toLocaleString() : '-'}</td>
                  <td className="px-6 py-3 border-r tabular-nums">{m.waste > 0 ? m.waste.toLocaleString() : '-'}</td>
                  <td className={`px-6 py-3 border-r tabular-nums font-bold ${m.gapStock < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {m.gapStock !== 0 ? `(${Math.abs(m.gapStock).toLocaleString()})` : '-'}
                  </td>
                  <td className="px-6 py-3 tabular-nums font-bold text-indigo-700">
                    {m.percentage > 0 ? `${m.percentage.toFixed(0)}%` : '0%'}
                  </td>
                </tr>
              ))}
              <tr className="bg-yellow-400 text-slate-900 font-extrabold shadow-inner text-center">
                <td className="px-6 py-5 border-r text-left">CONSOLIDATED TOTAL</td>
                <td className="px-6 py-5 border-r tabular-nums">{globalTotals.totals.grn.toLocaleString()}</td>
                <td className="px-6 py-5 border-r tabular-nums">{globalTotals.totals.dispatched.toLocaleString()}</td>
                <td className="px-6 py-5 border-r tabular-nums">{globalTotals.totals.waste.toLocaleString()}</td>
                <td className="px-6 py-5 border-r tabular-nums">
                  {`(${Math.abs(globalTotals.totals.gapStock).toLocaleString()})`}
                </td>
                <td className="px-6 py-5 tabular-nums text-lg">{globalTotals.totalPercentage.toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
