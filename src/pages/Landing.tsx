import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smile, Frown, Moon, Dumbbell, Glasses, Flame, Zap, Trophy, Target, Brain, Users } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import gurukulLogo from '@/assets/gurukul-logo.png';

const Landing = () => {
  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--bg))' }}>
      <nav className="flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <motion.img
            src={gurukulLogo}
            alt="Gurukul"
            className="h-10 w-auto object-contain"
            style={{ mixBlendMode: 'multiply' }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          <div className="flex flex-col">
            <span className="font-brand text-2xl font-bold tracking-tight bg-gradient-to-r from-brand-teal to-brand-green bg-clip-text text-transparent leading-tight">
              Gurukul
            </span>
            <p className="text-[10px] font-body leading-tight" style={{ color: 'hsl(var(--muted))', letterSpacing: '0.5px' }}>Mindful & Well-being</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Link to="/auth" className="btn-3d-ghost text-sm font-medium">Login</Link>
          <Link to="/auth" className="btn-3d text-sm font-medium">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex-1 max-w-xl">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6 border border-border"
              style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--muted))' }}>
              ◈ AI-powered adaptive learning platform
            </div>
            <h1 className="font-display text-4xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: 'hsl(var(--text))' }}>
              Study smarter.<br />
              <span className="bg-gradient-to-r from-brand-teal to-brand-green bg-clip-text text-transparent">Feel better.</span><br />
              Grow deeper.
            </h1>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
              Gurukul adapts to how you feel, not just what you know. The only study platform that treats your wellbeing as a learning variable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth" className="btn-3d text-base font-semibold px-8 py-3.5">Start for free — it's open</Link>
              <a href="#features" className="btn-3d-ghost text-base font-medium px-6 py-3.5">See how it works →</a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex-1 max-w-md w-full">
            <div className="card-base animate-float space-y-5">
              <div className="text-center">
                <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted))' }}>Today's Readiness</p>
                <div className="relative w-36 h-[72px] mx-auto mb-1">
                  <svg viewBox="0 0 120 60" className="w-full h-full">
                    <path d="M 10 55 A 50 50 0 0 1 43 12" fill="none" stroke="hsl(var(--success))" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
                    <path d="M 43 12 A 50 50 0 0 1 77 12" fill="none" stroke="hsl(var(--warning))" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
                    <path d="M 77 12 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--danger))" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
                    <line x1="60" y1="55" x2={60 + 40 * Math.cos(Math.PI - 0.72 * Math.PI)} y2={55 - 40 * Math.sin(Math.PI - 0.72 * Math.PI)} stroke="hsl(var(--text))" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="60" cy="55" r="3" fill="hsl(var(--text))" />
                  </svg>
                </div>
                <span className="stat-number text-3xl font-bold" style={{ color: 'hsl(var(--accent))' }}>72</span>
                <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--muted))' }}>out of 100</p>
              </div>
              <div>
                <p className="text-xs text-center mb-2" style={{ color: 'hsl(var(--muted))' }}>How are you feeling?</p>
                <div className="flex gap-3 justify-center">
                  {[<Smile size={18} />, <Frown size={18} />, <Moon size={18} />, <Dumbbell size={18} />, <Glasses size={18} />].map((icon, i) => (
                    <div key={i} className={`mood-orb ${i === 3 ? 'selected' : ''} flex items-center justify-center`} style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--accent))' }}>{icon}</div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                <div><span className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>7</span><p className="text-[10px] flex items-center justify-center gap-0.5" style={{ color: 'hsl(var(--muted))' }}><Flame size={10} /> Streak</p></div>
                <div><span className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>340</span><p className="text-[10px] flex items-center justify-center gap-0.5" style={{ color: 'hsl(var(--muted))' }}><Zap size={10} /> XP</p></div>
                <div><span className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>L2</span><p className="text-[10px] flex items-center justify-center gap-0.5" style={{ color: 'hsl(var(--muted))' }}><Trophy size={10} /> Hero</p></div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'hsl(var(--muted))' }}>
          {['Built for Indian students', 'AI-powered adaptive learning', 'Mental wellbeing integrated', 'Effort-based rewards'].map((t, i) => (
            <span key={i} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-teal" />{t}</span>
          ))}
        </div>

        <div id="features" className="mt-24 grid md:grid-cols-3 gap-6">
          {[
            { icon: <Target size={28} />, title: 'Reads your state', desc: 'Checks your mood, sleep, energy before deciding how you learn today' },
            { icon: <Brain size={28} />, title: 'Teaches interactively', desc: 'Questions woven into concepts — like Brilliant, but built for JEE/NEET' },
            { icon: <Users size={28} />, title: "You're not alone", desc: 'Study rooms, accountability pairs, anonymous struggle sharing' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-base group cursor-default">
              <span className="mb-3 block" style={{ color: 'hsl(var(--accent))' }}>{f.icon}</span>
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'hsl(var(--text))' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h2 className="font-display text-3xl font-bold mb-4" style={{ color: 'hsl(var(--text))' }}>Your Saathi is ready</h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'hsl(var(--text-secondary))' }}>
            "The only study platform that decides whether you should even take a quiz today — and what you actually need instead."
          </p>
          <Link to="/auth" className="btn-3d text-lg font-semibold px-10 py-4">Begin your journey →</Link>
        </div>
      </div>

      <footer className="border-t border-border py-8 text-center text-sm" style={{ color: 'hsl(var(--muted))' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={gurukulLogo} alt="Gurukul" className="w-6 h-6 object-contain" />
          <span className="font-brand font-bold bg-gradient-to-r from-brand-teal to-brand-green bg-clip-text text-transparent">Gurukul</span>
        </div>
        <p>Study smarter. Feel better. Grow deeper.</p>
        <p className="mt-1 text-xs">Built with ❤️ for Indian students · Saathi AI Companion</p>
      </footer>
    </div>
  );
};

export default Landing;
