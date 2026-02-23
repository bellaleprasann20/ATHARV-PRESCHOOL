import { useForm } from 'react-hook-form';

const PaymentForm = ({ onSubmit, defaultAmount }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: { amount: defaultAmount, method: 'Cash' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount Paid</label>
        <input 
          {...register('amount')} 
          type="number" 
          className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
        <select {...register('method')} className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none">
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
          <option value="UPI">UPI (Manual)</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transaction Ref / Remarks</label>
        <textarea 
          {...register('remarks')} 
          className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none h-20"
          placeholder="Cheque number or UTR ID..."
        />
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-black transition">
        Record Offline Payment
      </button>
    </form>
  );
};

export default PaymentForm;