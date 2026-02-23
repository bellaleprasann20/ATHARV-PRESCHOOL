import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const [form, setForm]           = useState({ name:'', phone:'', email:'', subject:'', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  const INFO = [
    { Icon: MapPin, title: 'Address',      color: '#FF6B6B', bg:'#FFF0F0',
      lines: ['123 Education Lane, Kothrud,','Pune, Maharashtra – 411038'] },
    { Icon: Phone,  title: 'Phone',        color: '#4ECDC4', bg:'#F0FFFE',
      lines: ['+91 98765 43210 (Admissions)','+91 98765 43211 (General)'] },
    { Icon: Mail,   title: 'Email',        color: '#A78BFA', bg:'#F5F0FF',
      lines: ['admissions@atharvpreschool.in','info@atharvpreschool.in'] },
    { Icon: Clock,  title: 'Office Hours', color: '#FFB347', bg:'#FFF8EE',
      lines: ['Mon – Sat: 8:00 AM – 6:00 PM','Sun: Closed'] },
  ];

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap'); .hero-font{font-family:'Fredoka One',cursive}`}</style>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 text-center"
        style={{ background:'linear-gradient(135deg,#4ECDC4,#44A3AA,#2D7DD2)' }}>
        <p className="text-white/70 font-black text-xs tracking-widest mb-3">GET IN TOUCH</p>
        <h1 className="hero-font text-5xl md:text-6xl text-white mb-5">Contact Us 📞</h1>
        <p className="text-white/90 text-lg max-w-xl mx-auto">
          We'd love to hear from you. Reach out for admissions, queries, or just to say hello!
        </p>
      </section>

      {/* Info Cards */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {INFO.map(({ Icon, title, color, bg, lines }) => (
            <div key={title} style={{ background:bg }} className="rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background:color+'22' }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-black text-gray-800 mb-2">{title}</h3>
              {lines.map(l => <p key={l} className="text-gray-500 text-xs leading-relaxed">{l}</p>)}
            </div>
          ))}
        </div>
      </section>

      {/* Map + Form */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

          {/* Map placeholder */}
          <div>
            <h2 className="hero-font text-3xl text-gray-800 mb-5">Find Us 📍</h2>
            <div className="rounded-3xl overflow-hidden shadow-lg bg-indigo-50 h-72 flex items-center justify-center border-2 border-indigo-100 mb-5">
              <div className="text-center">
                <div className="text-6xl mb-3">🗺️</div>
                <p className="font-black text-indigo-700">123 Education Lane</p>
                <p className="text-indigo-400 text-sm">Kothrud, Pune – 411038</p>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                  className="mt-3 inline-block bg-indigo-600 text-white text-xs font-black px-4 py-2 rounded-full no-underline hover:bg-indigo-700 transition-colors">
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* Transport note */}
            <div className="bg-blue-50 rounded-2xl p-5">
              <h3 className="font-black text-gray-800 mb-3">🚌 How to Reach Us</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  '🚇 Nearest Metro: Vanaz Station (1.2 km)',
                  '🚌 Bus: Routes 11, 54, 105 stop nearby',
                  '🚗 Parking available for 20+ cars',
                  '🛺 Auto stands 200m from entrance',
                ].map(l => <li key={l}>{l}</li>)}
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="hero-font text-3xl text-gray-800 mb-5">Send a Message ✉️</h2>
            {submitted ? (
              <div className="h-full min-h-64 flex flex-col items-center justify-center text-center rounded-3xl p-10"
                style={{ background:'linear-gradient(135deg,#51CF66,#4ECDC4)' }}>
                <CheckCircle size={52} className="text-white mb-4" />
                <h3 className="hero-font text-3xl text-white mb-2">Message Sent!</h3>
                <p className="text-white/90">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[['Your Name*','name','text'],['Phone Number','phone','tel']].map(([label,field,type])=>(
                    <div key={field}>
                      <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                      <input type={type} required={label.includes('*')} value={form[field]}
                        onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-400 outline-none"/>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-400 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Subject*</label>
                  <select required value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-400 outline-none bg-white">
                    <option value="">Select subject</option>
                    {['Admission Enquiry','Fee Query','Transport Enquiry','General Information','Feedback / Complaint','Other'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-1.5 uppercase tracking-wide">Message*</label>
                  <textarea rows={4} required value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-teal-400 outline-none resize-none"/>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
                  style={{ background:'linear-gradient(135deg,#4ECDC4,#44A3AA)' }}>
                  {loading ? '⏳ Sending...' : '📨 Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Social / Quick reach */}
      <section className="py-16 px-6 text-center bg-gray-50">
        <h2 className="hero-font text-3xl text-gray-800 mb-3">Also Find Us On 🌐</h2>
        <p className="text-gray-500 text-sm mb-8">Follow us for daily updates, activities, and happy moments!</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {[['📘','Facebook','Join 2,000+ parents'],['📸','Instagram','See daily activities'],['▶️','YouTube','Watch story time'],['💬','WhatsApp','Quick enquiries']].map(([icon,name,desc])=>(
            <button key={name} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-center w-36">
              <div className="text-4xl mb-2">{icon}</div>
              <p className="font-black text-gray-800 text-sm">{name}</p>
              <p className="text-gray-400 text-xs mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;