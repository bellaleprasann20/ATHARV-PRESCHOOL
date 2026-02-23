import { useState, useEffect, useCallback } from 'react';
import { getReceipts, getReceipt, downloadReceipt } from '../../api/receiptApi';
import toast from 'react-hot-toast';
import { Download, Receipt, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await getReceipts(params);
      setReceipts(Array.isArray(res.data?.data) ? res.data.data : []);
      setMeta(res.data?.meta || { total: 0, pages: 1 });
    } catch { toast.error('Failed to load receipts.'); }
    finally { setLoading(false); }
  }, [page, startDate, endDate]);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  const handleDownload = async (id, no) => {
    try {
      const res = await downloadReceipt(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${no}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed.'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receipts</h1>
          <p className="text-sm text-gray-400 mt-0.5">{meta.total} receipts generated</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3 flex-wrap">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none" />
        <span className="self-center text-gray-300">→</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none" />
        <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2">Clear</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase">Receipt No.</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Student</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Mode</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="text-right px-4 py-3.5 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-500 uppercase">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-400">Loading receipts...</td></tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Receipt size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400">No receipts found</p>
                  </td>
                </tr>
              ) : receipts.map(r => (
                <tr key={r._id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-indigo-600">{r.receiptNo}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-800">{r.student?.firstName} {r.student?.lastName}</p>
                    <p className="text-xs text-gray-400">{r.student?.admissionNo} • {r.student?.class}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize">
                      {r.paymentMode}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {new Date(r.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-gray-800">₹{r.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => handleDownload(r._id, r.receiptNo)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors">
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t bg-gray-50/50">
            <p className="text-xs text-gray-500">Page {page} of {meta.pages} • {meta.total} receipts</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsPage;