import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  paymentMode: z.enum(['Cash', 'Cheque', 'Bank Transfer']),
  referenceNo: z.string().optional(),
  remarks: z.string().max(100).optional(),
});

const FeeCollectionForm = ({ studentName, totalDue, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: totalDue }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
        <p className="text-xs text-blue-600 font-semibold uppercase">Collecting for</p>
        <p className="text-sm font-bold text-slate-800">{studentName}</p>
        <p className="text-sm text-slate-600 mt-1">Total Outstanding: <span className="text-red-600 font-bold">₹{totalDue}</span></p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay</label>
        <input
          type="number"
          {...register('amount', { valueAsNumber: true })}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
        <select {...register('paymentMode')} className="w-full p-2 border rounded-lg outline-none">
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Reference No. (Cheque/UTR)</label>
        <input {...register('referenceNo')} className="w-full p-2 border rounded-lg outline-none" placeholder="Optional" />
      </div>

      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">
        Confirm & Record Payment
      </button>
    </form>
  );
};

export default FeeCollectionForm;