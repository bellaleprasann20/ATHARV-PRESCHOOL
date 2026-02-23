import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// ── Toast container (render once in App.jsx) ─────────────────
const Toast = () => (
  <Toaster
    position="top-right"
    gutter={8}
    containerStyle={{ top: 80 }}
    toastOptions={{ duration: 3500 }}
  />
);

// ── Helper factories ─────────────────────────────────────────
const make = (borderColor, Icon, iconColor, duration = 3500) => (msg) =>
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-start gap-3 bg-white border-l-4 shadow-lg rounded-xl px-4 py-3
          min-w-[260px] max-w-sm transition-all duration-300
          ${t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        `}
        style={{ borderLeftColor: borderColor }}
      >
        <Icon size={18} className={`${iconColor} flex-shrink-0 mt-0.5`} />
        <p className="text-sm font-semibold text-gray-800 leading-snug">{msg}</p>
      </div>
    ),
    { duration }
  );

export const showSuccess = make('#22C55E', CheckCircle, 'text-green-500');
export const showError   = make('#EF4444', XCircle,     'text-red-500',   5000);
export const showWarning = make('#F59E0B', AlertCircle, 'text-amber-500');
export const showInfo    = make('#6366F1', Info,         'text-indigo-500');

// Shorthand aliases that match react-hot-toast style
export const notify = {
  success: showSuccess,
  error:   showError,
  warning: showWarning,
  info:    showInfo,
};

export default Toast;