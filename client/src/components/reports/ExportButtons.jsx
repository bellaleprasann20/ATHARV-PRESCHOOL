import { FileSpreadsheet, FileText, Printer } from 'lucide-react';

const ExportButtons = ({ onExportCSV, onExportPDF, onPrint }) => {
  const btnClass = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm border";
  
  return (
    <div className="flex flex-wrap gap-3">
      <button 
        onClick={onExportCSV}
        className={`${btnClass} bg-green-50 text-green-700 border-green-200 hover:bg-green-100`}
      >
        <FileSpreadsheet size={18} /> Export Excel
      </button>
      
      <button 
        onClick={onExportPDF}
        className={`${btnClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100`}
      >
        <FileText size={18} /> Export PDF
      </button>
      
      <button 
        onClick={onPrint}
        className={`${btnClass} bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100`}
      >
        <Printer size={18} /> Print Report
      </button>
    </div>
  );
};

export default ExportButtons;