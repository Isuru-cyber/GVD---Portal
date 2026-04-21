import React from 'react';
import { ProductionRecord, MONTHS } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

interface RecordsTableProps {
  records: ProductionRecord[];
  onEdit?: (record: ProductionRecord) => void;
  onDelete?: (id: string) => void;
  showExtended?: boolean;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({ records, onEdit, onDelete, showExtended = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const getUtilColor = (util: number) => {
    if (util >= 90) return 'text-emerald-600 bg-emerald-50';
    if (util >= 75) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const showActions = !!onEdit || !!onDelete;
  const colCount = (showActions ? 8 : 7) + (showExtended ? 2 : 0);

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
            <th>Gap Stock</th>
            <th>Percentage %</th>
            {showExtended && (
              <>
                <th>Created By</th>
                <th>Date & Time</th>
              </>
            )}
            {showActions && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="text-center py-12 text-slate-400 italic">
                No records found.
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const gapStock = record.grn - record.dispatched - record.waste;
              const percentage = record.grn > 0 ? ((record.dispatched + record.waste) / record.grn) * 100 : 0;
              const createdAt = new Date(record.created_at);
              
              // Calculate if the record is older than 20 days
              const diffTime = Math.abs(new Date().getTime() - createdAt.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const canEdit = isAdmin || diffDays <= 20;
              
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
                  <td className={`tabular-nums font-bold ${gapStock < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {gapStock.toLocaleString()}
                  </td>
                  <td>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getUtilColor(percentage)}`}>
                      {percentage.toFixed(2)}%
                    </span>
                  </td>
                  {showExtended && (
                    <>
                      <td className="text-xs text-slate-500 capitalize">{record.created_by}</td>
                      <td className="text-[10px] text-slate-400 tabular-nums">
                        {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </>
                  )}
                  {showActions && (
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        {canEdit ? (
                          <>
                            {onEdit && (
                              <button 
                                onClick={() => onEdit(record)}
                                className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Edit Record"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {onDelete && (
                              <button 
                                onClick={() => onDelete(record.id)}
                                className="p-1.5 hover:text-rose-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Record"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 px-2 py-1 bg-slate-50 rounded border border-slate-100">
                            Locked
                          </span>
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
