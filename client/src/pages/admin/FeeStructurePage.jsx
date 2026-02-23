import { useState, useEffect } from 'react';
import {
  getFeeStructures, createFeeStructure, updateFeeStructure,
  deleteFeeStructure, assignFee
} from '../../api/feeApi';
import { getStudents } from '../../api/studentApi';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, GraduationCap, UserCheck } from 'lucide-react';

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Daycare', 'All'];

const defaultForm = {
  name: '', class: 'Nursery', academicYear: '2024-2025',
  dueDay: 10, lateFinePerDay: 0,
  feeHeads: [{ name: 'Tuition Fee', amount: '', isMonthly: true, isOptional: false }],
};

const FeeStructurePage = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  // Assign fee state
  const [assignForm, setAssignForm] = useState({ studentId: '', feeStructureId: '', academicYear: '2024-2025', discount: 0, discountReason: '' });
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getFeeStructures();
      setStructures(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error('Failed to load fee structures.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (studentSearch.length >= 2) {
      getStudents({ search: studentSearch, limit: 8 }).then(r => setStudents(r.data.data));
    }
  }, [studentSearch]);

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...item, feeHeads: item.feeHeads.map(h => ({ ...h })) });
    setShowModal(true);
  };

  const addFeeHead = () => setForm(p => ({
    ...p, feeHeads: [...p.feeHeads, { name: '', amount: '', isMonthly: true, isOptional: false }]
  }));

  const removeFeeHead = (i) => setForm(p => ({ ...p, feeHeads: p.feeHeads.filter((_, idx) => idx !== i) }));

  const updateHead = (i, field, value) => setForm(p => ({
    ...p,
    feeHeads: p.feeHeads.map((h, idx) => idx === i ? { ...h, [field]: value } : h)
  }));

  const handleSave = async () => {
    if (!form.name || !form.class) return toast.error('Name and class are required.');
    setSaving(true);
    try {
      if (editItem) {
        await updateFeeStructure(editItem._id, form);
        toast.success('Fee structure updated!');
      } else {
        await createFeeStructure(form);
        toast.success('Fee structure created!');
      }
      setShowModal(false);
      load();
    } catch (e) { toast.error(e.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this fee structure?')) return;
    try { await deleteFeeStructure(id); toast.success('Deactivated.'); load(); }
    catch { toast.error('Failed.'); }
  };

  const handleAssign = async () => {
    if (!assignForm.studentId || !assignForm.feeStructureId) return toast.error('Select student and fee structure.');
    setSaving(true);
    try {
      await assignFee(assignForm);
      toast.success('Fee assigned to student!');
      setShowAssignModal(false);
      setAssignForm({ studentId: '', feeStructureId: '', academicYear: '2024-2025', discount: 0, discountReason: '' });
    } catch (e) { toast.error(e.message || 'Failed to assign.'); }
    finally { setSaving(false); }
  };

  const totalMonthly = (heads) => heads.filter(h => h.isMonthly).reduce((s, h) => s + Number(h.amount || 0), 0);
  const totalOneTime = (heads) => heads.filter(h => !h.isMonthly).reduce((s, h) => s + Number(h.amount || 0), 0);

  const classColors = { Nursery: 'bg-purple-100 text-purple-700', LKG: 'bg-orange-100 text-orange-700', UKG: 'bg-teal-100 text-teal-700', Daycare: 'bg-indigo-100 text-indigo-700', All: 'bg-gray-100 text-gray-700' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fee Structure</h1>
          <p className="text-sm text-gray-400 mt-0.5">Define fee heads for each class</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            <UserCheck size={16} /> Assign to Student
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            <Plus size={16} /> New Structure
          </button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : structures.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <div className="text-6xl mb-3">💰</div>
          <p className="font-bold text-gray-600 mb-1">No Fee Structures Yet</p>
          <p className="text-sm text-gray-400 mb-4">Create fee structures for each class</p>
          <button onClick={openAdd} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold">Create First Structure</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {structures.map(s => (
            <div key={s._id} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${!s.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${classColors[s.class]}`}>{s.class}</span>
                    {!s.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <h3 className="font-black text-gray-800">{s.name}</h3>
                  <p className="text-xs text-gray-400">{s.academicYear} • Due on {s.dueDay}th</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Fee heads */}
              <div className="space-y-1.5 mb-4">
                {s.feeHeads.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${h.isMonthly ? 'bg-green-400' : 'bg-orange-400'}`} />
                      {h.name} {h.isOptional && <span className="text-xs text-gray-400">(opt)</span>}
                    </span>
                    <span className="font-semibold text-gray-800">₹{Number(h.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex justify-between">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Monthly</p>
                  <p className="font-black text-indigo-700">₹{totalMonthly(s.feeHeads).toLocaleString('en-IN')}</p>
                </div>
                {totalOneTime(s.feeHeads) > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-400">One-time</p>
                    <p className="font-black text-orange-600">₹{totalOneTime(s.feeHeads).toLocaleString('en-IN')}</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-400">Annual</p>
                  <p className="font-black text-green-700">₹{(totalMonthly(s.feeHeads) * 12).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-lg text-gray-800">{editItem ? 'Edit Fee Structure' : 'New Fee Structure'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Structure Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Nursery Standard 2024"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Class *</label>
                  <select value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none bg-white">
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Academic Year</label>
                  <select value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none bg-white">
                    {['2023-2024', '2024-2025', '2025-2026'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Due Date (Day of Month)</label>
                  <input type="number" min={1} max={28} value={form.dueDay}
                    onChange={e => setForm(p => ({ ...p, dueDay: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>

              {/* Fee Heads */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Fee Heads</label>
                  <button onClick={addFeeHead}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={12} /> Add Head
                  </button>
                </div>

                <div className="space-y-2">
                  {form.feeHeads.map((head, i) => (
                    <div key={i} className="flex gap-2 items-center p-3 bg-gray-50 rounded-xl">
                      <input value={head.name} onChange={e => updateHead(i, 'name', e.target.value)}
                        placeholder="Fee head name" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none bg-white" />
                      <input type="number" value={head.amount} onChange={e => updateHead(i, 'amount', e.target.value)}
                        placeholder="Amount" className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none bg-white" />
                      <select value={head.isMonthly} onChange={e => updateHead(i, 'isMonthly', e.target.value === 'true')}
                        className="px-2 py-2 border border-gray-200 rounded-lg text-xs focus:border-indigo-400 outline-none bg-white">
                        <option value="true">Monthly</option>
                        <option value="false">One-time</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <input type="checkbox" checked={head.isOptional} onChange={e => updateHead(i, 'isOptional', e.target.checked)} />
                        Opt.
                      </label>
                      {form.feeHeads.length > 1 && (
                        <button onClick={() => removeFeeHead(i)} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-indigo-50 rounded-xl flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Total: <strong className="text-indigo-700">₹{totalMonthly(form.feeHeads).toLocaleString('en-IN')}</strong></span>
                  <span className="text-gray-600">Annual: <strong className="text-green-700">₹{(totalMonthly(form.feeHeads) * 12).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-60">
                {saving ? 'Saving...' : editItem ? 'Update Structure' : 'Create Structure'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Fee Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-black text-lg text-gray-800">Assign Fee to Student</h2>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Search Student</label>
                <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Type name or admission no..."
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none" />
                {students.length > 0 && (
                  <div className="mt-1 border rounded-xl overflow-hidden">
                    {students.map(s => (
                      <button key={s._id} onClick={() => { setAssignForm(p => ({ ...p, studentId: s._id })); setStudentSearch(`${s.firstName} ${s.lastName} (${s.admissionNo})`); setStudents([]); }}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm border-b last:border-0">
                        <span className="font-semibold">{s.firstName} {s.lastName}</span>
                        <span className="text-gray-400 ml-2 text-xs">{s.admissionNo} • {s.class}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Fee Structure</label>
                <select value={assignForm.feeStructureId} onChange={e => setAssignForm(p => ({ ...p, feeStructureId: e.target.value }))}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none bg-white">
                  <option value="">Select structure</option>
                  {structures.filter(s => s.isActive).map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.class}) — ₹{s.feeHeads?.filter(h => h.isMonthly).reduce((sum, h) => sum + Number(h.amount), 0).toLocaleString('en-IN')}/mo</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Discount (%)</label>
                  <input type="number" min={0} max={100} value={assignForm.discount}
                    onChange={e => setAssignForm(p => ({ ...p, discount: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Discount Reason</label>
                  <input value={assignForm.discountReason}
                    onChange={e => setAssignForm(p => ({ ...p, discountReason: e.target.value }))}
                    placeholder="e.g. sibling discount"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Cancel</button>
              <button onClick={handleAssign} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-60">
                {saving ? 'Assigning...' : '✅ Assign Fee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructurePage;