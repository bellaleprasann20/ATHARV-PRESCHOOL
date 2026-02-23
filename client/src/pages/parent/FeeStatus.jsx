import React, { useState, useEffect } from 'react';
import { IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import FeeBreakdown from '../../components/fees/FeeBreakdown';
import axios from '../../api/axios';

const FeeStatusPage = () => {
  const [feeData, setFeeData] = useState([]);

  useEffect(() => {
    const fetchFees = async () => {
      const res = await axios.get('/parent/fees-summary');
      setFeeData(res.data);
    };
    fetchFees();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Fee Status</h1>
      
      {feeData.map((child) => (
        <div key={child.studentId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {child.studentName[0]}
              </div>
              <h2 className="font-bold text-slate-800">{child.studentName}'s Fees</h2>
            </div>
            <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${child.pending === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {child.pending === 0 ? 'Fully Paid' : 'Dues Pending'}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeeBreakdown items={child.structure} total={child.total} />
            <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col justify-center">
              <p className="text-blue-100 text-sm font-semibold uppercase">Current Pending</p>
              <h3 className="text-4xl font-bold mt-2">₹{child.pending.toLocaleString()}</h3>
              {child.pending > 0 && (
                <button className="mt-6 w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition">
                  Pay Balance Online
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeeStatusPage;