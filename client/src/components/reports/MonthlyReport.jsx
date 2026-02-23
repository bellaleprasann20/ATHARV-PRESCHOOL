import { TrendingUp, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const MonthlyReport = ({ data }) => {
  // data: { totalExpected, totalCollected, monthName }
  const collectionRate = ((data.totalCollected / data.totalExpected) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Monthly Revenue Summary</h3>
          <p className="text-sm text-slate-500">Report for {data.monthName} 2026</p>
        </div>
        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <TrendingUp size={14} /> {collectionRate}% Collected
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Collection Progress</span>
            <span className="font-bold text-slate-700">{formatCurrency(data.totalCollected)} / {formatCurrency(data.totalExpected)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${collectionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Pending</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(data.totalExpected - data.totalCollected)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Transactions</p>
            <p className="text-lg font-bold text-slate-800">{data.transactionCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;