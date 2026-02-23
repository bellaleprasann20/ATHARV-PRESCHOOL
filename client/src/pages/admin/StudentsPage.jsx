import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStudents, deleteStudent } from '../../api/studentApi';
import toast from 'react-hot-toast';
import {
  UserPlus, Search, Filter, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, Download, RefreshCw
} from 'lucide-react';

const CLASSES = ['All', 'Nursery', 'LKG', 'UKG', 'Daycare'];
const STATUS_OPTS = ['All', 'active', 'inactive', 'transferred'];

const Badge = ({ text, color }) => {
  const colors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    transferred: 'bg-yellow-100 text-yellow-700',
    male: 'bg-blue-100 text-blue-700',
    female: 'bg-pink-100 text-pink-700',
    Nursery: 'bg-purple-100 text-purple-700',
    LKG: 'bg-orange-100 text-orange-700',
    UKG: 'bg-teal-100 text-teal-700',
    Daycare: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors[text] || 'bg-gray-100 text-gray-600'}`}>
      {text}
    </span>
  );
};

const StudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [deleting, setDeleting] = useState(null);
  const LIMIT = 10;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (classFilter !== 'All') params.class = classFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await getStudents(params);
      const data = res.data?.data;
      setStudents(Array.isArray(data) ? data : []);
      setMeta(res.data?.meta || { total: 0, pages: 1 });
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [page, search, classFilter, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search, classFilter, statusFilter]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate ${name}? They won't appear in active lists.`)) return;
    setDeleting(id);
    try {
      await deleteStudent(id);
      toast.success(`${name} deactivated.`);
      fetchStudents();
    } catch {
      toast.error('Failed to deactivate student.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-sm text-gray-400 mt-0.5">{meta.total} total students</p>
        </div>
        <Link
          to="/admin/students/add"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <UserPlus size={16} /> Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, admission no, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 outline-none"
          />
        </div>

        {/* Class filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {CLASSES.map(c => (
            <button
              key={c}
              onClick={() => setClassFilter(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${classFilter === c ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-indigo-400 outline-none"
        >
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        <button onClick={fetchStudents} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Adm. No.</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Class</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Guardian</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">Loading students...</td></tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="text-gray-300 text-5xl mb-3">👦</div>
                    <p className="text-gray-400 font-medium">No students found</p>
                    <Link to="/admin/students/add" className="text-indigo-500 text-sm mt-1 block hover:underline">Add first student →</Link>
                  </td>
                </tr>
              ) : students.map(student => (
                <tr key={student._id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                        {student.photo
                          ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${student.photo}`} className="w-full h-full object-cover" alt="" />
                          : `${student.firstName[0]}${student.lastName[0]}`}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-400">{student.gender} • Age {student.age || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-600 font-semibold">{student.admissionNo}</td>
                  <td className="px-4 py-3.5"><Badge text={student.class} /></td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{student.fatherName || '-'}</td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">{student.guardianPhone}</td>
                  <td className="px-4 py-3.5"><Badge text={student.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/students/${student._id}`)}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/students/${student._id}/edit`)}
                        className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id, `${student.firstName} ${student.lastName}`)}
                        disabled={deleting === student._id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Page {page} of {meta.pages} • {meta.total} students
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg > meta.pages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pg === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-white text-gray-600'}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;