import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate        = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '', role: 'admin' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Already logged in → redirect
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/parent/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      const dest = userData?.role === 'admin' ? '/admin/dashboard' : '/parent/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const DEMO = [
    { role: 'admin',  email: 'admin@atharvpreschool.in',  label: '👨‍💼 Admin Demo' },
    { role: 'parent', email: 'parent@atharvpreschool.in', label: '👩 Parent Demo' },
  ];

  const fillDemo = (d) => {
    setForm({ email: d.email, password: 'password123', role: d.role });
    setError('');
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap'); .hero-font{font-family:'Fredoka One',cursive}`}</style>

      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#667eea 0%,#764ba2 50%,#FF6B6B 100%)' }}>
        {/* Decorative blobs */}
        {[{s:220,t:'-10%',l:'-10%'},{s:160,t:'60%',l:'65%'},{s:100,t:'30%',l:'40%'}].map(({s,t,l},i)=>(
          <div key={i} className="absolute rounded-full bg-white opacity-5"
            style={{ width:s,height:s,top:t,left:l }} />
        ))}

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🌟</div>
            <div>
              <p className="hero-font text-2xl leading-tight">Atharv Preschool</p>
              <p className="text-white/60 text-xs tracking-widest">& DAYCARE</p>
            </div>
          </div>
          <h2 className="hero-font text-4xl mb-4 leading-tight">Where little dreams grow big 🌱</h2>
          <p className="text-white/80 leading-relaxed">
            Manage admissions, track fees, download receipts, and stay connected — all in one place.
          </p>
        </div>

        {/* Features list */}
        <div className="relative space-y-3">
          {['Fee collection & receipts','Monthly reports & analytics','Parent portal access','Automatic backups'].map(f=>(
            <div key={f} className="flex items-center gap-3 text-sm text-white/90">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</div>
              {f}
            </div>
          ))}
        </div>

        <p className="relative text-white/40 text-xs">© 2024 Atharv Preschool, Pune</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">🌟</div>
            <p className="hero-font text-2xl text-gray-800">Atharv Preschool</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h1 className="hero-font text-3xl text-gray-800 mb-1">Welcome back! 👋</h1>
            <p className="text-gray-400 text-sm mb-7">Sign in to your portal to continue</p>

            {/* Role tabs */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
              {[{ val:'admin', label:'👨‍💼 Admin' }, { val:'parent', label:'👩 Parent' }].map(({ val, label }) => (
                <button key={val}
                  onClick={() => setForm(f => ({ ...f, role: val, email: '', password: '' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                    form.role === val
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input type="email" required autoComplete="email"
                  placeholder={form.role === 'admin' ? 'admin@atharvpreschool.in' : 'parent@atharvpreschool.in'}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors"/>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors"/>
                  <button type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Signing in...
                  </span>
                ) : `Sign In as ${form.role === 'admin' ? 'Admin' : 'Parent'} →`}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400 font-bold mb-3 uppercase tracking-wide">Quick Demo Access</p>
              <div className="flex gap-2">
                {DEMO.map(d => (
                  <button key={d.role} onClick={() => fillDemo(d)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-black text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="text-center text-[10px] text-gray-300 mt-2">Password: password123</p>
            </div>
          </div>

          {/* Back to home */}
          <p className="text-center text-sm text-gray-400 mt-6">
            <Link to="/" className="font-bold text-indigo-500 hover:text-indigo-700 no-underline">← Back to Website</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;