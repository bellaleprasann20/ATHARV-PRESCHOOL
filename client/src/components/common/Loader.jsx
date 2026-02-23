/**
 * Loader — Spinner component
 *
 * Props:
 *   fullScreen  {boolean}  — covers entire viewport with white overlay
 *   size        {string}   — 'sm' | 'md' | 'lg'
 *   text        {string}   — optional label below spinner (pass false to hide)
 *   inline      {boolean}  — no padding, just the spinner itself
 */
const Loader = ({ fullScreen = false, size = 'md', text = 'Loading...', inline = false }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-400 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-[100]">
        {spinner}
      </div>
    );
  }

  if (inline) return spinner;

  return (
    <div className="flex items-center justify-center py-16 w-full">
      {spinner}
    </div>
  );
};

export default Loader;