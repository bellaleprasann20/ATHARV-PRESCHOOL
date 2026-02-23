import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const PaymentTable = ({ payments }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Ref No.</th>
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Method</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((p) => (
            <tr key={p._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-xs text-slate-500">#{p.transactionId}</td>
              <td className="px-6 py-4">
                <p className="font-medium text-slate-800">{p.studentName}</p>
                <p className="text-xs text-slate-400">Class: {p.class}</p>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{formatDate(p.createdAt)}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{p.method}</td>
              <td className="px-6 py-4 font-bold text-slate-900">₹{p.amount}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(p.status)}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <FileText size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;