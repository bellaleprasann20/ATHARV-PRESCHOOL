import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Bell, Calendar, Clock, MapPin, Star } from 'lucide-react';

// ── Scrolling photo strip data ────────────────────────────────
const STRIP_1 = [
  { emoji:'🎨', bg:'#FFE4E6', label:'Art Week'       },
  { emoji:'🌱', bg:'#DCFCE7', label:'Garden Club'    },
  { emoji:'🎵', bg:'#EDE9FE', label:'Music Hour'     },
  { emoji:'🏃', bg:'#FEF3C7', label:'Sports Day'     },
  { emoji:'📚', bg:'#E0F2FE', label:'Story Time'     },
  { emoji:'🎭', bg:'#FDF4FF', label:'Drama Day'      },
  { emoji:'🍱', bg:'#FFF0F0', label:'Lunch Break'    },
  { emoji:'🎉', bg:'#FFFBEB', label:'Annual Day'     },
  { emoji:'🔬', bg:'#F0FFF4', label:'Science Lab'    },
  { emoji:'🎃', bg:'#FFF3E0', label:'Halloween'      },
];
const STRIP_2 = [
  { emoji:'🪔', bg:'#FFF8E1', label:'Diwali Fest'    },
  { emoji:'🎄', bg:'#DCFCE7', label:'Christmas'      },
  { emoji:'🎠', bg:'#E0E7FF', label:'Field Trip'     },
  { emoji:'🦋', bg:'#FDF4FF', label:'Nature Walk'    },
  { emoji:'🎪', bg:'#FFE4E6', label:'Funfair'        },
  { emoji:'🍰', bg:'#FEF3C7', label:'Birthday Party' },
  { emoji:'🏆', bg:'#FFFBEB', label:'Prize Day'      },
  { emoji:'🎤', bg:'#F0F9FF', label:'Talent Show'    },
  { emoji:'🌍', bg:'#DCFCE7', label:'Earth Day'      },
  { emoji:'🧪', bg:'#FFF0F0', label:'Experiment'     },
];

// ── Announcements ─────────────────────────────────────────────
const ANNOUNCEMENTS = [
  {
    id:2, tag:'🎉 Event', tagColor:'#d97706', tagBg:'#fffbeb',
    title:'Annual Day 2025 — "Little Stars Shine"',
    desc:"Our grand annual celebration is on 15th March 2025. Children will perform dance, drama, and music. All parents warmly invited!",
    date:'Mar 15, 2025',
  },
  {
    id:3, tag:'🏖️ Holiday', tagColor:'#0891b2', tagBg:'#ecfeff',
    title:'Summer Vacation — April 25 to June 8',
    desc:'School will remain closed for summer vacation. Daycare services will continue as usual. New session begins June 9th.',
    date:'Apr 25, 2025',
  },
  {
    id:4, tag:'📋 Notice', tagColor:'#7c3aed', tagBg:'#f5f3ff',
    title:'Parent-Teacher Meeting — March 8',
    desc:"PTM for all classes will be held on 8th March from 9 AM to 1 PM. Please collect your child's progress report.",
    date:'Mar 8, 2025',
  },
  {
    id:5, tag:'🎭 Activity', tagColor:'#059669', tagBg:'#f0fdf4',
    title:'Inter-School Talent Hunt — Register Now',
    desc:'Atharv Preschool is hosting a city-wide talent competition for children aged 2–6. Singing, dancing, and art categories open.',
    date:'Mar 22, 2025',
  },
];

// ── Upcoming Events ───────────────────────────────────────────
const EVENTS = [
  { id:1, month:'MAR', day:'8',  title:'Parent-Teacher Meeting',   time:'9:00 AM – 1:00 PM',  venue:'School Hall',     color:'#7c3aed' },
  { id:2, month:'MAR', day:'15', title:'Annual Day 2025',          time:'5:00 PM – 8:00 PM',  venue:'Main Auditorium', color:'#d97706' },
  { id:3, month:'MAR', day:'22', title:'Inter-School Talent Hunt', time:'10:00 AM – 4:00 PM', venue:'School Grounds',  color:'#059669' },
  { id:4, month:'APR', day:'5',  title:'Sports & Wellness Day',    time:'8:00 AM – 12:00 PM', venue:'Outdoor Arena',   color:'#0891b2' },
  { id:5, month:'APR', day:'14', title:'Ugadi & Gudi Padwa Fest',  time:'11:00 AM – 1:00 PM', venue:'School Hall',     color:'#ef4444' },
];

// ── Photo Moments (lightbox grid) ─────────────────────────────
const MOMENTS = [
  { id:1, emoji:'🎨', bg:'linear-gradient(135deg,#ffecd2,#fcb69f)', title:'Art Week',        desc:'3 days of pure creativity — kids painted, sculpted, and collaged their hearts out.' },
  { id:2, emoji:'🏆', bg:'linear-gradient(135deg,#a18cd1,#fbc2eb)', title:'Sports Day 2024', desc:'Every child raced, jumped, and cheered. Gold medals and big smiles all around!' },
  { id:3, emoji:'🪔', bg:'linear-gradient(135deg,#ffd89b,#19547b)', title:'Diwali 2024',     desc:'Rangoli, diyas, and dances — our Diwali celebration lit up the whole school.' },
  { id:4, emoji:'🌱', bg:'linear-gradient(135deg,#d4fc79,#96e6a1)', title:'Garden Day',      desc:'Every child planted a sapling and learned why we must love and protect nature.' },
  { id:5, emoji:'🎄', bg:'linear-gradient(135deg,#1a3a2a,#2d6a4f)', title:'Christmas 2024',  desc:"Santa visited! Carols, gifts, and the most adorable elf costumes you've ever seen." },
  { id:6, emoji:'🔬', bg:'linear-gradient(135deg,#e0c3fc,#8ec5fc)', title:'Science Expo',   desc:'Volcanoes, rainbows, and magnets — tiny scientists doing huge experiments!' },
  { id:7, emoji:'🎭', bg:'linear-gradient(135deg,#f093fb,#f5576c)', title:'Drama Festival', desc:'Stories came alive as our children became kings, animals, and superheroes on stage.' },
  { id:8, emoji:'🍱', bg:'linear-gradient(135deg,#4facfe,#00f2fe)', title:'Nutrition Day',   desc:'Colourful plates, happy faces — our annual celebration of healthy eating habits.' },
];

// ── Auto-scroll hook ──────────────────────────────────────────
const useAutoScroll = (ref, speed = 0.5, dir = 1) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const tick = () => {
      el.scrollLeft += speed * dir;
      if (dir === 1  && el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      if (dir === -1 && el.scrollLeft <= 0) el.scrollLeft = el.scrollWidth / 2;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const stop  = () => cancelAnimationFrame(raf);
    const start = () => { raf = requestAnimationFrame(tick); };
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', stop);
      el.removeEventListener('mouseleave', start);
    };
  }, []);
};

const GalleryPage = () => {
  const [lightbox, setLightbox] = useState(null);
  const [pinned,   setPinned]   = useState(true);
  const ref1 = useRef(null);
  const ref2 = useRef(null);

  useAutoScroll(ref1, 0.6,  1);
  useAutoScroll(ref2, 0.45, -1);

  const doubled1 = [...STRIP_1, ...STRIP_1];
  const doubled2 = [...STRIP_2, ...STRIP_2];

  const lbIdx  = lightbox !== null ? MOMENTS.findIndex(m => m.id === lightbox) : -1;
  const lbItem = MOMENTS.find(m => m.id === lightbox);
  const prev   = () => setLightbox(MOMENTS[(lbIdx - 1 + MOMENTS.length) % MOMENTS.length].id);
  const next   = () => setLightbox(MOMENTS[(lbIdx + 1) % MOMENTS.length].id);

  useEffect(() => {
    if (!lightbox) return;
    const fn = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     setLightbox(null);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [lightbox, lbIdx]);

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
        .hf { font-family:'Fredoka One',cursive; }
        .noscroll { overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; }
        .noscroll::-webkit-scrollbar { display:none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp 0.5s ease forwards; }
        @keyframes pdot { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5)} }
        .pd { animation:pdot 1.6s ease infinite; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-28 pb-14 px-6 text-center relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
        {[...Array(24)].map((_,i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width:Math.random()*2.5+1, height:Math.random()*2.5+1,
              top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
              opacity:Math.random()*0.5+0.15,
            }} />
        ))}
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border border-white/20"
            style={{ background:'rgba(255,255,255,0.08)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 pd" />
            <span className="text-white/70 text-xs font-black tracking-widest uppercase">Live · School Gallery & Announcements</span>
          </div>
          <h1 className="hf text-5xl md:text-6xl text-white mb-4 leading-tight">
            Life at Atharv<br />
            <span style={{ background:'linear-gradient(90deg,#f093fb,#f5576c,#fda085)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Preschool ✨
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Every day is a new adventure — peek into our classrooms, events, celebrations, and the memories we make together.
          </p>
        </div>
      </section>

      {/* ── AUTO-SCROLLING PHOTO STRIPS ──────────────────────── */}
      <section className="py-8 space-y-4 overflow-hidden" style={{ background:'#0f0c29' }}>
        {/* Strip 1 → */}
        <div ref={ref1} className="noscroll flex py-1">
          {doubled1.map((item, i) => (
            <div key={i}
              className="flex-shrink-0 w-36 h-36 rounded-2xl mx-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform select-none"
              style={{ background: item.bg }}>
              <span className="text-5xl">{item.emoji}</span>
              <span className="text-xs font-black text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
        {/* Strip 2 ← */}
        <div ref={ref2} className="noscroll flex py-1">
          {doubled2.map((item, i) => (
            <div key={i}
              className="flex-shrink-0 w-36 h-36 rounded-2xl mx-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform select-none"
              style={{ background: item.bg }}>
              <span className="text-5xl">{item.emoji}</span>
              <span className="text-xs font-black text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={17} className="text-red-500" />
              <p className="text-xs font-black text-red-500 uppercase tracking-widest">School Announcements</p>
            </div>
            <h2 className="hf text-4xl text-gray-900">Latest Updates 📋</h2>
          </div>

          {/* Pinned banner */}
          {pinned && (
            <div className="relative rounded-2xl p-5 mb-5 fu"
              style={{ background:'linear-gradient(135deg,#ef4444,#f97316)' }}>
              <button onClick={() => setPinned(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                style={{ background:'rgba(255,255,255,0.15)' }}>
                <X size={14} />
              </button>
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">📌</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                      style={{ background:'rgba(255,255,255,0.2)' }}>PINNED</span>
                    <span className="text-white/60 text-xs">Feb 15, 2025</span>
                  </div>
                  <h3 className="font-black text-white text-lg mb-1">Admission Open — 2025–26 Batch</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Seats filling fast for Nursery, LKG, UKG & Daycare. Register before 31st March to secure your child's spot.
                  </p>
                  <Link to="/admission"
                    className="inline-block mt-3 bg-white text-red-600 font-black text-xs px-4 py-2 rounded-full hover:bg-red-50 transition-colors no-underline">
                    Apply Now →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Announcement list */}
          <div className="space-y-3">
            {ANNOUNCEMENTS.map((a, i) => (
              <div key={a.id}
                className="fu bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all"
                style={{ animationDelay:`${i*0.07}s` }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ color: a.tagColor, background: a.tagBg }}>
                    {a.tag}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} /> {a.date}
                  </span>
                </div>
                <h3 className="font-black text-gray-800 text-base mb-1">{a.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ──────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background:'#0f172a' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={17} className="text-violet-400" />
              <p className="text-xs font-black text-violet-400 uppercase tracking-widest">What's Coming Up</p>
            </div>
            <h2 className="hf text-4xl text-white">Upcoming Events 🗓️</h2>
          </div>

          <div className="space-y-3">
            {EVENTS.map(ev => (
              <div key={ev.id}
                className="flex items-center gap-5 p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                style={{ background:'rgba(255,255,255,0.04)' }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
                  style={{ background:`${ev.color}22`, border:`2px solid ${ev.color}55` }}>
                  <span className="text-[10px] font-black tracking-widest" style={{ color:ev.color }}>{ev.month}</span>
                  <span className="text-xl font-black text-white leading-none">{ev.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-sm mb-1">{ev.title}</h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock size={11} /> {ev.time}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <MapPin size={11} /> {ev.venue}
                    </span>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:ev.color }} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/contact"
              className="inline-block border border-white/20 text-white/60 font-black text-sm px-6 py-3 rounded-full hover:bg-white/5 transition-colors no-underline">
              Contact Us to RSVP or Know More →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PHOTO MOMENTS GRID ───────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-pink-500 uppercase tracking-widest mb-2">✨ Captured Memories</p>
            <h2 className="hf text-4xl text-gray-900">Our Best Moments 📸</h2>
            <p className="text-gray-400 mt-2 text-sm max-w-xl mx-auto">
              Click any card to read the full story behind the memory.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOMENTS.map(m => (
              <div key={m.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all group"
                style={{ background:m.bg, aspectRatio:'1' }}
                onClick={() => setLightbox(m.id)}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                  <span className="text-5xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                  <span className="text-white font-black text-xs text-center drop-shadow-lg">{m.title}</span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-black px-3 py-1.5 rounded-full backdrop-blur-sm"
                    style={{ background:'rgba(255,255,255,0.2)' }}>
                    View Story →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="hf text-4xl text-gray-900">What Parents Say 💬</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name:'Priya Sharma',  child:'Arjun, LKG',     text:"My son used to cry every morning before school. Now he runs in ahead of me! The teachers here are genuinely warm and caring." },
              { name:'Rahul Mehta',   child:'Ananya, Nursery', text:'The parent portal keeps us updated with real-time photos and fee receipts. Such a transparent and modern school!' },
              { name:'Deepa Nair',    child:'Rohan, UKG',      text:'Rohan learned to read at just 4.5 years! The phonics programme is exceptional. Couldn\'t be happier with this school.' },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_,j) => <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-black text-gray-800 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">Parent of {t.child}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center"
        style={{ background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <h2 className="hf text-4xl md:text-5xl text-white mb-4">Come Visit Us! 🏫</h2>
        <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
          Schedule a visit, meet the teachers, and feel the Atharv difference for yourself.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/contact"
            className="bg-white text-indigo-700 font-black px-8 py-4 rounded-full text-base shadow-lg hover:-translate-y-1 transition-transform no-underline">
            📞 Book a Visit
          </Link>
          <Link to="/admission"
            className="border-2 border-white text-white font-black px-8 py-4 rounded-full text-base hover:bg-white hover:text-indigo-700 transition-all no-underline">
            🎒 Apply for Admission
          </Link>
        </div>
      </section>

      {/* ── LIGHTBOX ─────────────────────────────────────────── */}
      {lightbox && lbItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors z-10"
            style={{ background:'rgba(255,255,255,0.1)' }}>
            <X size={20} />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors"
            style={{ background:'rgba(255,255,255,0.1)' }}
            onClick={e => { e.stopPropagation(); prev(); }}>
            <ChevronLeft size={22} />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors"
            style={{ background:'rgba(255,255,255,0.1)' }}
            onClick={e => { e.stopPropagation(); next(); }}>
            <ChevronRight size={22} />
          </button>

          <div className="max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="rounded-3xl p-16 mb-6 mx-auto"
              style={{ background:lbItem.bg }}>
              <div className="text-9xl leading-none">{lbItem.emoji}</div>
            </div>
            <h2 className="hf text-4xl text-white mb-3">{lbItem.title}</h2>
            <p className="text-white/65 leading-relaxed text-sm max-w-sm mx-auto">{lbItem.desc}</p>
            <p className="text-white/30 text-xs mt-5">
              {lbIdx + 1} of {MOMENTS.length} &nbsp;·&nbsp; ← → keys to navigate · Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;