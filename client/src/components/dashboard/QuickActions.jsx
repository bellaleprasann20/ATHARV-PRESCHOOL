import { UserPlus, IndianRupee, FileDown, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    { label: 'New Admission', to: '/admin/students/add', icon: UserPlus, color: 'bg-blue-600' },
    { label: 'Collect Fee', to: '/admin/fees/collect', icon: IndianRupee, color: 'bg-green-600' },
    { label: 'Daily Report', to: '/admin/reports/daily', icon: FileDown, color: 'bg-purple-600' },
    { label: 'Backup Data', to: '/admin/backups', icon: Database, color: 'bg-slate-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.to}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition group"
        >
          <div className={`${action.color} text-white p-3 rounded-lg mb-2 group-hover:scale-110 transition`}>
            <action.icon size={20} />
          </div>
          <span className="text-xs font-semibold text-slate-700">{action.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;