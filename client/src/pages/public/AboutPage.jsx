import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Mrs. Sunita Joshi',   role: 'Principal',              emoji: '👩‍🏫', exp: '20+ years',  desc: 'M.Ed from Pune University. Passionate about early childhood development.' },
  { name: 'Mrs. Rekha Patil',    role: 'Head Teacher – Nursery', emoji: '👩',   exp: '12 years',   desc: 'Specialist in play-based pedagogy and Montessori methods.' },
  { name: 'Mrs. Anjali Desai',   role: 'Head Teacher – LKG/UKG', emoji: '👩‍💼', exp: '10 years',   desc: 'Expert in phonics, early literacy, and school-readiness programs.' },
  { name: 'Ms. Prachi Kulkarni', role: 'Daycare Supervisor',     emoji: '🧑‍⚕️', exp: '8 years',   desc: 'Certified in infant & toddler care, nutrition, and child psychology.' },
  { name: 'Mr. Sanjay Mane',     role: 'Sports & Activity Lead', emoji: '🏃',   exp: '6 years',   desc: 'Yoga, dance, and outdoor play specialist. Makes fitness fun for kids.' },
  { name: 'Mrs. Meera Shah',     role: 'Parent Relations',       emoji: '👩‍💻', exp: '5 years',   desc: 'Manages parent communication, fee support, and community events.' },
];

const MILESTONES = [
  { year: '2010', title: 'Founded',           desc: 'Atharv Preschool opened its doors with 30 students and a dream.' },
  { year: '2013', title: 'Expanded',          desc: 'Added LKG and UKG programs. Built a new outdoor play area.' },
  { year: '2016', title: 'Daycare Launch',    desc: 'Launched full-day Daycare for working parents — 6 months to 5 years.' },
  { year: '2019', title: 'Digital Upgrade',   desc: 'Introduced parent app, CCTV monitoring, and digital fee payments.' },
  { year: '2022', title: 'Award Winning',     desc: "Recognized as Pune's Best Preschool by EduExcellence Awards." },
  { year: '2024', title: '500+ Students',     desc: 'Now serving 500+ happy children across all programs.' },
];

const VALUES = [
  { icon: '❤️', title: 'Love & Belonging',   desc: 'Every child feels safe, seen, and celebrated.' },
  { icon: '🌱', title: 'Holistic Growth',    desc: 'Social, emotional, cognitive, and physical development in balance.' },
  { icon: '🤝', title: 'Parent Partnership', desc: 'We treat parents as co-educators, not just customers.' },
  { icon: '🌍', title: 'Inclusive Space',    desc: 'Welcoming children of all backgrounds, abilities, and needs.' },
];

const AboutPage = () => (
  <div style={{ fontFamily: "'Nunito', sans-serif" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap'); .hero-font{font-family:'Fredoka One',cursive}`}</style>

    {/* Hero */}
    <section className="pt-28 pb-20 px-6 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
      <div className="absolute inset-0 opacity-10">
        {['🌟','🎨','📚','🎵','🌈','⭐'].map((e,i) => (
          <span key={i} className="absolute text-5xl"
            style={{ top:`${[15,60,20,70,40,80][i]}%`, left:`${[5,10,80,85,45,60][i]}%` }}>{e}</span>
        ))}
      </div>
      <div className="relative max-w-3xl mx-auto">
        <p className="text-white/70 font-black text-xs tracking-widest mb-3">ABOUT US</p>
        <h1 className="hero-font text-5xl md:text-6xl text-white mb-5">Our Story 📖</h1>
        <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto">
          Since 2010, Atharv Preschool has been Pune's most-loved early learning centre —
          a warm, joyful second home where every child discovers their unique brilliance.
        </p>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-purple-500 font-black text-xs tracking-widest mb-2">OUR PURPOSE</p>
          <h2 className="hero-font text-4xl text-gray-800 mb-6">Mission & Vision</h2>
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🎯</div>
              <div>
                <h3 className="font-black text-gray-800 mb-1">Our Mission</h3>
                <p className="text-gray-500 leading-relaxed text-sm">To provide a nurturing, stimulating environment where children grow into confident, curious, and compassionate individuals — through play, creativity, and love.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🔭</div>
              <div>
                <h3 className="font-black text-gray-800 mb-1">Our Vision</h3>
                <p className="text-gray-500 leading-relaxed text-sm">A world where every child's early years are filled with wonder, belonging, and joy — laying the foundation for a lifetime of learning and success.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            ['500+', 'Happy Students',   '#FF6B6B', '#FFF0F0'],
            ['14+',  'Years of Trust',   '#A78BFA', '#F5F0FF'],
            ['30+',  'Trained Staff',    '#4ECDC4', '#F0FFFE'],
            ['95%',  'Parent Retention', '#FFB347', '#FFF8EE'],
          ].map(([val, label, color, bg]) => (
            <div key={label} className="rounded-2xl p-6 text-center" style={{ background: bg }}>
              <p className="hero-font text-4xl mb-1" style={{ color }}>{val}</p>
              <p className="text-gray-600 text-sm font-bold">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-red-500 font-black text-xs tracking-widest mb-2">WHAT WE STAND FOR</p>
          <h2 className="hero-font text-4xl text-gray-800">Our Core Values 💛</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {VALUES.map(v => (
            <div key={v.title} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:-translate-y-2 transition-transform">
              <div className="text-4xl mb-3">{v.icon}</div>
              <h3 className="font-black text-gray-800 text-sm mb-2">{v.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-indigo-500 font-black text-xs tracking-widest mb-2">OUR JOURNEY</p>
          <h2 className="hero-font text-4xl text-gray-800">14 Years of Growing Together 🌱</h2>
        </div>
        <div className="relative pl-8 border-l-4 border-indigo-200 space-y-8">
          {MILESTONES.map((m, i) => (
            <div key={m.year} className="relative">
              <div className="absolute -left-[2.75rem] w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-black">{m.year.slice(2)}</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 ml-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2.5 py-1 rounded-full">{m.year}</span>
                  <h3 className="font-black text-gray-800">{m.title}</h3>
                </div>
                <p className="text-gray-500 text-sm">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-500 font-black text-xs tracking-widest mb-2">MEET THE TEAM</p>
          <h2 className="hero-font text-4xl text-gray-800">The People Behind the Magic 🌟</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEAM.map(m => (
            <div key={m.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-3xl">
                  {m.emoji}
                </div>
                <div>
                  <h3 className="font-black text-gray-800 leading-tight">{m.name}</h3>
                  <p className="text-indigo-500 text-xs font-bold">{m.role}</p>
                  <p className="text-gray-400 text-xs">{m.exp} experience</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-6 text-center" style={{ background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)' }}>
      <h2 className="hero-font text-4xl text-white mb-4">Ready to Join Our Family? 🎒</h2>
      <p className="text-white/90 mb-8 text-lg">Applications are open for 2024–25. Limited seats available.</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/admission" className="bg-white text-red-500 font-black px-8 py-4 rounded-full text-base hover:-translate-y-1 transition-transform no-underline shadow-lg">
          Apply Now →
        </Link>
        <Link to="/contact" className="border-2 border-white text-white font-black px-8 py-4 rounded-full text-base hover:bg-white hover:text-red-500 transition-all no-underline">
          Contact Us
        </Link>
      </div>
    </section>
  </div>
);

export default AboutPage;