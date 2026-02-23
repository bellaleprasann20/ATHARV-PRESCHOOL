import { Edit2, Eye, Trash2, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentTable = ({ students, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b">
          <tr>
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4">Class</th>
            <th className="px-6 py-4">Parent</th>
            <th className="px-6 py-4">Fee Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {students.map((student) => (
            <tr key={student._id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {student.firstName[0]}
                  </div>
                  <span className="font-semibold text-slate-800">{student.firstName} {student.lastName}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-600">{student.enrollmentClass}</td>
              <td className="px-6 py-4">
                <p className="text-slate-800">{student.parentName}</p>
                <p className="text-xs text-slate-400">{student.parentPhone}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  student.feeStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {student.feeStatus}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link to={`/admin/fees/collect?id=${student._id}`} title="Collect Fee" className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                    <IndianRupee size={16} />
                  </Link>
                  <Link to={`/admin/students/edit/${student._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 size={16} />
                  </Link>
                  <button onClick={() => onDelete(student._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;