import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',       to: '/' },
  { label: 'About',      to: '/about' },
  { label: 'Programs',   to: '/#programs' },
  { label: 'Gallery',    to: '/gallery' },
  { label: 'Admissions', to: '/admission' },
  { label: 'Contact',    to: '/contact' },
];

const Navbar = () => {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  const solid  = scrolled || !isHome;
  const navBg  = solid ? 'bg-white shadow-md' : 'bg-transparent';
  const textCl = solid ? 'text-gray-600 hover:text-red-500' : 'text-white hover:text-yellow-300';
  const logoCl = solid ? '#EF4444' : 'white';
  const subCl  = solid ? '#9CA3AF' : 'rgba(255,255,255,0.7)';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`} style={{ height: 68 }}>
      <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-xl shadow">
            🌟
          </div>
          <div>
            <p className="font-black leading-tight text-lg" style={{ fontFamily: "'Fredoka One', cursive", color: logoCl }}>
              Atharv Preschool
            </p>
            <p className="text-xs font-bold tracking-widest" style={{ color: subCl }}>Play&Learn</p>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className={`text-sm font-bold transition-colors no-underline ${textCl}`}>
              {label}
            </Link>
          ))}
          <Link
            to="/login"
            className="bg-gradient-to-r from-red-500 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-black shadow hover:shadow-md transition-shadow no-underline"
          >
            Parent Login →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen
            ? <X size={22} className={solid ? 'text-gray-700' : 'text-white'} />
            : <Menu size={22} className={solid ? 'text-gray-700' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-gray-100 px-5 py-4 space-y-1">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="block py-2.5 text-sm font-bold text-gray-700 hover:text-red-500 no-underline border-b border-gray-50 last:border-0"
            >
              {label}
            </Link>
          ))}
          <Link
            to="/login"
            className="block mt-3 bg-gradient-to-r from-red-500 to-orange-400 text-white text-center py-3 rounded-full text-sm font-black no-underline"
          >
            Parent Login →
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;