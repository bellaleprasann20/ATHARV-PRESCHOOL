import { AlertCircle } from 'lucide-react';

const DueAlertBanner = ({ count }) => {
  if (!count) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 mb-6">
      <div className="bg-amber-100 p-2 rounded-full text-amber-600">
        <AlertCircle size={20} />
      </div>
      <div className="flex-1">
        <p className="text-amber-800 text-sm font-medium">
          Attention: {count} students have overdue fee payments for this month.
        </p>
      </div>
      <button className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition">
        Send Reminders
      </button>
    </div>
  );
};

export default DueAlertBanner;