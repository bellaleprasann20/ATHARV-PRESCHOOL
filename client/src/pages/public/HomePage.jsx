import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PROGRAMS = [
  { emoji: '🌱', title: 'Nursery',  age: '2–3 Years',    color: '#FF6B6B', bg: '#FFF0F0', fee: '₹2,500/mo', desc: 'Play-based discovery through sensory activities, music, and creative arts.' },
  { emoji: '🌻', title: 'LKG',      age: '3–4 Years',    color: '#FFB347', bg: '#FFF8EE', fee: '₹3,000/mo', desc: 'Building language, numbers, and social skills through structured play.' },
  { emoji: '🌈', title: 'UKG',      age: '4–5 Years',    color: '#4ECDC4', bg: '#F0FFFE', fee: '₹3,500/mo', desc: 'School-readiness focusing on reading, writing, and math concepts.' },
  { emoji: '⭐', title: 'Daycare',  age: '6mo – 5 Yrs',  color: '#A78BFA', bg: '#F5F0FF', fee: '₹4,500/mo', desc: 'Full-day nurturing care with trained staff, meals, and enrichment activities.' },
];

const FEATURES = [
  { icon: '🛡️', title: 'Safe Campus',      desc: 'CCTV, secure entry, child-safe infrastructure.' },
  { icon: '🍎', title: 'Nutritious Meals',  desc: 'Freshly prepared, age-appropriate meals daily.' },
  { icon: '📱', title: 'Parent App',        desc: 'Real-time updates, fee payments & reports.' },
  { icon: '🎨', title: 'Creative Learning', desc: 'Art, music, dance integrated into every day.' },
  { icon: '🏥', title: 'Medical Care',      desc: 'Certified nurse on campus, first-aid trained staff.' },
  { icon: '🚌', title: 'Safe Transport',    desc: 'GPS-tracked buses with female attendant.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',  child: 'Mom of Aarav, Nursery', text: 'My son went from being shy to the most confident kid in his playgroup. The teachers are incredibly warm!', avatar: '👩' },
  { name: 'Rahul Gupta',   child: 'Dad of Ananya, LKG',    text: 'Best decision we made! Ananya loves school every single day. The parent app keeps us connected throughout.', avatar: '👨' },
  { name: 'Deepa Nair',    child: 'Mom of Rohan, UKG',     text: "Rohan reads books now! The phonics program here is exceptional. He's fully ready for Grade 1.", avatar: '👩' },
];

const HomePage = () => {
  const [activeT, setActiveT] = useState(0);
  const [form,    setForm]    = useState({ name: '', phone: '', childName: '', age: '', program: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
        .hero-font { font-family: 'Fredoka One', cursive; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .float { animation: float 3.5s ease-in-out infinite; }
      `}</style>

      {/* ── HERO ── */}
      <section className="min-h-screen relative overflow-hidden flex items-center pt-20"
        style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 35%,#FF6B6B 70%,#FFB347 100%)' }}>
        {[120,80,150,60,100,90].map((size, i) => (
          <div key={i} className="absolute rounded-full opacity-10"
            style={{
              width: size, height: size,
              background: ['#FF6B6B','#FFD93D','#4ECDC4','#A78BFA','white','#FF8CC8'][i],
              top: `${[10,60,25,75,40,15][i]}%`,
              left: `${[5,15,75,85,55,45][i]}%`,
              animation: `float ${4+i}s ease-in-out ${i*0.5}s infinite`,
            }} />
        ))}

        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="text-white flex-1">
              <div className="inline-block bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm font-black mb-5">
                🌟 ADMISSIONS OPEN 2024–25
              </div>
              <h1 className="hero-font text-5xl md:text-7xl leading-tight mb-5">
                Where Little<br />Dreams<br /><span style={{ color: '#FFD93D' }}>Grow Big! 🌱</span>
              </h1>
              <p className="text-lg opacity-90 mb-8 max-w-lg leading-relaxed">
                A place where every child feels loved, every curiosity is celebrated, and every day is a new adventure. Nurturing bright minds since 2010.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/admission"
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black px-6 py-3.5 rounded-full text-base shadow-lg hover:-translate-y-1 transition-transform no-underline">
                  🎒 Apply for Admission
                </Link>
                <a href="tel:+919876543210"
                  className="border-2 border-white text-white font-black px-6 py-3.5 rounded-full text-base hover:bg-white hover:text-indigo-700 transition-all no-underline">
                  📞 Call Us
                </a>
              </div>
              <div className="flex gap-10 mt-10">
                {[['500+','Students'],['14+','Years'],['95%','Happy Parents']].map(([n,l]) => (
                  <div key={l}>
                    <p className="hero-font text-4xl text-yellow-300">{n}</p>
                    <p className="text-sm opacity-75">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="float relative w-72 h-72 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center text-8xl">
                👨‍👩‍👧‍👦
              </div>
              {[{e:'🎨',t:'8%',l:'5%'},{e:'📚',t:'8%',r:'5%'},{e:'🎵',b:'8%',l:'5%'},{e:'⭐',b:'8%',r:'5%'}].map(({e,...pos},i)=>(
                <div key={i} className="absolute w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl" style={pos}>{e}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 60'%3E%3Cpath d='M0,30 L100,0 L200,30 L300,0 L400,30 L500,0 L600,30 L700,0 L800,30 L900,0 L1000,30 L1100,0 L1200,30 L1200,60 L0,60Z' fill='%23FFFEF9'/%3E%3C/svg%3E\") center/cover" }} />
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-red-500 font-black text-xs tracking-widest mb-2">WHY PARENTS LOVE US</p>
            <h2 className="hero-font text-4xl md:text-5xl text-gray-800">Everything Your Child Needs 💛</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:-translate-y-2 transition-transform border border-gray-100 hover:shadow-lg">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-black text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section id="programs" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-500 font-black text-xs tracking-widest mb-2">OUR PROGRAMS</p>
            <h2 className="hero-font text-4xl md:text-5xl text-gray-800">Learning Made for Every Age 🌈</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROGRAMS.map(p => (
              <div key={p.title} style={{ background: p.bg }} className="rounded-3xl p-7 hover:-translate-y-2 transition-transform">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="hero-font text-3xl text-gray-800">{p.title}</h3>
                  <span style={{ background: p.color }} className="text-white text-xs font-black px-3 py-1.5 rounded-full">{p.age}</span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-gray-800">{p.fee}</span>
                  <Link to="/admission" style={{ background: p.color }} className="text-white font-black text-sm px-4 py-2 rounded-full hover:opacity-90 no-underline">
                    Enquire →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/70 font-black text-xs tracking-widest mb-2">PARENT VOICES</p>
          <h2 className="hero-font text-4xl text-white mb-10">What Parents Say 💬</h2>
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
            <div className="text-5xl mb-3">{TESTIMONIALS[activeT].avatar}</div>
            <p className="text-white text-lg leading-relaxed italic mb-5">"{TESTIMONIALS[activeT].text}"</p>
            <p className="text-yellow-300 font-black">{TESTIMONIALS[activeT].name}</p>
            <p className="text-white/60 text-sm">{TESTIMONIALS[activeT].child}</p>
          </div>
          <div className="flex justify-center gap-2 mt-5">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveT(i)}
                className="rounded-full transition-all"
                style={{ width: i===activeT?28:10, height:10, background: i===activeT?'#FFD93D':'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSION CTA ── */}
      <section id="admissions" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-red-500 font-black text-xs tracking-widest mb-2">ADMISSIONS 2024–25</p>
            <h2 className="hero-font text-4xl md:text-5xl text-gray-800">Start Your Child's Journey 🚀</h2>
          </div>

          {submitted ? (
            <div className="text-center p-12 rounded-3xl" style={{ background: 'linear-gradient(135deg,#51CF66,#4ECDC4)' }}>
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="hero-font text-3xl text-white mb-2">Application Received!</h3>
              <p className="text-white/90">We'll call you within 24 hours!</p>
            </div>
          ) : (
            <form className="bg-gray-50 rounded-3xl p-8 shadow-sm" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[['Parent Name','name','text','Your full name'],['Phone','phone','tel','+91 98765 43210']].map(([label,field,type,ph]) => (
                  <div key={field}>
                    <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type={type} placeholder={ph} required value={form[field]}
                      onChange={e => setForm(p=>({...p,[field]:e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-red-400 outline-none" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wide">Child's Name</label>
                  <input type="text" placeholder="Child's full name" required value={form.childName}
                    onChange={e => setForm(p=>({...p,childName:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-red-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wide">Child's Age</label>
                  <select required value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-red-400 outline-none bg-white">
                    <option value="">Select age</option>
                    {['6 months – 1 year','1 – 2 years','2 – 3 years','3 – 4 years','4 – 5 years'].map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1.5 uppercase tracking-wide">Program</label>
                  <select required value={form.program} onChange={e=>setForm(p=>({...p,program:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-red-400 outline-none bg-white">
                    <option value="">Select program</option>
                    {['Nursery','LKG','UKG','Daycare'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg hover:-translate-y-0.5 transition-transform"
                style={{ background:'linear-gradient(135deg,#FF6B6B,#FF8E53)' }}>
                🎒 Submit Application — It's Free!
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;