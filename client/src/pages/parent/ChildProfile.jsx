import React from 'react';
import { 
  GraduationCap, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  CheckCircle, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const ChildProfile = ({ child }) => {
  // Logic for progress or status
  const isFeeClear = child.feesDue === 0;

  // FIXED: Removed TypeScript type annotation and capitalized Icon for rendering
  const detailRow = (icon, label, value) => {
    const IconComponent = icon; 
    return (
      <div className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-3">
          <div className="text-slate-400">
            <IconComponent size={18} />
          </div>
          <span className="text-sm font-medium text-slate-500">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{value || 'N/A'}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${isFeeClear ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isFeeClear ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {isFeeClear ? 'Fees Cleared' : 'Fees Pending'}
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100">
            {child.firstName?.[0]}{child.lastName?.[0]}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-800">{child.firstName} {child.lastName}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-slate-500">
              <span className="flex items-center gap-1 text-sm font-medium">
                <GraduationCap size={16} className="text-blue-500" /> {child.enrollmentClass}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium uppercase tracking-tighter">
                ID: {child._id?.slice(-6) || 'TEMP'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
              <User size={16} className="text-blue-600" /> Personal Information
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {detailRow(Calendar, "Date of Birth", formatDate(child.dateOfBirth))}
            {detailRow(User, "Gender", child.gender)}
            {detailRow(MapPin, "Home Address", child.address)}
            {detailRow(FileText, "Academic Year", "2025-2026")}
          </div>
        </div>

        {/* School Records / Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
              <Phone size={16} className="text-blue-600" /> Emergency Contact
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {detailRow(User, "Guardian", child.parentName)}
            {detailRow(Phone, "Phone Number", child.parentPhone)}
            {detailRow(FileText, "Email Address", child.email)}
            <div className="p-4 mt-2">
                <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between border border-blue-100">
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase">Current Fees Due</p>
                        <p className="text-xl font-bold text-blue-800">{formatCurrency(child.feesDue)}</p>
                    </div>
                    {!isFeeClear && (
                        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95">
                            Pay Now
                        </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;