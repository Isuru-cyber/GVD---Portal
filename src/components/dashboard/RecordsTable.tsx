import React from 'react';
import { ProductionRecord, MONTHS } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

interface RecordsTableProps {
  records: ProductionRecord[];
  onEdit?: (record: ProductionRecord) => void;
  onDelete?: (id: string) => void;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({ records, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const getUtilColor = (util: number) => {
    if (util >= 90) return 'text-emerald-600 bg-emerald-50';
    if (util >= 75) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const showActions = !!onEdit || !!onDelete;

  return (
    <div className="table-container mt-8 shadow-sm">
      <table className="data-table">
        <thead>
          <tr>
            <th>Month / Year</th>
            <th>Plant</th>
            <th>GRN</th>
            <th>Dispatched</th>
            <th>Waste</th>
            <th>Balance</th>
            <th>Utilization %</th>
            {showActions && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 8 : 7} className="text-center py-12 text-slate-400 italic">
                No records found.
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const balance = record.grn - record.dispatched - record.waste;
              const utilization = record.grn > 0 ? (record.dispatched / record.grn) * 100 : 0;
              
              return (
                <tr key={record.id}>
                  <td className="font-medium text-slate-700">
                    {MONTHS[record.month - 1]} {record.year}
                  </td>
                  <td>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      {record.plant}
                    </span>
                  </td>
                  <td className="tabular-nums">{record.grn.toLocaleString()}</td>
                  <td className="tabular-nums">{record.dispatched.toLocaleString()}</td>
                  <td className="tabular-nums">{record.waste.toLocaleString()}</td>
                  <td className={`tabular-nums font-bold ${balance < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {balance.toLocaleString()}
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getUtilColor(utilization)}`}>
                      {utilization.toFixed(1)}%
                    </span>
                  </td>
                  {showActions && (
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(record)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(record.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
