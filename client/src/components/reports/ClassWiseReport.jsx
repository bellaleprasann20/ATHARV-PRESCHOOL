const ClassWiseReport = ({ classData }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-bold text-slate-800 text-sm">Class-wise Collection</h3>
      </div>
      <table className="w-full text-left">
        <thead className="bg-white text-[10px] uppercase text-slate-400 font-bold border-b">
          <tr>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Students</th>
            <th className="px-4 py-3">Collected</th>
            <th className="px-4 py-3">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {classData.map((item) => (
            <tr key={item.className} className="hover:bg-slate-50 transition">
              <td className="px-4 py-3 text-sm font-bold text-slate-700">{item.className}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{item.studentCount}</td>
              <td className="px-4 py-3 text-sm text-green-600 font-medium">₹{item.collected.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-red-500 font-medium">₹{item.due.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassWiseReport;