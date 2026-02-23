import { Filter } from 'lucide-react';

const PaymentFilter = ({ onFilterChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 mb-6">
      <div className="flex items-center gap-2 text-slate-500 mr-2">
        <Filter size={18} />
        <span className="text-sm font-medium">Filters:</span>
      </div>
      
      <select 
        onChange={(e) => onFilterChange('class', e.target.value)}
        className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Classes</option>
        <option value="Nursery">Nursery</option>
        <option value="LKG">LKG</option>
        <option value="UKG">UKG</option>
      </select>

      <select 
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Status</option>
        <option value="success">Success</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>

      <input 
        type="date"
        onChange={(e) => onFilterChange('date', e.target.value)}
        className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
      />
    </div>
  );
};

export default PaymentFilter;