import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-14 pb-6 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

      {/* Brand */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-xl">🌟</div>
          <div>
            <p className="font-black text-yellow-400 text-lg leading-tight" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Atharv Preschool
            </p>
            <p className="text-xs text-gray-400 tracking-widest">& DAYCARE</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          A second home where every child shines. Nurturing bright minds since 2010.
        </p>
        <div className="flex gap-3 mt-4">
          {['📘', '📸', '▶️', '💬'].map((icon, i) => (
            <button key={i} className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
        {[
          { label: 'Home',       to: '/' },
          { label: 'About Us',   to: '/about' },
          { label: 'Programs',   to: '/#programs' },
          { label: 'Gallery',    to: '/gallery' },
          { label: 'Admissions', to: '/admission' },
          { label: 'Contact',    to: '/contact' },
        ].map(({ label, to }) => (
          <Link key={label} to={to} className="block text-gray-400 text-sm mb-2.5 hover:text-white transition-colors no-underline">
            → {label}
          </Link>
        ))}
      </div>

      {/* Programs */}
      <div>
        <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Programs</h4>
        {[
          ['🌱', 'Nursery (2–3 yrs)'],
          ['🌻', 'LKG (3–4 yrs)'],
          ['🌈', 'UKG (4–5 yrs)'],
          ['⭐', 'Daycare (6mo–5yrs)'],
        ].map(([icon, label]) => (
          <p key={label} className="text-gray-400 text-sm mb-2.5">{icon} {label}</p>
        ))}
        <Link
          to="/admission"
          className="mt-3 inline-block bg-gradient-to-r from-red-500 to-orange-400 text-white text-xs font-black px-4 py-2 rounded-full no-underline hover:opacity-90 transition-opacity"
        >
          Apply Now →
        </Link>
      </div>

      {/* Contact */}
      <div>
        <h4 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
        {[
          ['📍', '123 Education Lane,\nPune, Maharashtra 411001'],
          ['📞', '+91 98765 43210'],
          ['✉️', 'info@atharvpreschool.in'],
          ['🕐', 'Mon–Sat: 8:00 AM – 6:00 PM'],
        ].map(([icon, text]) => (
          <div key={text} className="flex gap-2.5 mb-3 text-sm text-gray-400">
            <span className="flex-shrink-0 mt-0.5">{icon}</span>
            <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
          </div>
        ))}
        <div className="mt-4 flex gap-2 flex-wrap">
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-3 py-2 rounded-lg no-underline transition-colors">
            🔐 Parent Login
          </Link>
          <Link to="/login" className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-black px-3 py-2 rounded-lg no-underline transition-colors">
            👨‍💼 Admin Login
          </Link>
        </div>
      </div>
    </div>

    {/* Bottom */}
    <div className="max-w-6xl mx-auto border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="text-gray-500 text-xs">© 2024 Atharv Preschool & Daycare, Pune. All rights reserved.</p>
      <p className="text-gray-600 text-xs">Made with ❤️ for little dreamers</p>
    </div>
  </footer>
);

export default Footer;