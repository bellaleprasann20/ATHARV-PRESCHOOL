import { useState, useEffect } from 'react';
import { getMonthlyReport, getClassWiseReport, getDefaulters, exportReport } from '../../api/reportApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell, PieChart, Pie
} from 'recharts';
import { Download, TrendingUp, Users, AlertCircle, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CLASS_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#F43F5E'];

const ReportsPage = () => {
  const [tab, setTab] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'monthly') {
          const res = await getMonthlyReport({ year });
          const months = res.data?.data?.months;
          setMonthlyData(Array.isArray(months) ? months.map(m => ({
            name: MONTHS[m.month - 1],
            Total: m.total,
            Cash: m.cash || 0,
            Online: m.online || 0,
            count: m.count,
          })) : []);
        } else if (tab === 'class') {
          const res = await getClassWiseReport();
          setClassData(Array.isArray(res.data?.data) ? res.data.data : []);
        } else if (tab === 'defaulters') {
          const res = await getDefaulters();
          setDefaulters(Array.isArray(res.data?.data) ? res.data.data : []);
        }
      } catch { toast.error('Failed to load report.'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [tab, year]);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const res = await exportReport({ type });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch { toast.error('Export failed.'); }
    finally { setExporting(''); }
  };

  const totalCollection = monthlyData.reduce((s, m) => s + m.Total, 0);
  const bestMonth = monthlyData.reduce((best, m) => m.Total > (best?.Total || 0) ? m : best, null);

  const TABS = [
    { key: 'monthly', label: '📅 Monthly', icon: TrendingUp },
    { key: 'class', label: '🏫 Class-wise', icon: Users },
    { key: 'defaulters', label: '⚠️ Defaulters', icon: AlertCircle },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Financial insights and summaries</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Payments', type: 'payments' },
            { label: 'Defaulters', type: 'defaulters' },
            { label: 'Students', type: 'students' },
          ].map(({ label, type }) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              disabled={!!exporting}
              className="flex items-center gap-2 px-3 py-2 border-2 border-green-200 text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              {exporting === type ? 'Exporting...' : `Export ${label}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.key ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-20 text-center text-gray-400">Loading report...</div>
      ) : (
        <>
          {/* MONTHLY TAB */}
          {tab === 'monthly' && (
            <div className="space-y-5">
              {/* Year selector + summary */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-600">Year:</label>
                  <select value={year} onChange={e => setYear(Number(e.target.value))}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none">
                    {[2022, 2023, 2024, 2025].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                {totalCollection > 0 && (
                  <div className="flex gap-4">
                    <div className="bg-indigo-50 rounded-xl px-4 py-2">
                      <p className="text-xs text-indigo-500 font-bold">Total {year}</p>
                      <p className="font-black text-indigo-700">₹{totalCollection.toLocaleString('en-IN')}</p>
                    </div>
                    {bestMonth && bestMonth.Total > 0 && (
                      <div className="bg-green-50 rounded-xl px-4 py-2">
                        <p className="text-xs text-green-500 font-bold">Best Month</p>
                        <p className="font-black text-green-700">{bestMonth.name} — ₹{bestMonth.Total.toLocaleString('en-IN')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">Monthly Fee Collection — {year}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v, name) => [`₹${Number(v).toLocaleString('en-IN')}`, name]} />
                    <Legend />
                    <Bar dataKey="Cash" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Online" fill="#34D399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">Collection Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Total']} />
                    <Line type="monotone" dataKey="Total" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b"><h3 className="font-bold text-gray-700">Month-wise Summary</h3></div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Month</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Cash</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Online</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Payments</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {monthlyData.map(m => (
                      <tr key={m.name} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-semibold text-gray-700">{m.name} {year}</td>
                        <td className="px-5 py-3 text-right text-gray-600">₹{m.Cash?.toLocaleString('en-IN') || 0}</td>
                        <td className="px-5 py-3 text-right text-gray-600">₹{m.Online?.toLocaleString('en-IN') || 0}</td>
                        <td className="px-5 py-3 text-right text-gray-500">{m.count || 0}</td>
                        <td className="px-5 py-3 text-right font-bold text-indigo-700">₹{m.Total?.toLocaleString('en-IN') || 0}</td>
                      </tr>
                    ))}
                    <tr className="bg-indigo-50 font-bold">
                      <td className="px-5 py-3 text-indigo-800">TOTAL</td>
                      <td className="px-5 py-3 text-right text-indigo-800">₹{monthlyData.reduce((s, m) => s + m.Cash, 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-right text-indigo-800">₹{monthlyData.reduce((s, m) => s + m.Online, 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-right text-indigo-600">{monthlyData.reduce((s, m) => s + m.count, 0)}</td>
                      <td className="px-5 py-3 text-right text-indigo-800 text-base">₹{totalCollection.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CLASS-WISE TAB */}
          {tab === 'class' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {classData.map((c, i) => (
                  <div key={c.class} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-3"
                      style={{ background: CLASS_COLORS[i % CLASS_COLORS.length] }}>
                      {c.class[0]}
                    </div>
                    <p className="font-black text-gray-800">{c.class}</p>
                    <p className="text-xs text-gray-400 mb-2">{c.studentCount} students</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600 font-semibold">Collected</span>
                        <span className="font-bold">₹{c.collected?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-500 font-semibold">Pending</span>
                        <span className="font-bold">₹{c.pending?.toLocaleString('en-IN') || 0}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {c.collected + c.pending > 0 && (
                      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (c.collected / (c.collected + c.pending)) * 100).toFixed(0)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">Collection vs Pending by Class</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={classData.map(c => ({ name: c.class, Collected: c.collected || 0, Pending: c.pending || 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
                    <Legend />
                    <Bar dataKey="Collected" fill="#34D399" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#FC9191" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* DEFAULTERS TAB */}
          {tab === 'defaulters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <p className="text-sm font-bold text-red-700">⚠️ {defaulters.length} students with pending dues</p>
                </div>
                <button onClick={() => handleExport('defaulters')} disabled={!!exporting}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                  <Download size={14} /> Export List
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">#</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Class</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Phone</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Overdue Months</th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Amount Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {defaulters.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-green-500 font-semibold">🎉 No defaulters! All fees are up to date.</td></tr>
                    ) : defaulters.map((d, i) => (
                      <tr key={d.student._id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-5 py-3.5 text-gray-400 font-semibold">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-800">{d.student.name}</p>
                          <p className="text-xs text-gray-400">{d.student.admissionNo}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{d.student.class}</span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 text-xs">{d.student.phone}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="bg-red-100 text-red-700 font-bold text-xs px-2.5 py-1 rounded-full">{d.overdueMonths} month{d.overdueMonths > 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-red-600">₹{d.totalOverdue?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;