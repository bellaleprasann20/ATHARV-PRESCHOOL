import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const PROGRAMS = [
  { name: 'Nursery',  age: '2–3 years', fee: '₹2,500', seats: 20, color: '#FF6B6B', bg: '#FFF0F0', emoji: '🌱',
    includes: ['5 days/week (Mon–Fri)','8 AM – 12 PM','Snack provided','Activity kit included'] },
  { name: 'LKG',      age: '3–4 years', fee: '₹3,000', seats: 20, color: '#FFB347', bg: '#FFF8EE', emoji: '🌻',
    includes: ['5 days/week','8 AM – 12:30 PM','Lunch & snack','Books & stationery'] },
  { name: 'UKG',      age: '4–5 years', fee: '₹3,500', seats: 20, color: '#4ECDC4', bg: '#F0FFFE', emoji: '🌈',
    includes: ['5 days/week','8 AM – 1 PM','Lunch included','Workbooks & worksheets'] },
  { name: 'Daycare',  age: '6mo–5 yrs', fee: '₹4,500', seats: 15, color: '#A78BFA', bg: '#F5F0FF', emoji: '⭐',
    includes: ['6 days/week','7:30 AM – 6:30 PM','All meals included','Nap time facility'] },
];

const STEPS = [
  { n: '01', title: 'Fill Enquiry Form',       desc: 'Complete our online form or visit us in person.' },
  { n: '02', title: 'School Visit',             desc: 'Schedule a campus tour — meet the teachers and see our facilities.' },
  { n: '03', title: 'Interaction Session',      desc: 'A fun, informal session for your child with our educators.' },
  { n: '04', title: 'Submit Documents',         desc: 'Provide birth certificate, address proof, and photos.' },
  { n: '05', title: 'Pay Registration Fee',     desc: 'Pay ₹500 registration fee to confirm the seat.' },
  { n: '06', title: 'Welcome to Atharv! 🎉',   desc: 'Your child is officially part of our family.' },
];

const DOCS = ['Birth certificate of child','Aadhar card of parent/guardian','2 passport size photos of child','4 passport size photos of parent','Residential address proof','Medical fitness certificate from doctor'];

const FAQS = [
  { q: 'What is the registration fee?',              a: 'A one-time non-refundable registration fee of ₹500 is required to confirm admission.' },
  { q: 'Is there a transport facility?',              a: 'Yes, GPS-tracked school buses are available within a 5km radius. Fee starts at ₹800/month.' },
  { q: 'What is your student-to-teacher ratio?',     a: 'We maintain a 10:1 student-to-teacher ratio in all classrooms for personalised attention.' },
  { q: 'Can I visit the school before applying?',    a: 'Absolutely! We encourage campus visits. Call us to schedule a tour at your convenience.' },
  { q: 'Are meals included in the fee?',             a: 'Snacks are included for Nursery. Lunch + snacks for LKG, UKG, and Daycare.' },
  { q: 'What is the last date for admissions?',      a: 'We accept admissions throughout the year subject to seat availability. Apply early to avoid disappointment.' },
];

const AdmissionPage = () => {
  const [openFaq,   setOpenFaq]   = useState(null);
  const [form,      setForm]      = useState({ parentName:'', phone:'', email:'', childName:'', dob:'', gender:'', program:'', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap'); .hero-font{font-family:'Fredoka One',cursive}`}</style>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 text-center relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#FF6B6B,#FF8E53,#FFD93D)' }}>
        <div className="absolute inset-0 opacity-10">
          {['🎒','📚','✏️','🖍️','📐','🔬'].map((e,i)=>(
            <span key={i} className="absolute text-6xl" style={{ top:`${[10,65,20,75,45,30][i]}%`, left:`${[5,10,75,80,40,55][i]}%` }}>{e}</span>
          ))}
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-white/80 font-black text-xs tracking-widest mb-3">2024–25 ADMISSIONS</p>
          <h1 className="hero-font text-5xl md:text-6xl text-white mb-5">Secure Your Child's Seat 🎒</h1>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">Limited seats available. Apply early to join Pune's most-loved preschool family.</p>
          <div className="flex gap-6 justify-center flex-wrap">
            {[['📞','+91 98765 43210'],['✉️','admissions@atharvpreschool.in'],['📍','123 Education Lane, Pune']].map(([icon,text])=>(
              <div key={text} className="flex items-center gap-2 text-white font-bold text-sm">
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs & Fees */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-500 font-black text-xs tracking-widest mb-2">PROGRAMS & FEES</p>
            <h2 className="hero-font text-4xl text-gray-800">Choose the Right Program 🌈</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROGRAMS.map(p => (
              <div key={p.name} style={{ background:p.bg }} className="rounded-3xl p-7 hover:-translate-y-1 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{p.emoji}</span>
                    <div>
                      <h3 className="hero-font text-2xl text-gray-800">{p.name}</h3>
                      <p className="text-gray-500 text-sm">Age: {p.age}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="hero-font text-2xl" style={{ color:p.color }}>{p.fee}<span className="text-sm font-bold text-gray-400">/mo</span></p>
                    <p className="text-xs text-gray-400">{p.seats} seats only</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {p.includes.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} style={{ color:p.color }} className="flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#apply" style={{ background:p.color }} className="mt-5 inline-block text-white font-black text-sm px-5 py-2.5 rounded-full hover:opacity-90 no-underline transition-opacity">
                  Apply for {p.name} →
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-5">* One-time registration fee: ₹500 | Annual charges may apply</p>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-green-500 font-black text-xs tracking-widest mb-2">HOW TO APPLY</p>
            <h2 className="hero-font text-4xl text-gray-800">Simple 6-Step Process ✅</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-5 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-black text-gray-800 mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-orange-500 font-black text-xs tracking-widest mb-2">CHECKLIST</p>
          <h2 className="hero-font text-4xl text-gray-800 mb-8">Documents Required 📋</h2>
          <div className="bg-orange-50 rounded-3xl p-8 text-left">
            {DOCS.map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-orange-100 last:border-0">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0">{i+1}</div>
                <p className="text-gray-700 font-semibold text-sm">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-indigo-500 font-black text-xs tracking-widest mb-2">APPLY NOW</p>
            <h2 className="hero-font text-4xl text-gray-800">Admission Enquiry Form 📝</h2>
          </div>

          {submitted ? (
            <div className="text-center p-14 rounded-3xl" style={{ background:'linear-gradient(135deg,#51CF66,#4ECDC4)' }}>
              <div className="text-7xl mb-5">🎉</div>
              <h3 className="hero-font text-3xl text-white mb-3">Application Received!</h3>
              <p className="text-white/90 text-lg">Our admissions team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['Parent Name*','parentName','text','Full name'],['Phone Number*','phone','tel','+91 98765 43210'],['Email','email','email','your@email.com'],["Child's Full Name*",'childName','text',"Child's name"]].map(([label,field,type,ph])=>(
                  <div key={field} className={field==='email'||field==='childName'?'col-span-2':''}>
                    <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type={type} placeholder={ph} value={form[field]} required={label.includes('*')}
                      onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none"/>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Date of Birth*</label>
                  <input type="date" required value={form.dob} onChange={e=>setForm(p=>({...p,dob:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Gender*</label>
                  <select required value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none bg-white">
                    <option value="">Select</option>
                    <option>Boy</option><option>Girl</option><option>Prefer not to say</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Program Interested In*</label>
                  <select required value={form.program} onChange={e=>setForm(p=>({...p,program:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none bg-white">
                    <option value="">Select a program</option>
                    {PROGRAMS.map(p=><option key={p.name}>{p.name} ({p.age})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Message / Questions</label>
                  <textarea rows={3} placeholder="Any specific questions or requirements?" value={form.message}
                    onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-400 outline-none resize-none"/>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
                style={{ background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
                {loading ? '⏳ Submitting...' : '🎒 Submit Admission Enquiry'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-teal-500 font-black text-xs tracking-widest mb-2">FAQ</p>
            <h2 className="hero-font text-4xl text-gray-800">Common Questions 💬</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="border-2 border-gray-100 rounded-2xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-black text-gray-800 text-sm pr-4">{f.q}</span>
                  {openFaq === i ? <ChevronUp size={18} className="text-indigo-500 flex-shrink-0"/> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0"/>}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-gray-500 text-sm leading-relaxed">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdmissionPage;