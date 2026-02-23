import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — Table pagination controls
 *
 * Props:
 *   page        {number}    current page (1-based)
 *   totalPages  {number}
 *   total       {number}    total record count
 *   limit       {number}    records per page
 *   onPageChange {function} called with new page number
 */
const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const from = Math.min((page - 1) * limit + 1, total);
  const to   = Math.min(page * limit, total);

  // Show at most 5 page buttons, centered around current page
  const buildPages = () => {
    let start = Math.max(1, page - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const pages = buildPages();

  const Btn = ({ children, onClick, active, disabled, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        min-w-[32px] h-8 px-1.5 rounded-lg text-xs font-bold transition-all
        disabled:opacity-40 disabled:cursor-not-allowed
        ${active
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
          : 'border border-gray-200 text-gray-600 hover:bg-white hover:border-indigo-300'}
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
      {/* Info */}
      <p className="text-xs text-gray-500">
        Showing <span className="font-bold text-gray-700">{from}–{to}</span> of{' '}
        <span className="font-bold text-gray-700">{total}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <Btn onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft size={14} className="mx-auto" />
        </Btn>

        {/* First + ellipsis */}
        {pages[0] > 1 && (
          <>
            <Btn onClick={() => onPageChange(1)}>1</Btn>
            {pages[0] > 2 && <span className="text-gray-300 text-xs px-0.5">…</span>}
          </>
        )}

        {/* Page buttons */}
        {pages.map(p => (
          <Btn key={p} active={p === page} onClick={() => onPageChange(p)}>{p}</Btn>
        ))}

        {/* Last + ellipsis */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-300 text-xs px-0.5">…</span>}
            <Btn onClick={() => onPageChange(totalPages)}>{totalPages}</Btn>
          </>
        )}

        {/* Next */}
        <Btn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
          <ChevronRight size={14} className="mx-auto" />
        </Btn>
      </div>
    </div>
  );
};

export default Pagination;