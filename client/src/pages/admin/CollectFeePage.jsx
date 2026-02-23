import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, IndianRupee, User, Wallet, ArrowLeft, Loader2 } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import { useToast } from '../../hooks/useToast';
import FeeCollectionForm from '../../components/fees/FeeCollectionForm';
import FeeBreakdown from '../../components/fees/FeeBreakdown';
import axios from '../../api/axios';

// FIXED: Added curly braces for named imports
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const CollectFeePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get('id');
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { recordManualPayment } = usePayments();
  const { notifySuccess, notifyError } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (studentId) {
      fetchStudentDetails(studentId);
    } else {
      setLoading(false);
    }
  }, [studentId]);

  const fetchStudentDetails = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/students/${id}`);
      
      // Sanitizing data to ensure calculations don't break
      const data = res.data;
      const sanitizedData = {
        ...data,
        pendingAmount: Number(data.pendingAmount || 0),
        totalDue: Number(data.totalDue || 0)
      };
      setStudent(sanitizedData);
    } catch (err) {
      notifyError("Could not find student records.");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (formData) => {
    try {
      await recordManualPayment({
        studentId: student._id,
        ...formData
      });
      
      notifySuccess("Payment processed successfully!");
      
      setTimeout(() => {
        navigate(`/admin/students/${student._id}`);
      }, 1500);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Payment processing failed.";
      notifyError(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <div className="absolute inset-0 blur-2xl bg-blue-400/20 animate-pulse rounded-full"></div>
        </div>
        <p className="mt-4 font-bold uppercase tracking-widest text-xs">Accessing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="group p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Fee Collection</h1>
            <p className="text-sm font-medium text-slate-500">Process manual payments for the 2025-26 term</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-widest flex items-center gap-2">
              <User size={14} className="text-blue-500" /> Account Summary
            </h3>
            
            {student ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-100">
                    {student.firstName?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{student.firstName} {student.lastName}</p>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                      {student.enrollmentClass} <span className="text-slate-300 mx-1">|</span> Roll: {student.rollNumber || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                  <FeeBreakdown 
                    items={student.feeStructure || []} 
                    total={student.totalDue || 0} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Student Selected</p>
              </div>
            )}
          </div>

          {/* Balance Card */}
          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Net Outstanding</p>
            <h2 className="text-4xl font-black tracking-tighter">
              {student ? formatCurrency(student.pendingAmount) : '₹0.00'}
            </h2>
            <div className="mt-8 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Wallet size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Last Activity</p>
                <p className="text-xs font-bold text-white">
                  {student?.lastPaymentDate ? formatDate(student.lastPaymentDate) : 'No recent payments'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Logic */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <IndianRupee size={14} className="text-emerald-500" /> Payment Entry
              </h3>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase">
                Secure Terminal
              </span>
            </div>
            
            <div className="p-8">
              {student ? (
                <FeeCollectionForm 
                  studentName={`${student.firstName} ${student.lastName}`}
                  totalDue={student.pendingAmount}
                  onSubmit={handlePaymentSubmit}
                />
              ) : (
                <div className="py-20 text-center">
                  <p className="text-slate-500 font-medium mb-6">Please enter a valid Student ID to load the billing terminal.</p>
                  <button 
                    onClick={() => navigate('/admin/students')}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                    Return to Directory
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectFeePage;