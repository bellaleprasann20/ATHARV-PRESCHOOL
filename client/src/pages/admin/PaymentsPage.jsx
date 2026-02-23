import { useState, useEffect, useCallback } from 'react';
import { getPayments } from '../../api/paymentApi';
import { downloadReceipt } from '../../api/receiptApi';
import toast from 'react-hot-toast';
import { Download, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const MODE_COLORS = { cash: 'bg-green-100 text-green-700', online: 'bg-blue-100 text-blue-700', cheque: 'bg-yellow-100 text-yellow-700', upi: 'bg-purple-100 text-purple-700', bank_transfer: 'bg-gray-100 text-gray-600' };

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [filters, setFilters] = useState({ paymentMode: '', startDate: '', endDate: '', class: '' });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.paymentMode) params.paymentMode = filters.paymentMode;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.class) params.class = filters.class;
      const res = await getPayments(params);
      setPayments(Array.isArray(res.data?.data) ? res.data.data : []);
      setMeta(res.data?.meta || { total: 0, pages: 1 });
    } catch { toast.error('Failed to load payments.'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDownload = async (receiptId, receiptNo) => {
    try {
      const res = await downloadReceipt(receiptId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${receiptNo || receiptId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed.'); }
  };

  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
          <p className="text-sm text-gray-400 mt-0.5">{meta.total} total records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <select value={filters.paymentMode} onChange={e => setFilters(p => ({ ...p, paymentMode: e.target.value }))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none text-gray-600">
          <option value="">All Modes</option>
          {['cash', 'online', 'cheque', 'upi', 'bank_transfer'].map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
        </select>

        <select value={filters.class} onChange={e => setFilters(p => ({ ...p, class: e.target.value }))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none text-gray-600">
          <option value="">All Classes</option>
          {['Nursery', 'LKG', 'UKG', 'Daycare'].map(c => <option key={c}>{c}</option>)}
        </select>

        <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none text-gray-600" />
        <span className="self-center text-gray-300">→</span>
        <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none text-gray-600" />

        <button onClick={() => setFilters({ paymentMode: '', startDate: '', endDate: '', class: '' })}
          className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          Clear
        </button>
        <button onClick={fetchPayments} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 ml-auto"><RefreshCw size={16} /></button>
      </div>

      {/* Summary bar */}
      {payments.length > 0 && (
        <div className="bg-indigo-50 rounded-xl px-4 py-2.5 flex items-center gap-4">
          <p className="text-sm text-indigo-600 font-bold">This page total:</p>
          <p className="text-lg font-black text-indigo-700">₹{totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-indigo-400">({payments.length} payments)</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase">Student</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Receipt No.</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Mode</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">No payments found</td></tr>
              ) : payments.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-800">{p.student?.firstName} {p.student?.lastName}</p>
                    <p className="text-xs text-gray-400">{p.student?.admissionNo} • {p.student?.class}</p>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{p.receipt?.receiptNo || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${MODE_COLORS[p.paymentMode] || 'bg-gray-100 text-gray-600'}`}>
                      {p.paymentMode?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-gray-800">₹{p.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5 text-center">
                    {p.receipt?._id ? (
                      <button onClick={() => handleDownload(p.receipt._id, p.receipt.receiptNo)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Download size={15} />
                      </button>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t bg-gray-50/50">
            <p className="text-xs text-gray-500">Page {page} of {meta.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;