import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getParentProfile, getParentFees } from '../../api/feeApi';
import {
  CreditCard, Receipt, Phone, Bell,
  AlertCircle, CheckCircle, BookOpen, Calendar,
  User, GraduationCap,
} from 'lucide-react';

const MONTHS_SHORT = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const NOTICES = [
  { date:'Dec 20', tag:'🎉', msg:'Annual Day celebration on December 25th. All parents are invited!' },
  { date:'Dec 15', tag:'🏖️', msg:'Winter vacation from Dec 24 to Jan 2. School reopens on Jan 3.' },
  { date:'Dec 10', tag:'💰', msg:'Fee reminder: Please pay fees before 10th of every month to avoid late fines.' },
  { date:'Dec 5',  tag:'📚', msg:'Parent-teacher meeting scheduled for December 22nd at 10 AM.' },
];

const QUICK_ACTIONS = [
  { to:'/parent/fees',     icon:CreditCard, label:'Fee Status',  desc:'View dues',        color:'bg-indigo-50 text-indigo-600' },
  { to:'/parent/pay',      icon:BookOpen,   label:'Pay Online',  desc:'Razorpay / UPI',   color:'bg-green-50 text-green-600'   },
  { to:'/parent/receipts', icon:Receipt,    label:'My Receipts', desc:'Download PDF',     color:'bg-orange-50 text-orange-600' },
  { to:'#',                icon:Phone,      label:'Contact Us',  desc:'+91 98765 43210',  color:'bg-purple-50 text-purple-600' },
];

// ── Child fee card ────────────────────────────────────────────
const ChildCard = ({ child, feeData }) => {
  const monthlyStatus = feeData?.monthlyStatus || [];
  const pending = monthlyStatus.filter(m => m.status === 'pending' || m.status === 'partial');
  const totalDue = pending.reduce(
    (s, m) => s + ((m.dueAmount || 0) - (m.paidAmount || 0) + (m.lateFine || 0)), 0
  );
  const allClear = totalDue === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Child header */}
      <div className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
          {child.photo
            ? <img src={child.photo} className="w-full h-full object-cover rounded-2xl" alt="" />
            : `${child.firstName?.[0] || ''}${child.lastName?.[0] || ''}`}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-800 text-base truncate">
            {child.firstName} {child.lastName}
          </p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <GraduationCap size={11} /> {child.class} – {child.section || 'A'}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <User size={11} /> {child.admissionNo}
            </span>
          </div>
        </div>
        {/* Fee badge */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-black flex-shrink-0 ${
          allClear ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {allClear ? '✅ Paid' : `₹${totalDue.toLocaleString('en-IN')} due`}
        </div>
      </div>

      {/* Pending months */}
      {pending.length > 0 && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs font-black text-red-700 uppercase tracking-wide flex items-center gap-1 mb-3">
            <AlertCircle size={12} /> Pending Months
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {pending.slice(0, 5).map(m => (
              <span key={`${m.month}-${m.year}`}
                className="text-xs bg-white border border-red-200 text-red-700 font-bold px-2 py-0.5 rounded-full">
                {MONTHS_SHORT[m.month]} {m.year}
              </span>
            ))}
            {pending.length > 5 && (
              <span className="text-xs text-red-400 font-bold self-center">+{pending.length - 5} more</span>
            )}
          </div>
          <Link to="/parent/pay"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3 py-2 rounded-xl transition-colors no-underline">
            <CreditCard size={13} /> Pay Now
          </Link>
        </div>
      )}

      {allClear && (
        <div className="mx-4 mb-4 bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
          <p className="text-sm font-bold text-green-700">All fees paid! 🎉</p>
        </div>
      )}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
    <div className="h-20 bg-gray-100 rounded-xl" />
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────
const ParentDashboard = () => {
  const { user } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [feeData,  setFeeData]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Use parent-specific API — returns only this parent's children
        const profileRes = await getParentProfile();
        const p = profileRes.data?.data;
        setProfile(p);

        // Fetch fee data for all children
        if (p?.children?.length) {
          const feeRes = await getParentFees();
          setFeeData(Array.isArray(feeRes.data?.data) ? feeRes.data.data : []);
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          setError('no-profile');
        } else {
          setError('failed');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const children   = profile?.children || [];
  const totalDueAll = feeData.reduce((total, fd) => {
    const pending = (fd.monthlyStatus || []).filter(m => m.status === 'pending' || m.status === 'partial');
    return total + pending.reduce(
      (s, m) => s + ((m.dueAmount || 0) - (m.paidAmount || 0) + (m.lateFine || 0)), 0
    );
  }, 0);

  // Map fee data by studentId for quick lookup
  const feeMap = {};
  feeData.forEach(fd => { if (fd.student) feeMap[fd.student] = fd; });

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white shadow-lg"
        style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background:'rgba(255,255,255,0.2)' }}>
            👋
          </div>
          <div>
            <h1 className="text-xl font-black">Welcome, {profile?.fatherName || user?.name || 'Parent'}!</h1>
            <p className="text-white/70 text-sm mt-0.5">Atharv Preschool Parent Portal</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Children',      value: loading ? '…' : children.length },
            { label:'Academic Year', value: '2024–25' },
            { label:'Total Due',     value: loading ? '…' : totalDueAll > 0 ? `₹${totalDueAll.toLocaleString('en-IN')}` : '✅ Clear' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3 text-center"
              style={{ background:'rgba(255,255,255,0.15)' }}>
              <p className="font-black text-lg leading-tight">{value}</p>
              <p className="text-xs text-white/60 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={label} to={to}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all no-underline group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3 group-hover:scale-110 transition-transform`}>
              <Icon size={20} />
            </div>
            <p className="font-bold text-gray-800 text-sm">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Children */}
      <div>
        <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-500" /> My Children
        </h2>

        {loading ? (
          <div className="space-y-4"><Skeleton /><Skeleton /></div>
        ) : error === 'no-profile' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-bold text-amber-800">Parent profile not set up yet</p>
            <p className="text-sm text-amber-600 mt-1">
              Please ask the school admin to link your account to your child's record.
            </p>
          </div>
        ) : error === 'failed' ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">❌</p>
            <p className="font-bold text-red-700">Failed to load data</p>
            <p className="text-sm text-red-500 mt-1">Please refresh the page and try again.</p>
          </div>
        ) : children.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">👶</p>
            <p className="font-bold text-gray-500">No children linked to your account</p>
            <p className="text-sm text-gray-400 mt-1">Contact the school admin to link your child.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map(child => (
              <ChildCard key={child._id} child={child} feeData={feeMap[child._id]} />
            ))}
          </div>
        )}
      </div>

      {/* Notice board */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
        <h3 className="font-black text-amber-800 mb-4 flex items-center gap-2">
          <Bell size={16} /> School Notices
        </h3>
        <div className="space-y-0">
          {NOTICES.map((n, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-amber-100 last:border-0">
              <span className="text-lg flex-shrink-0">{n.tag}</span>
              <div>
                <p className="text-sm text-amber-900 leading-relaxed">{n.msg}</p>
                <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-wide">{n.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ParentDashboard;