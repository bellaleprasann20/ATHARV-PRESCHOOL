import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  History, 
  FileText,
  Mail,
  Printer
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const StudentProfile = ({ student, paymentHistory = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // If student data isn't loaded yet, show a placeholder or null
  if (!student) return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;

  // FIXED: Removed TypeScript ': Icon' annotation and capitalized variable for JSX usage
  const infoItem = (IconComponent, label, value) => (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100/50">
      <div className="text-blue-600 mt-1">
        <IconComponent size={18} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-tight">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/30 flex items-center justify-center text-4xl font-bold shadow-lg">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {student.firstName} {student.lastName}
            </h2>
            <div className="text-blue-100 flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {student.enrollmentClass}
              </span>
              <span className="opacity-40">•</span>
              <span className="text-sm font-medium">Roll No: {student.rollNumber || student._id?.slice(-6)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 overflow-x-auto">
        {['overview', 'fees', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2 mb-4 tracking-widest">
                <User size={14} className="text-blue-500" /> Personal Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoItem(Calendar, 'Date of Birth', formatDate(student.dateOfBirth))}
                {infoItem(User, 'Gender', student.gender)}
                <div className="sm:col-span-2">
                  {infoItem(MapPin, 'Address', student.address)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2 mb-4 tracking-widest">
                <Phone size={14} className="text-blue-500" /> Guardian Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoItem(User, 'Parent Name', student.parentName)}
                {infoItem(Phone, 'Phone', student.parentPhone)}
                <div className="sm:col-span-2">
                   {infoItem(Mail, 'Email', student.email)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FEES STATUS */}
        {activeTab === 'fees' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(student.feesPaid || 0)}</p>
              </div>
              <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Pending Due</p>
                <p className="text-2xl font-bold text-rose-700">{formatCurrency(student.feesDue || 0)}</p>
              </div>
              <div className={`p-5 rounded-2xl border shadow-sm ${student.feesDue === 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${student.feesDue === 0 ? 'text-blue-600' : 'text-amber-600'}`}>Current Status</p>
                <p className={`text-2xl font-bold ${student.feesDue === 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                  {student.feesDue === 0 ? 'Fully Paid' : 'Partial Due'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT HISTORY */}
        {activeTab === 'history' && (
          <div className="overflow-hidden border border-slate-100 rounded-xl animate-in slide-in-from-bottom-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Receipt No</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((pay) => (
                      <tr key={pay._id} className="text-sm hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{pay.receiptNo}</td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(pay.date)}</td>
                        <td className="px-6 py-4 uppercase text-[10px] font-bold"><span className="bg-slate-100 px-2 py-1 rounded">{pay.method}</span></td>
                        <td className="px-6 py-4 font-bold text-slate-800">{formatCurrency(pay.amount)}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Print Receipt">
                            <Printer size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                        No payment records found for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;