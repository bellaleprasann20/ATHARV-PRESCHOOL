import React, { useState } from 'react';
import { 
  Settings, 
  School, 
  CreditCard, 
  Bell, 
  Lock, 
  Save, 
  RefreshCw 
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import axios from '../../api/axios';

const SettingsPage = () => {
  const { notifySuccess, notifyError } = useToast();
  const [activeTab, setActiveTab] = useState('school');
  const [loading, setLoading] = useState(false);

  // Form State
  const [settings, setSettings] = useState({
    schoolName: 'Atharv Preschool',
    address: '123 Education Lane, Learning City',
    contactEmail: 'admin@atharv.edu',
    academicYear: '2025-26',
    razorpayKeyId: 'rzp_test_XXXXXXXXXXXX',
    razorpaySecret: '••••••••••••••••',
    notifNewPayment: true,
    notifAdmission: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // await axios.put('/admin/settings', settings);
      setTimeout(() => { // Simulating API call
        notifySuccess("Settings updated successfully!");
        setLoading(false);
      }, 1000);
    } catch (err) {
      notifyError("Failed to save changes.");
      setLoading(false);
    }
  };

  const inputClass = "w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-sm text-slate-500">Manage school profiles and payment configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('school')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${activeTab === 'school' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <School size={18} /> School Profile
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${activeTab === 'payments' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <CreditCard size={18} /> Payment Gateway
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={18} /> Notifications
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          {activeTab === 'school' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-4">School Profile</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>School Name</label>
                  <input name="schoolName" value={settings.schoolName} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Residential Address</label>
                  <textarea name="address" rows="3" value={settings.address} onChange={handleInputChange} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input name="contactEmail" type="email" value={settings.contactEmail} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Active Academic Year</label>
                    <select name="academicYear" value={settings.academicYear} onChange={handleInputChange} className={inputClass}>
                      <option>2024-25</option>
                      <option>2025-26</option>
                      <option>2026-27</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-4">Razorpay Configuration</h3>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-amber-700 text-sm">
                <Lock size={24} className="shrink-0" />
                <p>Ensure these keys match your Razorpay Dashboard. Never share your <b>Secret Key</b> with anyone.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Razorpay Key ID</label>
                  <input name="razorpayKeyId" value={settings.razorpayKeyId} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Razorpay Secret</label>
                  <input name="razorpaySecret" type="password" value={settings.razorpaySecret} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-4">Alert Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-semibold text-slate-700">Payment Confirmations</p>
                    <p className="text-xs text-slate-500">Receive email alerts for every successful payment.</p>
                  </div>
                  <input type="checkbox" name="notifNewPayment" checked={settings.notifNewPayment} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-semibold text-slate-700">New Admissions</p>
                    <p className="text-xs text-slate-500">Alert me when a student registers online.</p>
                  </div>
                  <input type="checkbox" name="notifAdmission" checked={settings.notifAdmission} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;