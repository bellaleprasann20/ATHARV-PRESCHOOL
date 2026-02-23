import { Search, SlidersHorizontal } from 'lucide-react';

const StudentSearch = ({ onSearch, onFilter }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by name, parent name or ID..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <select 
          className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none"
          onChange={(e) => onFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          <option value="Playgroup">Playgroup</option>
          <option value="Nursery">Nursery</option>
          <option value="LKG">LKG</option>
          <option value="UKG">UKG</option>
        </select>
        <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">
          <SlidersHorizontal size={18} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
};

export default StudentSearch;