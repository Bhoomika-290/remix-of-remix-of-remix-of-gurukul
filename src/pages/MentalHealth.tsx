import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Moon, Heart, Wind, Timer, Brain, Smile, Sparkles, RotateCcw } from 'lucide-react';

const actInterventions = [
  { type: 'defusion', emoji: '☁️', content: 'Notice what thoughts showed up about this quiz.', instruction: 'Can you hold them lightly — like clouds passing?' },
  { type: 'self_compassion', emoji: '💛', content: "This is a hard moment. That's okay.", instruction: 'What would you say to a friend who just struggled with this?' },
  { type: 'values', emoji: '🧭', content: 'Before we start — why does this matter to you?', instruction: 'Take 10 seconds to remember your reason.' },
  { type: 'acceptance', emoji: '🌊', content: 'Some days are harder. That doesn\'t mean you\'re failing.', instruction: 'Can you sit with this feeling without pushing it away?' },
  { type: 'present_moment', emoji: '🌿', content: 'Right now, in this moment, you are safe.', instruction: 'Name 3 things you can see, 2 you can hear, 1 you can feel.' },
];

const cbtExercises = [
  { title: 'Thought Record', emoji: '📝', desc: 'Identify → Challenge → Reframe', prompt: 'Write down the negative thought you\'re having right now.' },
  { title: 'Cognitive Distortion Check', emoji: '🔍', desc: 'Is this all-or-nothing thinking?', prompt: 'Am I catastrophizing? Is there evidence against this thought?' },
  { title: 'Behavioral Activation', emoji: '🚶', desc: 'Small actions → Better mood', prompt: 'What\'s one small thing you can do right now that you enjoy?' },
];

const MentalHealth = () => {
  const { user } = useApp();
  const { recoveryMode, setRecoveryMode } = useTheme();

  // Breathing
  const [breathType, setBreathType] = useState<'478' | 'box'>('box');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'hold2'>('idle');
  const [breathCycles, setBreathCycles] = useState(0);
  const breathTimer = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ACT
  const [showACT, setShowACT] = useState(false);
  const [actIndex, setActIndex] = useState(0);

  // CBT
  const [showCBT, setShowCBT] = useState(false);
  const [cbtIndex, setCbtIndex] = useState(0);
  const [cbtInput, setCbtInput] = useState('');

  // Pomodoro
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroBreak, setPomodoroBreak] = useState(false);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);

  // Pomodoro timer
  useEffect(() => {
    if (!pomodoroActive) return;
    const interval = setInterval(() => {
      setPomodoroSeconds(prev => {
        if (prev === 0) {
          if (pomodoroMinutes === 0) {
            setPomodoroActive(false);
            if (pomodoroBreak) {
              setPomodoroBreak(false);
              setPomodoroMinutes(25);
            } else {
              setPomodoroSessions(p => p + 1);
              setPomodoroBreak(true);
              setPomodoroMinutes(5);
            }
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

  const clearBreathTimers = () => {
    breathTimer.current.forEach(t => clearTimeout(t));
    breathTimer.current = [];
  };

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

  const burnoutFactors = [
    { label: 'Mood', value: user.mood || 'Not set', weight: 30, icon: '😊' },
    { label: 'Streak', value: `${user.streak} days`, weight: 25, icon: '🔥' },
    { label: 'Study time', value: user.studyTime || 'Varies', weight: 25, icon: '📚' },
    { label: 'Sessions', value: `${pomodoroSessions} today`, weight: 20, icon: '⏱' },
  ];

  const pomodoroProgress = pomodoroBreak
    ? ((5 * 60 - (pomodoroMinutes * 60 + pomodoroSeconds)) / (5 * 60)) * 100
    : ((25 * 60 - (pomodoroMinutes * 60 + pomodoroSeconds)) / (25 * 60)) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--text))' }}>🧘 Mental Wellbeing</h2>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted))' }}>Your emotional state is a learning variable, not a separate problem.</p>
      </div>

      {/* Pomodoro Timer — Visual ring */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center justify-center gap-2" style={{ color: 'hsl(var(--text))' }}>
          <Timer size={18} style={{ color: 'hsl(var(--accent))' }} /> Focus Timer
        </h3>

        <div className="relative w-44 h-44 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--surface2))" strokeWidth="5" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={pomodoroBreak ? 'hsl(var(--success))' : 'hsl(var(--accent))'}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={264} strokeDashoffset={264 - (pomodoroProgress / 100) * 264}
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="stat-number text-3xl font-bold" style={{ color: pomodoroBreak ? 'hsl(var(--success))' : 'hsl(var(--text))' }}>
              {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>
              {pomodoroBreak ? '☕ Break' : '📚 Focus'} · {pomodoroSessions} done
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {!pomodoroActive ? (
            <button onClick={() => setPomodoroActive(true)} className="btn-3d text-sm px-6 py-2.5">
              {pomodoroBreak ? 'Start break' : 'Start focus'}
            </button>
          ) : (
            <button onClick={() => setPomodoroActive(false)} className="btn-3d-ghost text-sm px-6 py-2.5">Pause</button>
          )}
          <button onClick={() => { setPomodoroActive(false); setPomodoroMinutes(25); setPomodoroSeconds(0); setPomodoroBreak(false); }}
            className="btn-3d-ghost text-sm px-3 py-2.5">
            <RotateCcw size={14} />
          </button>
        </div>
      </motion.div>

      {/* Burnout Score — Attractive */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base">
        <h3 className="font-display text-lg font-semibold mb-4 text-center" style={{ color: 'hsl(var(--text))' }}>Burnout Risk</h3>

        <div className="relative w-48 h-24 mx-auto mb-4">
          <svg viewBox="0 0 120 60" className="w-full h-full">
            <defs>
              <linearGradient id="burnout-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--success))" />
                <stop offset="50%" stopColor="hsl(var(--warning))" />
                <stop offset="100%" stopColor="hsl(var(--danger))" />
              </linearGradient>
            </defs>
            <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--surface2))" strokeWidth="10" strokeLinecap="round" />
            <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="url(#burnout-grad)" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
            <line x1="60" y1="55"
              x2={60 + 40 * Math.cos(Math.PI - (user.burnoutScore / 100) * Math.PI)}
              y2={55 - 40 * Math.sin(Math.PI - (user.burnoutScore / 100) * Math.PI)}
              stroke="hsl(var(--text))" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="55" r="4" fill="hsl(var(--text))" />
          </svg>
        </div>

        <div className="text-center mb-4">
          <span className="stat-number text-3xl font-bold" style={{
            color: user.burnoutScore > 60 ? 'hsl(var(--danger))' : user.burnoutScore > 30 ? 'hsl(var(--warning))' : 'hsl(var(--success))'
          }}>{user.burnoutScore}</span>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted))' }}>
            {user.burnoutScore > 60 ? 'High risk — activate recovery mode' : user.burnoutScore > 30 ? 'Moderate — keep monitoring' : "Low — you're in a good place 🌿"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {burnoutFactors.map((f, i) => (
            <div key={i} className="p-2.5 rounded-xl flex items-center gap-2" style={{ background: 'hsl(var(--surface2))' }}>
              <span className="text-lg">{f.icon}</span>
              <div>
                <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{f.label} ({f.weight}%)</p>
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--text))' }}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recovery Mode */}
      <div className="card-base">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft))' }}>
              <Moon size={18} style={{ color: 'hsl(var(--accent))' }} />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>Recovery Mode</h3>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Softens UI, removes timers & competition</p>
            </div>
          </div>
          <button onClick={() => setRecoveryMode(!recoveryMode)}
            className="relative w-12 h-6 rounded-full transition-all"
            style={{ background: recoveryMode ? 'hsl(var(--accent))' : 'hsl(var(--surface3))' }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{
                left: recoveryMode ? '26px' : '2px',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
          </button>
        </div>
      </div>

      {/* Breathing Exercise */}
      <div className="card-base text-center">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center justify-center gap-2" style={{ color: 'hsl(var(--text))' }}>
          <Wind size={18} style={{ color: 'hsl(var(--accent))' }} /> Breathing Exercise
        </h3>

        <div className="flex gap-2 justify-center mb-6">
          {[
            { type: 'box' as const, label: 'Box (4-4-4-4)' },
            { type: '478' as const, label: '4-7-8 Calming' },
          ].map(b => (
            <button key={b.type} onClick={() => { setBreathType(b.type); setBreathPhase('idle'); clearBreathTimers(); }}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: breathType === b.type ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
                color: breathType === b.type ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text))',
                boxShadow: breathType === b.type ? 'var(--shadow-sm)' : 'none',
              }}>{b.label}</button>
          ))}
        </div>

        <div className="flex justify-center mb-6">
          <motion.div
            animate={{
              scale: breathPhase === 'inhale' ? 1.4 : (breathPhase === 'hold' || breathPhase === 'hold2') ? 1.4 : 1,
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="w-28 h-28 rounded-full flex items-center justify-center relative"
            style={{
              background: `radial-gradient(circle, hsl(var(--accent) / 0.3), hsl(var(--accent) / 0.1))`,
              boxShadow: breathPhase !== 'idle' ? '0 0 40px hsl(var(--accent) / 0.2), 0 0 80px hsl(var(--accent) / 0.1)' : 'none',
            }}>
            <motion.div
              animate={{ scale: breathPhase === 'inhale' ? 1.3 : breathPhase === 'exhale' ? 0.8 : 1 }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(var(--accent) / 0.3)' }}>
              <span className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--accent))' }}>
                {breathPhase === 'idle' ? '🌿' : breathPhase === 'inhale' ? 'In' : breathPhase === 'hold' || breathPhase === 'hold2' ? 'Hold' : 'Out'}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {breathCycles > 0 && (
          <p className="text-[10px] mb-3" style={{ color: 'hsl(var(--muted))' }}>{breathCycles} cycle{breathCycles > 1 ? 's' : ''} completed</p>
        )}

        {breathPhase === 'idle' ? (
          <button onClick={startBreathing} className="btn-3d text-sm px-6 py-2.5">
            {breathCycles > 0 ? 'Another cycle' : 'Start breathing'}
          </button>
        ) : (
          <p className="text-xs font-display" style={{ color: 'hsl(var(--accent))' }}>
            {breathPhase === 'inhale' ? 'Breathe in slowly... 4s' : breathPhase === 'hold' ? (breathType === '478' ? 'Hold gently... 7s' : 'Hold steady... 4s') : breathPhase === 'exhale' ? (breathType === '478' ? 'Release slowly... 8s' : 'Exhale fully... 4s') : 'Hold... 4s'}
          </p>
        )}
      </div>

      {/* CBT Exercises */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft))' }}>
              <Brain size={18} style={{ color: 'hsl(var(--accent))' }} />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>CBT Exercises</h3>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Challenge unhelpful thoughts</p>
            </div>
          </div>
          <button onClick={() => { setShowCBT(!showCBT); setCbtIndex(Math.floor(Math.random() * cbtExercises.length)); setCbtInput(''); }}
            className="btn-3d-ghost text-xs px-4 py-2">{showCBT ? 'Close' : 'Try one →'}</button>
        </div>
        <AnimatePresence>
          {showCBT && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="p-4 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{cbtExercises[cbtIndex].emoji}</span>
                  <div>
                    <h4 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{cbtExercises[cbtIndex].title}</h4>
                    <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{cbtExercises[cbtIndex].desc}</p>
                  </div>
                </div>
                <p className="font-display text-sm italic mb-3" style={{ color: 'hsl(var(--text-secondary))' }}>{cbtExercises[cbtIndex].prompt}</p>
                <textarea value={cbtInput} onChange={e => setCbtInput(e.target.value)}
                  placeholder="Write your thoughts here (private, never shared)..."
                  rows={3} className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none outline-none mb-3"
                  style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
                <div className="flex gap-2">
                  <button onClick={() => setShowCBT(false)} className="btn-3d text-xs px-4 py-2">Done</button>
                  <button onClick={() => { setCbtIndex((cbtIndex + 1) % cbtExercises.length); setCbtInput(''); }}
                    className="btn-3d-ghost text-xs px-3 py-2">Next exercise</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACT Cards */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft))' }}>
              <Heart size={18} style={{ color: 'hsl(var(--accent))' }} />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>ACT Micro-Interventions</h3>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Acceptance & Commitment Therapy</p>
            </div>
          </div>
          <button onClick={() => { setShowACT(!showACT); setActIndex(Math.floor(Math.random() * actInterventions.length)); }}
            className="btn-3d-ghost text-xs px-4 py-2">{showACT ? 'Close' : 'Try one →'}</button>
        </div>
        <AnimatePresence>
          {showACT && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="p-5 rounded-xl text-center" style={{ background: 'hsl(var(--surface2))' }}>
                <span className="text-3xl mb-3 block">{actInterventions[actIndex].emoji}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full mb-3 inline-block"
                  style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                  {actInterventions[actIndex].type.replace('_', ' ')}
                </span>
                <p className="font-display text-base italic mb-2" style={{ color: 'hsl(var(--text))' }}>{actInterventions[actIndex].content}</p>
                <p className="text-sm mb-4" style={{ color: 'hsl(var(--text-secondary))' }}>{actInterventions[actIndex].instruction}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setShowACT(false)} className="btn-3d text-xs px-4 py-2">Done</button>
                  <button onClick={() => setActIndex((actIndex + 1) % actInterventions.length)} className="btn-3d-ghost text-xs px-3 py-2">Next</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grounding Exercise */}
      <div className="card-base">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
          <Smile size={18} style={{ color: 'hsl(var(--accent))' }} /> 5-4-3-2-1 Grounding
        </h3>
        <div className="space-y-2">
          {[
            { num: 5, sense: 'things you can SEE', emoji: '👀', color: 'hsl(var(--accent))' },
            { num: 4, sense: 'things you can TOUCH', emoji: '✋', color: 'hsl(var(--success))' },
            { num: 3, sense: 'things you can HEAR', emoji: '👂', color: 'hsl(var(--warning))' },
            { num: 2, sense: 'things you can SMELL', emoji: '👃', color: 'hsl(var(--danger))' },
            { num: 1, sense: 'thing you can TASTE', emoji: '👅', color: 'hsl(var(--accent))' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
              <span className="text-xl">{item.emoji}</span>
              <div className="flex items-center gap-2">
                <span className="stat-number text-lg font-bold" style={{ color: item.color }}>{item.num}</span>
                <span className="text-sm" style={{ color: 'hsl(var(--text))' }}>{item.sense}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
