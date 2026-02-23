import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, CreditCard,
  FileText, Receipt, BarChart3, AlertCircle,
  Database, Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/admin/students',    icon: Users,            label: 'Students'       },
  { to: '/admin/fees',        icon: GraduationCap,    label: 'Fee Structure'  },
  { to: '/admin/collect-fee', icon: CreditCard,       label: 'Collect Fee'    },
  { to: '/admin/payments',    icon: FileText,          label: 'Payments'       },
  { to: '/admin/receipts',    icon: Receipt,           label: 'Receipts'       },
  { to: '/admin/reports',     icon: BarChart3,         label: 'Reports'        },
  { to: '/admin/defaulters',  icon: AlertCircle,       label: 'Defaulters'     },
  { to: '/admin/backup',      icon: Database,          label: 'Backup'         },
  { to: '/admin/settings',    icon: Settings,          label: 'Settings'       },
];

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => `
    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold
    transition-all duration-150 no-underline
    ${isActive
      ? 'bg-white text-indigo-900 shadow-md'
      : 'text-indigo-200 hover:bg-indigo-700/60 hover:text-white'
    }
  `;

  const inner = (
    <aside className="flex flex-col h-full w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-indigo-700/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
            🌟
          </div>
          <div>
            <p className="font-black text-white text-sm leading-tight">Atharv Preschool</p>
            <p className="text-indigo-300 text-xs">Admin Panel</p>
          </div>
        </div>
        {/* Mobile close */}
        <button
          className="lg:hidden p-1 text-indigo-400 hover:text-white"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* User badge */}
      <div className="mx-4 mt-4 p-3 bg-indigo-700/40 rounded-xl flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{user?.name || 'Admin'}</p>
            <p className="text-indigo-300 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={() => setMobileOpen(false)}>
            <Icon size={17} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-indigo-700/60 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all text-sm font-semibold"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop — fixed sidebar */}
      <div className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
        {inner}
      </div>

      {/* Mobile — hamburger button (shown in AdminLayout topbar) */}
      <div className="lg:hidden">
        {/* Trigger button — render this wherever you want the hamburger */}
        <button
          className="fixed top-4 left-4 z-40 p-2 bg-indigo-800 text-white rounded-xl shadow-lg"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {inner}
        </div>
      </div>
    </>
  );
};

export default Sidebar;