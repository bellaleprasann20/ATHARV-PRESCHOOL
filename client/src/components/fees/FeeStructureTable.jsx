import { Edit, Trash2, Plus } from 'lucide-react';

const FeeStructureTable = ({ structures, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Fee Name</th>
            <th className="px-6 py-4">Category/Class</th>
            <th className="px-6 py-4">Amount (₹)</th>
            <th className="px-6 py-4">Frequency</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {structures.map((item) => (
            <tr key={item._id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-medium text-slate-700">{item.name}</td>
              <td className="px-6 py-4 text-slate-600">{item.applicableClass || 'All'}</td>
              <td className="px-6 py-4 text-slate-900 font-bold">₹{item.amount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium uppercase">
                  {item.type} {/* e.g., Monthly, Yearly, One-time */}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                <button onClick={() => onEdit(item)} className="text-slate-400 hover:text-blue-600 transition">
                  <Edit size={18} />
                </button>
                <button onClick={() => onDelete(item._id)} className="text-slate-400 hover:text-red-600 transition">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeeStructureTable;