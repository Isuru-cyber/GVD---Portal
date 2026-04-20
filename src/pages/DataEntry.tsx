import React, { useState, useEffect } from 'react';
import { RecordForm } from '../components/data-entry/RecordForm';
import { RecordsTable } from '../components/dashboard/RecordsTable';
import { Modal } from '../components/common/Modal';
import { supabase } from '../lib/supabase';
import { ProductionRecord, PLANTS } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, FileText } from 'lucide-react';

export const DataEntry: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserRecords = async () => {
    setLoading(true);
    let query = supabase.from('production').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    
    if (!isAdmin && user?.plant) {
      query = query.eq('plant', user.plant);
    }

    const { data, error } = await query;
    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserRecords();
  }, []);

  const handleCreateOrUpdate = async (formData: Partial<ProductionRecord>) => {
    setIsSubmitting(true);
    const payload = {
      ...formData,
      created_by: user?.username || 'system'
    };

    let result;
    if (editingRecord) {
      result = await supabase.from('production').update(payload).eq('id', editingRecord.id);
      
      // Log action
      await supabase.from('logs').insert([{
        username: user?.username || 'system',
        action: `Updated production record for ${formData.plant} ${formData.month}/${formData.year}`,
        plant: formData.plant || 'System',
        timestamp: new Date().toISOString()
      }]);
    } else {
      result = await supabase.from('production').insert([payload]);
      
      // Log action
      await supabase.from('logs').insert([{
        username: user?.username || 'system',
        action: `Created production record for ${formData.plant} ${formData.month}/${formData.year}`,
        plant: formData.plant || 'System',
        timestamp: new Date().toISOString()
      }]);
    }

    if (!result.error) {
      setIsModalOpen(false);
      setEditingRecord(null);
      fetchUserRecords();
    } else {
      console.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      const record = records.find(r => r.id === id);
      const { error } = await supabase.from('production').delete().eq('id', id);
      if (!error) {
        // Log action
        await supabase.from('logs').insert([{
          username: user?.username || 'system',
          action: `Deleted production record for ${record?.plant} ${record?.month}/${record?.year}`,
          plant: record?.plant || 'System',
          timestamp: new Date().toISOString()
        }]);
        fetchUserRecords();
      }
    }
  };

  const handleEdit = (record: ProductionRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Production Data Entry</h2>
          <p className="text-sm text-slate-500">Manage plant production values</p>
        </div>

        <button
          onClick={() => {
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add New Entry
        </button>
      </div>

      <div className="card border-dashed border-2 border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4 shadow-sm">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Ready to record data?</h3>
          <p className="text-sm text-slate-500 mt-2">
            {!isAdmin ? `You are authorized to enter data for ${user?.plant} covering ${user?.category} categories.` : 'As an administrator, you have full access to all plants and categories.'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Your Recent Records</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by year or month..." 
              className="input pl-10 h-10 text-xs" 
            />
          </div>
        </div>
        <RecordsTable 
          records={records} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

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
