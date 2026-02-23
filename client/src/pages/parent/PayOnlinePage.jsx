import React, { useState, useEffect } from 'react';
import OnlinePayment from '../../components/payments/OnlinePayment';
import axios from '../../api/axios';

const PayOnlinePage = () => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const getChildren = async () => {
      const res = await axios.get('/parent/my-children');
      setChildren(res.data);
      if (res.data.length > 0) setSelectedChild(res.data[0]);
    };
    getChildren();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Online Fee Payment</h1>
        <p className="text-slate-500">Securely pay your child's fees using UPI, Card, or Netbanking.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Student</label>
        <div className="flex gap-4">
          {children.map(child => (
            <button
              key={child._id}
              onClick={() => setSelectedChild(child)}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${selectedChild?._id === child._id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <p className="font-bold text-slate-800">{child.firstName}</p>
              <p className="text-xs text-slate-500">{child.enrollmentClass}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedChild && (
        <OnlinePayment 
          amount={selectedChild.feesDue} 
          studentData={selectedChild} 
          onPaymentSuccess={(res) => console.log("Success", res)} 
        />
      )}
    </div>
  );
};

export default PayOnlinePage;