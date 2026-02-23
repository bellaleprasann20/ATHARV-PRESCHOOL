import { FileText, Eye } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const ReceiptList = ({ receipts, onView }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          Payment History
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {receipts.map((receipt) => (
          <div key={receipt.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
            <div>
              <p className="text-sm font-bold text-slate-800">{receipt.receiptNo}</p>
              <p className="text-xs text-slate-500">{formatDate(receipt.date)} • {receipt.paymentMethod}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-slate-700">{formatCurrency(receipt.totalAmount)}</span>
              <button 
                onClick={() => onView(receipt)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                title="View Receipt"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>
        ))}
        {receipts.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            No receipts found yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptList;