const RecentPayments = ({ payments }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Recent Payments</h3>
        <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-700">{p.studentName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">₹{p.amount}</td>
                <td className="px-4 py-3 text-xs">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Success</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPayments;