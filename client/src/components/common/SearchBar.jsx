import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar — Debounced search input
 *
 * Props:
 *   value       {string}    controlled value
 *   onChange    {function}  called with new string after debounce
 *   placeholder {string}
 *   debounce    {number}    ms delay (default 400)
 *   onClear     {function}  called when X is clicked
 *   className   {string}
 *   autoFocus   {boolean}
 *   disabled    {boolean}
 */
const SearchBar = ({
  value       = '',
  onChange,
  placeholder = 'Search...',
  debounce    = 400,
  onClear,
  className   = '',
  autoFocus   = false,
  disabled    = false,
}) => {
  const [local, setLocal] = useState(value);
  const timer  = useRef(null);
  const ref    = useRef(null);

  // Sync when controlled value changes externally
  useEffect(() => { setLocal(value); }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange?.(v), debounce);
  };

  const handleClear = () => {
    setLocal('');
    clearTimeout(timer.current);
    onChange?.('');
    onClear?.();
    ref.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        ref={ref}
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-9 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white
          focus:border-indigo-500 outline-none transition-colors
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      />
      {local && !disabled && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;