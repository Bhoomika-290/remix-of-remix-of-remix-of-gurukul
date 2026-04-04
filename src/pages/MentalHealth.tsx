import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Moon, Heart, Wind, Timer, Brain, Sparkles, RotateCcw, Shield, Star, Phone, Activity, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actInterventions = [
  { type: 'defusion', icon: <Wind size={20} />, content: 'Notice what thoughts showed up about this quiz.', instruction: 'Can you hold them lightly — like clouds passing?' },
  { type: 'self_compassion', icon: <Heart size={20} />, content: "This is a hard moment. That's okay.", instruction: 'What would you say to a friend who just struggled with this?' },
  { type: 'values', icon: <Sparkles size={20} />, content: 'Before we start — why does this matter to you?', instruction: 'Take 10 seconds to remember your reason.' },
  { type: 'acceptance', icon: <Activity size={20} />, content: "Some days are harder. That doesn't mean you're failing.", instruction: 'Can you sit with this feeling without pushing it away?' },
  { type: 'present_moment', icon: <Shield size={20} />, content: 'Right now, in this moment, you are safe.', instruction: 'Name 3 things you can see, 2 you can hear, 1 you can feel.' },
];

const cbtExercises = [
  { title: 'Thought Record', icon: <Brain size={18} />, desc: 'Identify → Challenge → Reframe', prompt: "Write down the negative thought you're having right now." },
  { title: 'Cognitive Distortion Check', icon: <Activity size={18} />, desc: 'Is this all-or-nothing thinking?', prompt: 'Am I catastrophizing? Is there evidence against this thought?' },
  { title: 'Behavioral Activation', icon: <Sparkles size={18} />, desc: 'Small actions → Better mood', prompt: "What's one small thing you can do right now that you enjoy?" },
];

const affirmations = [
  "I am capable of learning and growing every day.",
  "Struggling with a concept doesn't mean I'm failing — it means I'm learning.",
  "My pace is my own. I don't need to compare myself to anyone.",
  "I've overcome challenges before, and I'll overcome this too.",
  "Taking a break is not giving up — it's recharging.",
  "My worth isn't defined by my exam scores.",
  "Every small step forward counts.",
  "I deserve kindness — especially from myself.",
];

const helplines = [
  { name: 'Vandrevala Foundation', number: '1860-2662-345', available: '24/7' },
  { name: 'iCall', number: '9152987821', available: 'Mon-Sat, 8am-10pm' },
  { name: 'AASRA', number: '9820466726', available: '24/7' },
  { name: 'Snehi', number: '044-24640050', available: '24/7' },
];

const MentalHealth = () => {
  const { user } = useApp();
  const { recoveryMode, setRecoveryMode } = useTheme();
  const navigate = useNavigate();

  // Breathing
  const [breathType, setBreathType] = useState<'478' | 'box'>('box');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'hold2'>('idle');
  const [breathCycles, setBreathCycles] = useState(0);
  const breathTimer = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ACT & CBT
  const [showACT, setShowACT] = useState(false);
  const [actIndex, setActIndex] = useState(0);
  const [showCBT, setShowCBT] = useState(false);
  const [cbtIndex, setCbtIndex] = useState(0);
  const [cbtInput, setCbtInput] = useState('');

  // Pomodoro
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroBreak, setPomodoroBreak] = useState(false);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);

  // New features
  const [sleepRating, setSleepRating] = useState(0);
  const [sleepHours, setSleepHours] = useState('');
  const [anxietyLevel, setAnxietyLevel] = useState(3);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [showSOS, setShowSOS] = useState(false);
  const [habits, setHabits] = useState({ meditate: false, exercise: false, journal: false, hydrate: false, sleep7: false });
  const [showGrounding, setShowGrounding] = useState(false);

  // Pomodoro timer
  useEffect(() => {
    if (!pomodoroActive) return;
    const interval = setInterval(() => {
      setPomodoroSeconds(prev => {
        if (prev === 0) {
          if (pomodoroMinutes === 0) {
            setPomodoroActive(false);
            if (pomodoroBreak) { setPomodoroBreak(false); setPomodoroMinutes(25); }
            else { setPomodoroSessions(p => p + 1); setPomodoroBreak(true); setPomodoroMinutes(5); }
            return 0;
          }
          setPomodoroMinutes(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroMinutes, pomodoroBreak]);

  const clearBreathTimers = () => { breathTimer.current.forEach(t => clearTimeout(t)); breathTimer.current = []; };

  const startBreathing = () => {
    clearBreathTimers();
    setBreathCycles(prev => prev + 1);
    if (breathType === '478') {
      setBreathPhase('inhale');
      breathTimer.current.push(setTimeout(() => setBreathPhase('hold'), 4000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('exhale'), 11000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('idle'), 19000));
    } else {
      setBreathPhase('inhale');
      breathTimer.current.push(setTimeout(() => setBreathPhase('hold'), 4000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('exhale'), 8000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('hold2'), 12000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('idle'), 16000));
    }
  };

  useEffect(() => () => clearBreathTimers(), []);

  const pomodoroProgress = pomodoroBreak
    ? ((5 * 60 - (pomodoroMinutes * 60 + pomodoroSeconds)) / (5 * 60)) * 100
    : ((25 * 60 - (pomodoroMinutes * 60 + pomodoroSeconds)) / (25 * 60)) * 100;

  const habitCount = Object.values(habits).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
            <Brain size={24} style={{ color: 'hsl(var(--accent))' }} /> Mental Wellbeing
          </h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted))' }}>Your emotional state is a learning variable, not a separate problem.</p>
        </div>
        {/* SOS Button — always visible */}
        <button onClick={() => setShowSOS(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all hover:scale-105"
          style={{ borderColor: 'hsl(var(--danger))', color: 'hsl(var(--danger))', background: 'hsl(var(--danger) / 0.08)' }}>
          <Phone size={14} /> SOS Help
        </button>
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOS && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowSOS(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="card-base max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="font-display text-lg font-bold mb-2 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Shield size={20} style={{ color: 'hsl(var(--danger))' }} /> You're not alone
              </h3>
              <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>If you're in crisis, please reach out. These helplines are free and confidential.</p>
              <div className="space-y-2 mb-4">
                {helplines.map((h, i) => (
                  <a key={i} href={`tel:${h.number}`} className="flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background: 'hsl(var(--surface2))' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'hsl(var(--text))' }}>{h.name}</p>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>{h.available}</p>
                    </div>
                    <span className="stat-number text-sm font-bold" style={{ color: 'hsl(var(--accent))' }}>{h.number}</span>
                  </a>
                ))}
              </div>
              <button onClick={() => setShowSOS(false)} className="btn-3d-ghost w-full text-sm py-2">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 1: Focus Timer + Burnout Risk side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Focus Timer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-base text-center" style={{ backdropFilter: 'blur(12px)' }}>
          <h3 className="font-display text-base font-semibold mb-4 flex items-center justify-center gap-2" style={{ color: 'hsl(var(--text))' }}>
            <Timer size={18} style={{ color: 'hsl(var(--accent))' }} /> Focus Timer
          </h3>
          <div className="relative w-36 h-36 mx-auto mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--surface2))" strokeWidth="5" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={pomodoroBreak ? 'hsl(var(--success))' : 'hsl(var(--accent))'}
                strokeWidth="5" strokeLinecap="round"
                strokeDasharray={264} strokeDashoffset={264 - (pomodoroProgress / 100) * 264}
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="stat-number text-2xl font-bold" style={{ color: pomodoroBreak ? 'hsl(var(--success))' : 'hsl(var(--text))' }}>
                {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>
                {pomodoroBreak ? 'Break' : 'Focus'} · {pomodoroSessions} done
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            {!pomodoroActive ? (
              <button onClick={() => setPomodoroActive(true)} className="btn-3d text-xs px-5 py-2">
                {pomodoroBreak ? 'Start break' : 'Start focus'}
              </button>
            ) : (
              <button onClick={() => setPomodoroActive(false)} className="btn-3d-ghost text-xs px-5 py-2">Pause</button>
            )}
            <button onClick={() => { setPomodoroActive(false); setPomodoroMinutes(25); setPomodoroSeconds(0); setPomodoroBreak(false); }}
              className="btn-3d-ghost text-xs px-3 py-2"><RotateCcw size={14} /></button>
          </div>
        </motion.div>

        {/* Burnout Risk + Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card-base" style={{ backdropFilter: 'blur(12px)' }}>
          <h3 className="font-display text-base font-semibold mb-3 text-center" style={{ color: 'hsl(var(--text))' }}>Burnout Risk</h3>
          <div className="relative w-40 h-20 mx-auto mb-3">
            <svg viewBox="0 0 120 60" className="w-full h-full">
              <defs><linearGradient id="burnout-g" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--success))" /><stop offset="50%" stopColor="hsl(var(--warning))" /><stop offset="100%" stopColor="hsl(var(--danger))" />
              </linearGradient></defs>
              <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--surface2))" strokeWidth="10" strokeLinecap="round" />
              <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="url(#burnout-g)" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
              <line x1="60" y1="55" x2={60 + 40 * Math.cos(Math.PI - (user.burnoutScore / 100) * Math.PI)} y2={55 - 40 * Math.sin(Math.PI - (user.burnoutScore / 100) * Math.PI)} stroke="hsl(var(--text))" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="60" cy="55" r="4" fill="hsl(var(--text))" />
            </svg>
          </div>
          <div className="text-center mb-3">
            <span className="stat-number text-2xl font-bold" style={{
              color: user.burnoutScore > 60 ? 'hsl(var(--danger))' : user.burnoutScore > 30 ? 'hsl(var(--warning))' : 'hsl(var(--success))'
            }}>{user.burnoutScore}</span>
            <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--muted))' }}>
              {user.burnoutScore > 60 ? 'High risk — try recovery mode' : user.burnoutScore > 30 ? 'Moderate — keep monitoring' : "Low — you're doing great"}
            </p>
          </div>
          {/* Suggestions */}
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate('/games')} className="text-xs px-3 py-1.5 rounded-lg border border-border" style={{ color: 'hsl(var(--text-secondary))' }}>
              <Sparkles size={12} className="inline mr-1" /> Play a game
            </button>
            <button onClick={() => setRecoveryMode(true)} className="text-xs px-3 py-1.5 rounded-lg border border-border" style={{ color: 'hsl(var(--text-secondary))' }}>
              <Moon size={12} className="inline mr-1" /> Recovery mode
            </button>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Breathing + Recovery Mode + Affirmation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Breathing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-base text-center" style={{ backdropFilter: 'blur(12px)' }}>
          <h3 className="font-display text-sm font-semibold mb-3 flex items-center justify-center gap-2" style={{ color: 'hsl(var(--text))' }}>
            <Wind size={16} style={{ color: 'hsl(var(--accent))' }} /> Breathing
          </h3>
          <div className="flex gap-1.5 justify-center mb-4">
            {[{ type: 'box' as const, label: 'Box' }, { type: '478' as const, label: '4-7-8' }].map(b => (
              <button key={b.type} onClick={() => { setBreathType(b.type); setBreathPhase('idle'); clearBreathTimers(); }}
                className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: breathType === b.type ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
                  color: breathType === b.type ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text))',
                }}>{b.label}</button>
            ))}
          </div>
          <div className="flex justify-center mb-3">
            <motion.div animate={{ scale: breathPhase === 'inhale' ? 1.4 : (breathPhase === 'hold' || breathPhase === 'hold2') ? 1.4 : 1 }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: `radial-gradient(circle, hsl(var(--accent) / 0.3), hsl(var(--accent) / 0.1))`,
                boxShadow: breathPhase !== 'idle' ? '0 0 30px hsl(var(--accent) / 0.2)' : 'none',
              }}>
              <span className="font-display text-xs font-semibold" style={{ color: 'hsl(var(--accent))' }}>
                {breathPhase === 'idle' ? '○' : breathPhase === 'inhale' ? 'In' : breathPhase === 'hold' || breathPhase === 'hold2' ? 'Hold' : 'Out'}
              </span>
            </motion.div>
          </div>
          {breathPhase === 'idle' ? (
            <button onClick={startBreathing} className="btn-3d text-xs px-4 py-2">
              {breathCycles > 0 ? 'Again' : 'Start'}
            </button>
          ) : (
            <p className="text-[11px] font-display" style={{ color: 'hsl(var(--accent))' }}>
              {breathPhase === 'inhale' ? 'Breathe in...' : breathPhase === 'hold' ? 'Hold...' : breathPhase === 'exhale' ? 'Exhale...' : 'Hold...'}
            </p>
          )}
          {breathCycles > 0 && <p className="text-[10px] mt-2" style={{ color: 'hsl(var(--muted))' }}>{breathCycles} cycles</p>}
        </motion.div>

        {/* Recovery Mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card-base flex flex-col justify-between" style={{ backdropFilter: 'blur(12px)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Moon size={18} style={{ color: 'hsl(var(--accent))' }} />
              <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>Recovery Mode</h3>
            </div>
            <p className="text-[11px] mb-3" style={{ color: 'hsl(var(--muted))' }}>
              Hides all timers, leaderboards, boss battles. Softens the entire UI to reduce pressure.
            </p>
            {recoveryMode && (
              <div className="p-2 rounded-lg mb-2 text-[10px]" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                Active — pressure elements hidden. Try breathing or a game instead.
              </div>
            )}
          </div>
          <button onClick={() => setRecoveryMode(!recoveryMode)}
            className={`w-full py-2 rounded-xl text-xs font-medium transition-all ${recoveryMode ? 'btn-3d' : 'btn-3d-ghost'}`}>
            {recoveryMode ? 'Exit Recovery Mode' : 'Activate Recovery Mode'}
          </button>
        </motion.div>

        {/* Positive Affirmation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card-base flex flex-col justify-between" style={{ backdropFilter: 'blur(12px)' }}>
          <div>
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <Sparkles size={16} style={{ color: 'hsl(var(--accent))' }} /> Daily Affirmation
            </h3>
            <p className="font-display text-sm italic leading-relaxed" style={{ color: 'hsl(var(--text))' }}>
              "{affirmations[affirmationIndex]}"
            </p>
          </div>
          <button onClick={() => setAffirmationIndex((affirmationIndex + 1) % affirmations.length)}
            className="btn-3d-ghost text-xs px-4 py-2 mt-3 self-start">Next →</button>
        </motion.div>
      </div>

      {/* Row 3: Sleep + Anxiety + Habits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sleep Quality */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card-base" style={{ backdropFilter: 'blur(12px)' }}>
          <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
            <Moon size={16} style={{ color: 'hsl(var(--accent))' }} /> Sleep Quality
          </h3>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setSleepRating(s)}
                className="text-lg transition-transform hover:scale-110"
                style={{ opacity: s <= sleepRating ? 1 : 0.3 }}>
                <Star size={20} fill={s <= sleepRating ? 'hsl(var(--warning))' : 'none'} style={{ color: 'hsl(var(--warning))' }} />
              </button>
            ))}
          </div>
          <input type="number" placeholder="Hours slept" value={sleepHours} onChange={e => setSleepHours(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-xs outline-none"
            style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} min="0" max="24" />
          {sleepRating > 0 && (
            <p className="text-[10px] mt-2" style={{ color: sleepRating >= 4 ? 'hsl(var(--success))' : sleepRating >= 3 ? 'hsl(var(--warning))' : 'hsl(var(--danger))' }}>
              {sleepRating >= 4 ? 'Great sleep — you should be sharp today!' : sleepRating >= 3 ? 'Decent — consider lighter topics' : 'Poor sleep — be gentle with yourself today'}
            </p>
          )}
        </motion.div>

        {/* Anxiety Level */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card-base" style={{ backdropFilter: 'blur(12px)' }}>
          <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
            <Activity size={16} style={{ color: 'hsl(var(--accent))' }} /> Anxiety Check
          </h3>
          <div className="relative mb-2">
            <input type="range" min="1" max="10" value={anxietyLevel} onChange={e => setAnxietyLevel(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--success)), hsl(var(--warning)), hsl(var(--danger)))`,
              }} />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: 'hsl(var(--muted))' }}>
            <span>Calm</span><span>Moderate</span><span>High</span>
          </div>
          <div className="mt-2 text-center">
            <span className="stat-number text-xl font-bold" style={{
              color: anxietyLevel <= 3 ? 'hsl(var(--success))' : anxietyLevel <= 6 ? 'hsl(var(--warning))' : 'hsl(var(--danger))'
            }}>{anxietyLevel}/10</span>
          </div>
          {anxietyLevel > 6 && (
            <p className="text-[10px] mt-1 text-center" style={{ color: 'hsl(var(--danger))' }}>
              Consider a breathing exercise or taking a break.
            </p>
          )}
        </motion.div>

        {/* Daily Habits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card-base" style={{ backdropFilter: 'blur(12px)' }}>
          <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
            <CheckSquare size={16} style={{ color: 'hsl(var(--accent))' }} /> Daily Habits
            <span className="text-[10px] ml-auto stat-number" style={{ color: 'hsl(var(--accent))' }}>{habitCount}/5</span>
          </h3>
          <div className="space-y-2">
            {[
              { key: 'meditate' as const, label: 'Meditate 5 min' },
              { key: 'exercise' as const, label: 'Move/Exercise' },
              { key: 'journal' as const, label: 'Journal' },
              { key: 'hydrate' as const, label: 'Drink water' },
              { key: 'sleep7' as const, label: 'Sleep 7+ hrs' },
            ].map(h => (
              <button key={h.key} onClick={() => setHabits(prev => ({ ...prev, [h.key]: !prev[h.key] }))}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-all"
                style={{
                  background: habits[h.key] ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--surface2))',
                  color: habits[h.key] ? 'hsl(var(--success))' : 'hsl(var(--text))',
                }}>
                <div className="w-4 h-4 rounded border flex items-center justify-center text-[10px]"
                  style={{ borderColor: habits[h.key] ? 'hsl(var(--success))' : 'hsl(var(--border))', background: habits[h.key] ? 'hsl(var(--success))' : 'transparent', color: 'white' }}>
                  {habits[h.key] && '✓'}
                </div>
                {h.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 4: CBT + ACT + Grounding (horizontal) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CBT */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card-base" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={16} style={{ color: 'hsl(var(--accent))' }} />
              <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>CBT</h3>
            </div>
            <button onClick={() => { setShowCBT(!showCBT); setCbtIndex(Math.floor(Math.random() * cbtExercises.length)); setCbtInput(''); }}
              className="text-[11px] font-medium" style={{ color: 'hsl(var(--accent))' }}>{showCBT ? 'Close' : 'Try →'}</button>
          </div>
          <AnimatePresence>
            {showCBT && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-3 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
                  <div className="flex items-center gap-2 mb-2">
                    {cbtExercises[cbtIndex].icon}
                    <h4 className="text-xs font-semibold" style={{ color: 'hsl(var(--text))' }}>{cbtExercises[cbtIndex].title}</h4>
                  </div>
                  <p className="text-[11px] italic mb-2" style={{ color: 'hsl(var(--text-secondary))' }}>{cbtExercises[cbtIndex].prompt}</p>
                  <textarea value={cbtInput} onChange={e => setCbtInput(e.target.value)} placeholder="Your thoughts (private)..." rows={2}
                    className="w-full px-2 py-1.5 rounded-lg border border-border text-[11px] resize-none outline-none mb-2"
                    style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
                  <button onClick={() => { setCbtIndex((cbtIndex + 1) % cbtExercises.length); setCbtInput(''); }}
                    className="text-[11px] font-medium" style={{ color: 'hsl(var(--accent))' }}>Next exercise →</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!showCBT && <p className="text-[11px]" style={{ color: 'hsl(var(--muted))' }}>Challenge unhelpful thoughts</p>}
        </motion.div>

        {/* ACT */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="card-base" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart size={16} style={{ color: 'hsl(var(--accent))' }} />
              <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>ACT</h3>
            </div>
            <button onClick={() => { setShowACT(!showACT); setActIndex(Math.floor(Math.random() * actInterventions.length)); }}
              className="text-[11px] font-medium" style={{ color: 'hsl(var(--accent))' }}>{showACT ? 'Close' : 'Try →'}</button>
          </div>
          <AnimatePresence>
            {showACT && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-3 rounded-xl text-center" style={{ background: 'hsl(var(--surface2))' }}>
                  <div className="mb-2" style={{ color: 'hsl(var(--accent))' }}>{actInterventions[actIndex].icon}</div>
                  <p className="font-display text-sm italic mb-1" style={{ color: 'hsl(var(--text))' }}>{actInterventions[actIndex].content}</p>
                  <p className="text-[11px] mb-2" style={{ color: 'hsl(var(--text-secondary))' }}>{actInterventions[actIndex].instruction}</p>
                  <button onClick={() => setActIndex((actIndex + 1) % actInterventions.length)}
                    className="text-[11px] font-medium" style={{ color: 'hsl(var(--accent))' }}>Next →</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!showACT && <p className="text-[11px]" style={{ color: 'hsl(var(--muted))' }}>Acceptance & Commitment Therapy</p>}
        </motion.div>

        {/* 5-4-3-2-1 Grounding (collapsible) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card-base" style={{ backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setShowGrounding(!showGrounding)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: 'hsl(var(--accent))' }} />
              <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>5-4-3-2-1 Grounding</h3>
            </div>
            {showGrounding ? <ChevronUp size={16} style={{ color: 'hsl(var(--muted))' }} /> : <ChevronDown size={16} style={{ color: 'hsl(var(--muted))' }} />}
          </button>
          <AnimatePresence>
            {showGrounding && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-1.5 mt-3">
                  {[
                    { num: 5, sense: 'SEE', color: 'hsl(var(--accent))' },
                    { num: 4, sense: 'TOUCH', color: 'hsl(var(--success))' },
                    { num: 3, sense: 'HEAR', color: 'hsl(var(--warning))' },
                    { num: 2, sense: 'SMELL', color: 'hsl(var(--danger))' },
                    { num: 1, sense: 'TASTE', color: 'hsl(var(--accent))' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                      <span className="stat-number text-sm font-bold" style={{ color: item.color }}>{item.num}</span>
                      <span className="text-xs" style={{ color: 'hsl(var(--text))' }}>things you can {item.sense}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!showGrounding && <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--muted))' }}>Quick sensory grounding exercise</p>}
        </motion.div>
      </div>
    </div>
  );
};

export default MentalHealth;
