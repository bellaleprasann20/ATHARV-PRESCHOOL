import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X } from 'lucide-react';

// Validation Schema
const schema = z.object({
  name: z.string().min(3, "Fee name must be at least 3 characters"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  type: z.enum(['Monthly', 'Quarterly', 'Yearly', 'One-time']),
  applicableClass: z.string().min(1, "Please select a class or 'All'"),
  description: z.string().optional(),
});

const FeeStructureForm = ({ initialData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: '',
      amount: 0,
      type: 'Monthly',
      applicableClass: 'All',
      description: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Fee Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Fee Name</label>
        <input
          {...register('name')}
          placeholder="e.g., Tuition Fee, Transport, Uniform"
          className={`w-full p-2.5 border rounded-lg outline-none transition ${
            errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
          }`}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 transition"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Frequency/Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Frequency</label>
          <select
            {...register('type')}
            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
            <option value="One-time">One-time</option>
          </select>
        </div>
      </div>

      {/* Applicable Class */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Applicable For</label>
        <select
          {...register('applicableClass')}
          className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
        >
          <option value="All">All Classes</option>
          <option value="Playgroup">Playgroup</option>
          <option value="Nursery">Nursery</option>
          <option value="LKG">LKG</option>
          <option value="UKG">UKG</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
        <textarea
          {...register('description')}
          rows="2"
          className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
          placeholder="Brief details about this fee..."
        ></textarea>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition flex items-center justify-center gap-2"
        >
          <X size={18} /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Save size={18} /> {initialData ? 'Update Fee' : 'Create Fee'}
        </button>
      </div>
    </form>
  );
};

export default FeeStructureForm;