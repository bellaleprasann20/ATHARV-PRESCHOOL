import { AlertCircle, Mail, Phone } from 'lucide-react';

const DefaultersList = ({ defaulters }) => {
  return (
    <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
      <div className="p-4 bg-red-50 flex justify-between items-center border-b border-red-100">
        <h3 className="text-red-800 font-bold flex items-center gap-2">
          <AlertCircle size={18} /> Defaulters List
        </h3>
        <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs font-bold">
          {defaulters.length} Pending
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {defaulters.map((student) => (
          <div key={student._id} className="p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="min-w-[200px]">
              <p className="font-bold text-slate-800">{student.name}</p>
              <p className="text-xs text-slate-500">Parent: {student.parentName} | Class: {student.class}</p>
            </div>
            <div className="text-right">
              <p className="text-red-600 font-bold">Due: ₹{student.dueAmount.toLocaleString()}</p>
              <div className="flex gap-2 mt-2 justify-end">
                <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                  <Phone size={14} />
                </button>
                <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                  <Mail size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefaultersList;