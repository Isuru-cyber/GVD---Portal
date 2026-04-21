import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProductionRecord, PLANTS, MONTHS, CATEGORIES } from '../../types';
import { Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RecordFormProps {
  initialData?: ProductionRecord | null;
  onSubmit: (data: Partial<ProductionRecord>) => void;
  isSubmitting?: boolean;
}

export const RecordForm: React.FC<RecordFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [formData, setFormData] = useState({
    plant: (user?.plant && user.plant !== 'Global') ? user.plant : PLANTS[0],
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    grn: 0,
    dispatched: 0,
    waste: 0,
    category: (user?.category && user.category !== 'All') ? user.category : 'All'
  });

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
      if (initialData) return;
      
      setIsChecking(true);
      const { data, error } = await supabase
        .from('production')
        .select('*')
        .eq('plant', formData.plant)
        .eq('year', formData.year)
        .eq('month', formData.month)
        .single();

      if (!error && data) {
        setFormData(prev => ({
          ...prev,
          grn: data.grn,
          dispatched: data.dispatched,
          waste: data.waste
        }));
        // We could also notify the user here that we found an existing record
      } else {
        // Reset to 0 if no record found and we aren't editing a specific record
        setFormData(prev => ({
          ...prev,
          grn: 0,
          dispatched: 0,
          waste: 0
        }));
      }
      setIsChecking(false);
    };

    const timer = setTimeout(fetchExisting, 500);
    return () => clearTimeout(timer);
  }, [formData.plant, formData.year, formData.month, initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        plant: initialData.plant,
        year: initialData.year,
        month: initialData.month,
        grn: initialData.grn,
        dispatched: initialData.dispatched,
        waste: initialData.waste,
        category: (user?.category && user.category !== 'All') ? user.category : 'All'
      });
    } else if (user) {
      // Set default plant for new entry if user plant is 'Global'
      setFormData(prev => ({
        ...prev,
        plant: (user.plant && user.plant !== 'Global') ? user.plant : PLANTS[0],
        category: (user.category && user.category !== 'All') ? user.category : 'All'
      }));
    }
  }, [initialData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'plant' || name === 'category' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isGrnEditable = isAdmin || formData.category === 'GRN' || formData.category === 'All';
  const isDispatchedEditable = isAdmin || formData.category === 'Dispatched' || formData.category === 'All';
  const isWasteEditable = isAdmin || formData.category === 'Waste' || formData.category === 'All';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isChecking && (
        <div className="bg-indigo-50 p-2 rounded-lg flex items-center justify-center gap-2 text-indigo-600 text-[10px] font-bold animate-pulse">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
          Syncing existing plant data...
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="text-sm font-semibold text-slate-700">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="input mt-1"
            required
            min={2000}
            max={2100}
          />
        </div>
        <div className="form-group">
          <label className="text-sm font-semibold text-slate-700">Month</label>
          <select
            name="month"
            value={formData.month}
            onChange={handleChange}
            className="input mt-1"
            required
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="text-sm font-semibold text-slate-700">Plant</label>
        <select
          name="plant"
          value={formData.plant}
          onChange={handleChange}
          className="input mt-1 disabled:bg-slate-50"
          required
          disabled={!isAdmin}
        >
          {PLANTS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {!isAdmin && (
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <AlertCircle size={10} /> Plant is fixed to assigned location.
          </p>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="form-group">
          <label className="text-sm font-semibold text-slate-700">GRN Volume</label>
          <input
            type="number"
            name="grn"
            value={formData.grn}
            onChange={handleChange}
            className="input mt-1 disabled:bg-slate-50 disabled:text-slate-400"
            required
            disabled={!isGrnEditable}
          />
        </div>
        <div className="form-group">
          <label className="text-sm font-semibold text-slate-700">Dispatched Volume</label>
          <input
            type="number"
            name="dispatched"
            value={formData.dispatched}
            onChange={handleChange}
            className="input mt-1 disabled:bg-slate-50 disabled:text-slate-400"
            required
            disabled={!isDispatchedEditable}
          />
        </div>
        <div className="form-group">
          <label className="text-sm font-semibold text-slate-700">Waste Volume</label>
          <input
            type="number"
            name="waste"
            value={formData.waste}
            onChange={handleChange}
            className="input mt-1 disabled:bg-slate-50 disabled:text-slate-400"
            required
            disabled={!isWasteEditable}
          />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-600">Calculated Balance</span>
          <span className={`text-lg font-bold ${(formData.grn - formData.dispatched - formData.waste) < 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {(formData.grn - formData.dispatched - formData.waste).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-slate-600">Utilization %</span>
          <span className="text-lg font-bold text-indigo-600">
            {formData.grn > 0 ? (((formData.dispatched + formData.waste) / formData.grn) * 100).toFixed(2) : '0.00'}%
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full h-12 shadow-indigo-100 shadow-xl"
      >
        {isSubmitting ? (
          <>Saving...</>
        ) : (
          <>
            <Save size={18} />
            {initialData ? 'Update Record' : 'Create Record'}
          </>
        )}
      </button>
    </form>
  );
};
