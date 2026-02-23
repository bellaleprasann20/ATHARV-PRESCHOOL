import { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Info } from 'lucide-react';

/**
 * ConfirmDialog — Lightweight confirmation popup
 *
 * Props:
 *   isOpen        {boolean}
 *   onClose       {function}
 *   onConfirm     {function}
 *   title         {string}
 *   message       {string}
 *   confirmLabel  {string}   default: 'Confirm'
 *   cancelLabel   {string}   default: 'Cancel'
 *   variant       {string}   'danger' | 'warning' | 'info'
 *   loading       {boolean}  disables buttons while processing
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title        = 'Are you sure?',
  message      = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
}) => {
  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const config = {
    danger:  { Icon: Trash2,         ring: 'bg-red-100',    btn: 'bg-red-600 hover:bg-red-700 shadow-red-200',       iconCl: 'text-red-500'    },
    warning: { Icon: AlertTriangle,  ring: 'bg-yellow-100', btn: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200', iconCl: 'text-yellow-500' },
    info:    { Icon: Info,           ring: 'bg-blue-100',   btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200', iconCl: 'text-blue-500'   },
  };
  const { Icon, ring, btn, iconCl } = config[variant] ?? config.danger;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 disabled:opacity-40 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className={`w-16 h-16 ${ring} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
          <Icon size={28} className={iconCl} />
        </div>

        <h3 className="font-black text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-60 transition-all ${btn}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;