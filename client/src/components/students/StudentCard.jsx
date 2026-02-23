import { GraduationCap, ArrowRight, CheckCircle, AlertCircle, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const CLASS_COLORS = {
  Nursery: 'from-purple-500 to-violet-600',
  LKG:     'from-orange-400 to-amber-500',
  UKG:     'from-teal-500 to-emerald-600',
  Daycare: 'from-blue-500 to-indigo-600',
};

const STATUS_STYLES = {
  active:      { label: 'Active',      dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
  inactive:    { label: 'Inactive',    dot: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-100' },
  transferred: { label: 'Transferred', dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  passed_out:  { label: 'Passed Out',  dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50' },
};

/**
 * StudentCard
 * @prop {object}  student              – full student document from MongoDB
 * @prop {'admin'|'parent'} type        – controls action button
 * @prop {'paid'|'pending'|'partial'} [feeStatus] – optional fee badge
 * @prop {function} [onEdit]            – optional override for edit click
 */
const StudentCard = ({ student, type = 'admin', feeStatus, onEdit }) => {
  if (!student) return null;

  const {
    _id          = '',
    firstName    = '',
    lastName     = '',
    admissionNo  = '',
    class: cls   = '',
    section      = '',
    status       = 'active',
    photo        = '',
    fatherName   = '',
    motherName   = '',
    guardianPhone = '',
    gender       = '',
    age,
  } = student;

  const initials      = `${firstName[0] || '?'}${lastName[0] || ''}`.toUpperCase();
  const guardianName  = fatherName || motherName || '—';
  const avatarGradient = CLASS_COLORS[cls] || 'from-indigo-500 to-purple-600';
  const statusStyle   = STATUS_STYLES[status] || STATUS_STYLES.active;
  const photoUrl      = photo
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${photo}`
    : null;

  const feeMap = {
    paid:    { icon: CheckCircle, color: 'bg-green-500',  label: 'No Dues',  badge: 'bg-green-50  text-green-700'  },
    partial: { icon: AlertCircle, color: 'bg-yellow-500', label: 'Partial',  badge: 'bg-yellow-50 text-yellow-700' },
    pending: { icon: AlertCircle, color: 'bg-red-500',    label: 'Pending',  badge: 'bg-red-50    text-red-600'    },
  };
  const fee = feeStatus ? feeMap[feeStatus] : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">

      {/* ── Top: avatar + name + admission no ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-lg font-black shadow-inner overflow-hidden`}>
              {photoUrl
                ? <img src={photoUrl} alt={firstName} className="w-full h-full object-cover" />
                : initials}
            </div>

            {/* Fee dot — only when feeStatus is provided */}
            {fee && (
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${fee.color}`}>
                <fee.icon size={10} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Name + class */}
          <div>
            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
              {firstName} {lastName}
            </h3>
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
              <GraduationCap size={13} className="text-indigo-400" />
              {cls}{section ? ` – ${section}` : ''}
              {(age || gender) && <span className="text-slate-300 mx-0.5">·</span>}
              {age && <span>{age}y</span>}
              {gender && <span>{gender === 'male' ? '♂' : gender === 'female' ? '♀' : ''}</span>}
            </p>
          </div>
        </div>

        {/* Admission No */}
        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg flex-shrink-0">
          {admissionNo || `#${_id.slice(-6).toUpperCase()}`}
        </span>
      </div>

      {/* ── Middle: guardian + status badges ── */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
            <User size={10} /> Guardian
          </p>
          <p className="text-xs font-semibold text-slate-700 truncate">{guardianName}</p>
          {guardianPhone && (
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Phone size={9} /> {guardianPhone}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Student status */}
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>

          {/* Fee status */}
          {fee && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fee.badge}`}>
              {fee.label}
            </span>
          )}
        </div>
      </div>

      {/* ── Action button ── */}
      {type === 'admin' ? (
        <Link
          to={`/admin/students/${_id}/edit`}
          onClick={onEdit}
          className="w-full py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 no-underline"
        >
          Manage Profile <ArrowRight size={15} />
        </Link>
      ) : (
        <Link
          to="/parent/fees"
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 no-underline"
        >
          View Fee Details <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
};

export default StudentCard;