import React from 'react';
import { ProductionRecord, PLANTS, MONTHS, CATEGORIES } from '../../types';
import { AlertCircle, Clock } from 'lucide-react';

interface MissingEntriesProps {
  records: ProductionRecord[];
  year: string | number;
}

export const MissingEntries: React.FC<MissingEntriesProps> = ({ records, year }) => {
  const now = new Date();
  const systemYear = now.getFullYear();
  const systemMonthIdx = now.getMonth(); // 0-indexed (0 = Jan, 1 = Feb...)
  
  const selectedYear = typeof year === 'string' ? (year === 'All' ? systemYear : parseInt(year)) : year;

  const missingData = [];

  // Determine how many months to check
  // For current year, we only check up to the PREVIOUS month (systemMonthIdx - 1)
  // For past years, we check all 12 months (0-11)
  const lastMonthToCheck = selectedYear === systemYear ? systemMonthIdx - 1 : 11;

  if (lastMonthToCheck < 0 && selectedYear === systemYear) return null;

  for (let m = 0; m <= lastMonthToCheck; m++) {
    const monthName = MONTHS[m];
    const monthNum = m + 1;

    for (const plant of PLANTS) {
      const record = records.find(r => r.plant === plant && r.year === selectedYear && r.month === monthNum);

      if (!record) {
        CATEGORIES.forEach(category => {
          missingData.push({ month: monthName, plant, category });
        });
      } else {
        if (record.grn === 0) missingData.push({ month: monthName, plant, category: 'GRN' });
        if (record.dispatched === 0) missingData.push({ month: monthName, plant, category: 'Dispatched' });
        if (record.waste === 0) missingData.push({ month: monthName, plant, category: 'Waste' });
      }
    }
  }

  if (missingData.length === 0) return null;

  return (
    <div className="card border-t-4 border-rose-500 overflow-hidden">
      <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-700 font-bold uppercase tracking-wider text-sm">
          <AlertCircle size={18} />
          Pending Data Entries (Year {selectedYear})
        </div>
        <div className="text-[10px] font-bold text-rose-500 bg-white px-2 py-0.5 rounded-full border border-rose-200">
          ACTION REQUIRED
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-[10px] sm:text-xs text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[9px] sm:text-[10px]">
            <tr className="whitespace-nowrap">
              <th className="px-4 sm:px-6 py-3 border-r">Month</th>
              <th className="px-4 sm:px-6 py-3 border-r">Plant</th>
              <th className="px-4 sm:px-6 py-3">Category (Missing Data)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 italic">
            {missingData.map((item, idx) => (
              <tr key={idx} className="hover:bg-rose-50/30 transition-colors group whitespace-nowrap">
                <td className="px-4 sm:px-6 py-2.5 border-r font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock size={10} className="sm:w-3 sm:h-3 text-slate-400" />
                    {item.month}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-2.5 border-r text-center">
                   <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[9px] sm:text-[10px]">
                     {item.plant}
                   </span>
                </td>
                <td className="px-4 sm:px-6 py-2.5">
                  <span className="flex items-center gap-1.5 text-rose-600 font-extrabold uppercase">
                    <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                    {item.category} Details Missing
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 text-[10px] text-slate-400 font-medium italic text-center border-t border-slate-100">
        Please ensure all monthly returns are entered promptly to maintain dashboard accuracy.
      </div>
    </div>
  );
};
