import React, { useState, useEffect } from 'react';
import { RecordForm } from '../components/data-entry/RecordForm';
import { RecordsTable } from '../components/dashboard/RecordsTable';
import { Modal } from '../components/common/Modal';
import { supabase } from '../lib/supabase';
import { ProductionRecord, PLANTS } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const DataEntry: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Deletion state
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const fetchUserRecords = async () => {
    setLoading(true);
    let query = supabase.from('production').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    
    if (user?.role === 'Entry User' && user.plant && user.plant !== 'Global' && user.plant !== 'All') {
      query = query.eq('plant', user.plant);
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

  useEffect(() => {
    fetchUserRecords();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    setIsSubmitting(true);
    
    // Remove 'category' from formData as it's not a column in the production table
    const { category, ...dataToSave } = formData;
    
    const payload = {
      ...dataToSave,
      created_by: user?.username || 'system'
    };

    let result;
    if (editingRecord) {
      result = await supabase.from('production').update(payload).eq('id', editingRecord.id);
      
      if (!result.error) {
        toast.success('Record updated successfully');
        // Log action
        await supabase.from('logs').insert([{
          username: user?.username || 'system',
          action: `Updated production record for ${formData.plant} ${formData.month}/${formData.year}`,
          plant: formData.plant || 'System',
          timestamp: new Date().toISOString()
        }]);
      }
    } else {
      // Use upsert to prevent duplicate key errors. onConflict specifies the unique constraint columns.
      result = await supabase.from('production').upsert(payload, { 
        onConflict: 'plant,year,month',
        ignoreDuplicates: false 
      });
      
      if (!result.error) {
        toast.success('Record saved successfully');
        // Log action
        await supabase.from('logs').insert([{
          username: user?.username || 'system',
          action: `Saved production record for ${formData.plant} ${formData.month}/${formData.year}`,
          plant: formData.plant || 'System',
          timestamp: new Date().toISOString()
        }]);
      }
    }

    if (!result.error) {
      setIsModalOpen(false);
      setEditingRecord(null);
      fetchUserRecords();
    } else {
      toast.error(`Error: ${result.error.message}`);
      console.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    const record = records.find(r => r.id === recordToDelete);
    const { error } = await supabase.from('production').delete().eq('id', recordToDelete);
    if (!error) {
      toast.success('Record deleted successfully');
      // Log action
      await supabase.from('logs').insert([{
        username: user?.username || 'system',
        action: `Deleted production record for ${record?.plant} ${record?.month}/${record?.year}`,
        plant: record?.plant || 'System',
        timestamp: new Date().toISOString()
      }]);
      fetchUserRecords();
    } else {
      toast.error(error.message);
    }
    setRecordToDelete(null);
  };

  const handleEdit = (record: ProductionRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800"> Data Entry</h2>
          <p className="text-[10px] sm:text-sm text-slate-500">Manage plant production values</p>
        </div>

        <button
          onClick={() => {
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary self-start sm:self-auto text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-6"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          Add New Entry
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Your Recent Records</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter by year or month..." 
              className="input pl-10 h-9 sm:h-10 text-[10px] sm:text-xs" 
            />
          </div>
        </div>
        <RecordsTable 
          records={records} 
          onEdit={handleEdit} 
          onDelete={(id) => setRecordToDelete(id)} 
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800">Delete Production Record?</h4>
            <p className="text-slate-500 mt-1">
              Are you sure you want to delete this production entry? This action is permanent.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setRecordToDelete(null)}
              className="btn flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn flex-1 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? 'Edit Production Record' : 'New Production Entry'}
      >
        <RecordForm 
          initialData={editingRecord} 
          onSubmit={handleCreateOrUpdate}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};
