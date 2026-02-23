import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const ReceiptView = ({ receiptData, id = "receipt-content" }) => {
  const { 
    receiptNo, 
    date, 
    studentName, 
    className, 
    parentName, 
    paymentMethod, 
    items, 
    totalAmount 
  } = receiptData;

  return (
    <div id={id} className="bg-white p-8 max-w-2xl mx-auto border shadow-sm font-serif text-slate-800">
      {/* Header */}
      <div className="flex justify-between border-b-2 border-blue-600 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 uppercase">Atharv Preschool</h1>
          <p className="text-xs text-slate-500">123 Education Lane, Learning City</p>
          <p className="text-xs text-slate-500">Contact: +91 98765 43210</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-slate-400 uppercase tracking-widest">Fee Receipt</h2>
          <p className="text-sm font-mono mt-1">No: <span className="text-slate-900 font-bold">{receiptNo}</span></p>
          <p className="text-sm">Date: {formatDate(date)}</p>
        </div>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold">Student Name</p>
          <p className="font-semibold">{studentName}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold">Class</p>
          <p className="font-semibold">{className}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold">Parent/Guardian</p>
          <p className="font-semibold">{parentName}</p>
        </div>
        <div>
          <p className="text-slate-500 uppercase text-[10px] font-bold">Payment Mode</p>
          <p className="font-semibold">{paymentMethod}</p>
        </div>
      </div>

      {/* Fee Table */}
      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-t border-slate-200">
            <th className="py-2 px-2 text-xs uppercase text-slate-500">Description</th>
            <th className="py-2 px-2 text-xs uppercase text-slate-500 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-slate-100">
              <td className="py-3 px-2 text-sm">{item.label}</td>
              <td className="py-3 px-2 text-sm text-right font-mono">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="py-4 px-2 font-bold text-slate-900">Total Paid</td>
            <td className="py-4 px-2 text-right font-bold text-lg text-blue-700 font-mono">
              {formatCurrency(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Note */}
      <div className="mt-12 flex justify-between items-end">
        <div className="text-[10px] text-slate-400 italic">
          * This is a computer-generated receipt and requires no signature.
        </div>
        <div className="text-center">
          <div className="w-32 border-b border-slate-400 mb-1"></div>
          <p className="text-[10px] font-bold uppercase text-slate-500">School Authority</p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;