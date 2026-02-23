import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const PROGRAMS = [
  {
    id: 'nursery',
    num: '01',
    emoji: '🌱',
    title: 'Nursery',
    subtitle: 'The Beginning of Wonder',
    age: '2 – 3 Years',
    fee: '₹2,500',
    seats: 20,
    timing: '8:00 AM – 12:00 PM',
    days: 'Mon – Fri',
    accent: '#FF6B35',
    dark: '#1a0a00',
    highlights: [
      { icon:'🧠', label:'Sensory Play',      desc:'Sand, water, clay and texture activities build neural connections.' },
      { icon:'🎵', label:'Music & Rhymes',    desc:'Songs, finger rhymes and percussion instruments daily.' },
      { icon:'📖', label:'Early Literacy',    desc:'Picture books, storytelling and letter exposure through play.' },
      { icon:'🤝', label:'Social Skills',     desc:'Circle time, sharing and group activities for emotional growth.' },
      { icon:'🖍️', label:'Creative Arts',    desc:'Painting, drawing and craft projects to express creativity.' },
      { icon:'🏃', label:'Gross Motor Play',  desc:'Outdoor activities, obstacle courses and dance.' },
    ],
    includes: ['Morning snack included','Activity kit provided','Progress report every term','Parent-teacher meetings quarterly','Photo updates via parent app'],
    typical_day: [
      { time:'8:00',  label:'Arrival & Free Play' },
      { time:'8:30',  label:'Circle Time & Morning Song' },
      { time:'9:00',  label:'Structured Activity (Art / Craft / Sensory)' },
      { time:'9:45',  label:'Outdoor Play & Gross Motor' },
      { time:'10:15', label:'Snack Time' },
      { time:'10:30', label:'Story Time & Music' },
      { time:'11:00', label:'Free Exploration / Centers' },
      { time:'11:30', label:'Clean-Up & Circle Review' },
      { time:'12:00', label:'Home Time 🏠' },
    ],
  },
  {
    id: 'lkg',
    num: '02',
    emoji: '🌻',
    title: 'LKG',
    subtitle: 'Language, Logic & Laughter',
    age: '3 – 4 Years',
    fee: '₹3,000',
    seats: 20,
    timing: '8:00 AM – 12:30 PM',
    days: 'Mon – Fri',
    accent: '#F5A623',
    dark: '#1a1000',
    highlights: [
      { icon:'🔤', label:'Phonics & Alphabet', desc:'Jolly Phonics — letter sounds, blends and simple words.' },
      { icon:'🔢', label:'Number Concepts',    desc:'Counting 1–20, patterns, shapes and early math through games.' },
      { icon:'🌍', label:'World Around Us',    desc:'EVS activities exploring nature, family, community and seasons.' },
      { icon:'🎨', label:'Art Integration',    desc:'Subject concepts reinforced through creative art projects.' },
      { icon:'💬', label:'Spoken English',     desc:'Show & tell, conversations and presentations to build confidence.' },
      { icon:'🧩', label:'Puzzles & Logic',    desc:'Jigsaw puzzles, sorting, matching and sequencing activities.' },
    ],
    includes: ['Lunch & morning snack','Workbooks & stationery','Weekly reading folder','Monthly newsletter','Access to parent portal'],
    typical_day: [
      { time:'8:00',  label:'Arrival & Journal Writing' },
      { time:'8:30',  label:'Phonics & Language Circle' },
      { time:'9:15',  label:'Math / EVS Lesson' },
      { time:'10:00', label:'Outdoor Play' },
      { time:'10:30', label:'Snack Break' },
      { time:'10:45', label:'Art / Craft Activity' },
      { time:'11:30', label:'Story Reading & Library' },
      { time:'12:00', label:'Lunch' },
      { time:'12:30', label:'Home Time 🏠' },
    ],
  },
  {
    id: 'ukg',
    num: '03',
    emoji: '🌈',
    title: 'UKG',
    subtitle: 'Ready, Set, School!',
    age: '4 – 5 Years',
    fee: '₹3,500',
    seats: 20,
    timing: '8:00 AM – 1:00 PM',
    days: 'Mon – Fri',
    accent: '#00B894',
    dark: '#001a10',
    highlights: [
      { icon:'✏️', label:'Reading & Writing',    desc:'Sight words, sentence formation and independent reading practice.' },
      { icon:'➕', label:'Math Foundations',     desc:'Addition, subtraction, place value and word problems.' },
      { icon:'🔬', label:'Science Experiments',  desc:'Simple experiments to develop inquiry and reasoning skills.' },
      { icon:'🗺️', label:'Social Studies',       desc:'Community helpers, maps, countries and civic awareness.' },
      { icon:'💻', label:'Computer Basics',      desc:'Mouse, keyboard, basic software — digital literacy from day one.' },
      { icon:'🎭', label:'Drama & Debate',       desc:'Role play, presentations and debates to build confidence.' },
    ],
    includes: ['Full lunch & snacks','All textbooks & workbooks','Computer lab sessions','Annual day performance','School-readiness assessment'],
    typical_day: [
      { time:'8:00',  label:'Arrival & Morning Work' },
      { time:'8:30',  label:'English / Reading Lesson' },
      { time:'9:15',  label:'Mathematics Lesson' },
      { time:'10:00', label:'Outdoor Play / PE' },
      { time:'10:30', label:'Snack Break' },
      { time:'10:45', label:'EVS / Science / Computer' },
      { time:'11:30', label:'Creative Arts / Drama' },
      { time:'12:00', label:'Lunch' },
      { time:'12:30', label:'Story & Wind Down' },
      { time:'1:00',  label:'Home Time 🏠' },
    ],
  },
  {
    id: 'daycare',
    num: '04',
    emoji: '⭐',
    title: 'Daycare',
    subtitle: 'Safe, Loving, All-Day Care',
    age: '6 Months – 5 Years',
    fee: '₹4,500',
    seats: 15,
    timing: '7:30 AM – 6:30 PM',
    days: 'Mon – Sat',
    accent: '#A855F7',
    dark: '#0f0020',
    highlights: [
      { icon:'👶', label:'Infant Care',          desc:'Trained caregivers for babies 6–18 months. Feeding and nap schedules.' },
      { icon:'🍱', label:'All Meals Provided',   desc:'Breakfast, lunch, afternoon snack — freshly prepared daily.' },
      { icon:'😴', label:'Nap Time Facility',    desc:'Dedicated rest room with individual cots and blankets.' },
      { icon:'📱', label:'Live Updates',         desc:'Real-time photos and meal/nap updates sent to parents.' },
      { icon:'🏥', label:'On-site Nurse',        desc:'Certified nurse available all day for health monitoring.' },
      { icon:'🎯', label:'Age-Matched Activity', desc:'Activities designed separately for infants, toddlers and preschoolers.' },
    ],
    includes: ['All meals (breakfast + lunch + snack)','Nap time with bedding','Diapers & wipes for infants','Daily update via app','CCTV accessible to parents'],
    typical_day: [
      { time:'7:30',  label:'Arrival & Settling In' },
      { time:'8:00',  label:'Breakfast' },
      { time:'8:30',  label:'Age-Group Activity Time' },
      { time:'10:00', label:'Outdoor Play' },
      { time:'10:30', label:'Morning Snack' },
      { time:'11:00', label:'Learning / Creative Activity' },
      { time:'12:00', label:'Lunch' },
      { time:'12:30', label:'Nap Time / Rest' },
      { time:'2:30',  label:'Wake Up & Free Play' },
      { time:'3:30',  label:'Afternoon Snack' },
      { time:'4:00',  label:'Story / Music / Sensory Play' },
      { time:'5:30',  label:'Wind Down & Pick-Up Begins' },
      { time:'6:30',  label:'Centre Closes 🏠' },
    ],
  },
];

const ProgramsPage = () => {
  const [active,  setActive]  = useState('nursery');
  const [dayOpen, setDayOpen] = useState(false);
  const p = PROGRAMS.find(x => x.id === active);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#0c0c0f', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700&display=swap');
        .serif { font-family:'DM Serif Display',serif; }
        .serif-i { font-family:'DM Serif Display',serif; font-style:italic; }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .su { animation:slideUp 0.4s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes barIn { from{width:0} to{width:100%} }
        .tab-bar { animation:barIn 0.3s ease forwards; }
      `}</style>

      {/* ── HERO — full dark, editorial ─────────────────────── */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden"
        style={{ background:'#0c0c0f' }}>
        {/* Large decorative number */}
        <div className="absolute right-0 top-0 text-[320px] leading-none font-black select-none pointer-events-none"
          style={{ color:'rgba(255,255,255,0.02)', fontFamily:'DM Serif Display,serif' }}>
          EL
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 max-w-12" style={{ background:'#FF6B35' }} />
            <span className="text-xs font-bold tracking-[0.25em] uppercase"
              style={{ color:'#FF6B35' }}>Early Learning Programs</span>
          </div>

          <h1 className="serif text-6xl md:text-8xl text-white mb-6 leading-none">
            Education<br/>
            <span className="serif-i" style={{ color:'#FF6B35' }}>designed</span><br/>
            for childhood.
          </h1>

          <p className="text-gray-400 text-xl max-w-xl leading-relaxed mb-12" style={{ fontWeight:300 }}>
            Four carefully crafted programs — from infant care to school-readiness — each built around how children actually learn.
          </p>

          {/* Program tabs */}
          <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background:'rgba(255,255,255,0.06)' }}>
            {PROGRAMS.map(prog => (
              <button key={prog.id}
                onClick={() => { setActive(prog.id); setDayOpen(false); }}
                className="relative px-5 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: active === prog.id ? prog.accent : 'transparent',
                  color: active === prog.id ? '#fff' : 'rgba(255,255,255,0.45)',
                }}>
                <span className="mr-1.5">{prog.emoji}</span>
                {prog.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAM DETAIL ──────────────────────────────────── */}
      <section className="px-6 pb-24" style={{ background:'#0c0c0f' }} key={active}>
        <div className="max-w-5xl mx-auto">

          {/* Big program header */}
          <div className="border-t pt-12 mb-16 su"
            style={{ borderColor:`${p.accent}44` }}>
            <div className="flex items-start justify-between gap-8 flex-wrap">
              <div>
                <div className="serif text-[80px] md:text-[120px] leading-none font-black mb-0"
                  style={{ color:`${p.accent}22`, lineHeight:1 }}>
                  {p.num}
                </div>
                <div style={{ marginTop:'-1.5rem' }}>
                  <h2 className="serif text-5xl md:text-7xl text-white leading-none">{p.title}</h2>
                  <p className="serif-i text-2xl mt-1" style={{ color:p.accent }}>{p.subtitle}</p>
                </div>
              </div>

              {/* Stats strip */}
              <div className="flex gap-8 flex-wrap">
                {[
                  { label:'Age Group',   val: p.age },
                  { label:'Monthly Fee', val: p.fee },
                  { label:'Timing',      val: p.timing },
                  { label:'Days',        val: p.days },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color:`${p.accent}99` }}>{label}</p>
                    <p className="text-white font-bold text-lg leading-tight">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* LEFT — highlights */}
            <div className="lg:col-span-3 space-y-12">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-6"
                  style={{ color:p.accent }}>What Your Child Learns</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {p.highlights.map((h, i) => (
                    <div key={h.label}
                      className="p-5 rounded-2xl su border"
                      style={{
                        background:'rgba(255,255,255,0.03)',
                        borderColor:'rgba(255,255,255,0.07)',
                        animationDelay:`${i*0.05}s`,
                      }}>
                      <span className="text-2xl block mb-3">{h.icon}</span>
                      <p className="font-bold text-white text-sm mb-1.5">{h.label}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{h.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typical day accordion */}
              <div className="rounded-2xl overflow-hidden border"
                style={{ borderColor:'rgba(255,255,255,0.08)' }}>
                <button
                  onClick={() => setDayOpen(o => !o)}
                  className="w-full flex items-center justify-between px-6 py-5 transition-colors text-left"
                  style={{ background:'rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <Clock size={16} style={{ color:p.accent }} />
                    <span className="font-bold text-white text-sm">A Day in {p.title}</span>
                  </div>
                  {dayOpen
                    ? <ChevronUp size={16} className="text-gray-500" />
                    : <ChevronDown size={16} className="text-gray-500" />}
                </button>

                {dayOpen && (
                  <div className="px-6 py-5 space-y-3" style={{ background:'rgba(255,255,255,0.02)' }}>
                    {p.typical_day.map((slot, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-xs font-black w-12 flex-shrink-0 tabular-nums"
                          style={{ color:p.accent }}>{slot.time}</span>
                        <div className="h-px flex-1" style={{ background:`${p.accent}22` }} />
                        <span className="text-gray-300 text-xs font-medium text-right max-w-[200px]">{slot.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — sidebar */}
            <div className="lg:col-span-2 space-y-6">

              {/* What's included */}
              <div className="rounded-2xl p-6 border" style={{ background:'rgba(255,255,255,0.04)', borderColor:'rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color:p.accent }}>
                  Everything Included
                </p>
                <div className="space-y-3">
                  {p.includes.map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color:p.accent }} />
                      <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seats & CTA */}
              <div className="rounded-2xl p-6" style={{ background:p.accent }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Class Size</p>
                    <p className="text-white font-black text-2xl">Max {p.seats} seats</p>
                  </div>
                  <span className="text-4xl">{p.emoji}</span>
                </div>
                <p className="text-white/80 text-sm mb-5 leading-relaxed">
                  Seats fill fast every year. Secure your child's spot before the batch closes.
                </p>
                <Link to="/admission"
                  className="flex items-center justify-center gap-2 bg-white font-black text-sm px-5 py-3.5 rounded-xl no-underline hover:-translate-y-0.5 transition-transform"
                  style={{ color:p.accent }}>
                  Apply for {p.title} <ArrowRight size={16} />
                </Link>
              </div>

              {/* Switch programs */}
              <div className="rounded-2xl p-5 border space-y-2"
                style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Other Programs</p>
                {PROGRAMS.filter(pr => pr.id !== active).map(pr => (
                  <button key={pr.id}
                    onClick={() => { setActive(pr.id); setDayOpen(false); window.scrollTo({ top:400, behavior:'smooth' }); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
                    style={{ background:'rgba(255,255,255,0.04)' }}>
                    <span className="text-xl">{pr.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{pr.title}</p>
                      <p className="text-gray-500 text-xs">{pr.age}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ─────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background:'#080808' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-14">
            <div className="h-px flex-1 max-w-10" style={{ background:'#FF6B35' }} />
            <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color:'#FF6B35' }}>
              Compare Programs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
                  <th className="text-left py-4 pr-8 text-gray-500 text-xs font-bold uppercase tracking-widest w-32">Program</th>
                  {['Age', 'Timing', 'Days', 'Fee/Month', 'Max Seats'].map(h => (
                    <th key={h} className="text-left py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROGRAMS.map(pr => (
                  <tr key={pr.id}
                    className="border-b cursor-pointer transition-all"
                    style={{
                      borderColor:'rgba(255,255,255,0.05)',
                      background: active === pr.id ? `${pr.accent}11` : 'transparent',
                    }}
                    onClick={() => { setActive(pr.id); setDayOpen(false); window.scrollTo({ top:0, behavior:'smooth' }); }}>
                    <td className="py-5 pr-8">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pr.emoji}</span>
                        <div>
                          <p className="font-bold text-white text-sm">{pr.title}</p>
                          <p className="text-[10px] font-bold" style={{ color:pr.accent }}>{pr.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    {[pr.age, pr.timing, pr.days, pr.fee, `${pr.seats} kids`].map((val, i) => (
                      <td key={i} className="py-5 px-4 text-gray-400 text-sm">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center relative overflow-hidden"
        style={{ background:'#111' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="serif text-[200px] font-black leading-none"
            style={{ color:'rgba(255,255,255,0.02)' }}>2025</span>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-6" style={{ color:'#FF6B35' }}>
            Admissions Open — 2025–26
          </p>
          <h2 className="serif text-5xl md:text-6xl text-white mb-4 leading-tight">
            Give your child<br/>
            <span className="serif-i" style={{ color:'#FF6B35' }}>the best start.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed" style={{ fontWeight:300 }}>
            Join hundreds of families who trust Atharv Preschool for their child's earliest and most important years.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/admission"
              className="flex items-center gap-2 font-bold px-8 py-4 rounded-2xl no-underline text-black hover:-translate-y-0.5 transition-transform"
              style={{ background:'#FF6B35' }}>
              Apply Now <ArrowRight size={18} />
            </Link>
            <Link to="/contact"
              className="flex items-center gap-2 font-bold px-8 py-4 rounded-2xl no-underline border hover:-translate-y-0.5 transition-all"
              style={{ borderColor:'rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.7)' }}>
              Talk to Admissions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramsPage;