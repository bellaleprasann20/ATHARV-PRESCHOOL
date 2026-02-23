const DueFeesList = ({ defaulters }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b bg-red-50">
        <h3 className="text-red-700 font-bold text-sm">Fee Defaulters List</h3>
      </div>
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {defaulters.map((student) => (
          <div key={student._id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
            <div>
              <p className="font-bold text-slate-800 text-sm">{student.name}</p>
              <p className="text-xs text-slate-500">Class: {student.class} | Parent: {student.parentName}</p>
            </div>
            <div className="text-right">
              <p className="text-red-600 font-bold text-sm">₹{student.pendingAmount}</p>
              <button className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Remind Parent</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DueFeesList;