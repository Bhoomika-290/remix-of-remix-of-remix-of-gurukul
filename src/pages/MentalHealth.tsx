import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Moon, Heart, Wind, Timer, Brain, Smile } from 'lucide-react';

const actInterventions = [
  { type: 'defusion', content: 'Notice what thoughts showed up about this quiz.', instruction: 'Can you hold them lightly — like clouds passing?' },
  { type: 'self_compassion', content: "This is a hard moment. That's okay.", instruction: 'What would you say to a friend who just struggled with this?' },
  { type: 'values', content: 'Before we start — why does this matter to you?', instruction: 'Take 10 seconds to remember your reason.' },
  { type: 'acceptance', content: 'Some days are harder. That doesn\'t mean you\'re failing.', instruction: 'Can you sit with this feeling without pushing it away?' },
  { type: 'present_moment', content: 'Right now, in this moment, you are safe.', instruction: 'Name 3 things you can see, 2 you can hear, 1 you can feel.' },
];

const cbtExercises = [
  { title: 'Thought Record', desc: 'Identify → Challenge → Reframe', prompt: 'Write down the negative thought you\'re having right now.' },
  { title: 'Cognitive Distortion Check', desc: 'Is this all-or-nothing thinking?', prompt: 'Am I catastrophizing? Is there evidence against this thought?' },
  { title: 'Behavioral Activation', desc: 'Small actions → Better mood', prompt: 'What\'s one small thing you can do right now that you enjoy?' },
];

const MentalHealth = () => {
  const { user } = useApp();
  const { recoveryMode, setRecoveryMode } = useTheme();
  
  // Breathing
  const [breathType, setBreathType] = useState<'478' | 'box'>('box');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'hold2'>('idle');
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
            // Timer done
            setPomodoroActive(false);
            if (pomodoroBreak) {
              setPomodoroBreak(false);
              setPomodoroMinutes(25);
              setPomodoroSeconds(0);
            } else {
              setPomodoroSessions(p => p + 1);
              setPomodoroBreak(true);
              setPomodoroMinutes(5);
              setPomodoroSeconds(0);
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
    if (breathType === '478') {
      setBreathPhase('inhale');
      breathTimer.current.push(setTimeout(() => setBreathPhase('hold'), 4000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('exhale'), 11000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('idle'), 19000));
    } else {
      // Box breathing: 4-4-4-4
      setBreathPhase('inhale');
      breathTimer.current.push(setTimeout(() => setBreathPhase('hold'), 4000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('exhale'), 8000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('hold2'), 12000));
      breathTimer.current.push(setTimeout(() => setBreathPhase('idle'), 16000));
    }
  };

  useEffect(() => () => clearBreathTimers(), []);

  // Dynamic burnout
  const burnoutFactors = [
    { label: 'Mood', value: user.mood || 'Not set', weight: 30 },
    { label: 'Streak', value: `${user.streak} days`, weight: 25 },
    { label: 'Study time', value: user.studyTime || 'Varies', weight: 25 },
    { label: 'Session load', value: `${pomodoroSessions} today`, weight: 20 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--text))' }}>Mental Wellbeing</h2>
      <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>Your emotional state is a learning variable, not a separate problem.</p>

      {/* Pomodoro Timer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center justify-center gap-2" style={{ color: 'hsl(var(--text))' }}>
          <Timer size={18} style={{ color: 'hsl(var(--accent))' }} /> Focus Timer (Pomodoro)
        </h3>
        
        <div className="mb-4">
          <p className="stat-number text-5xl font-bold" style={{ color: pomodoroBreak ? 'hsl(var(--success))' : 'hsl(var(--accent))' }}>
            {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted))' }}>
            {pomodoroBreak ? '☕ Break time' : '📚 Focus time'} · {pomodoroSessions} sessions today
          </p>
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
            className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Reset</button>
        </div>
      </motion.div>

      {/* Burnout Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
        <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'hsl(var(--text))' }}>Burnout Risk Score</h3>
        <div className="relative w-48 h-24 mx-auto mb-3">
          <svg viewBox="0 0 120 60" className="w-full h-full">
            <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--surface2))" strokeWidth="10" strokeLinecap="round" />
            <path d="M 10 55 A 50 50 0 0 1 43 12" fill="none" stroke="hsl(var(--success))" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
            <path d="M 43 12 A 50 50 0 0 1 77 12" fill="none" stroke="hsl(var(--warning))" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
            <path d="M 77 12 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--danger))" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
            <line x1="60" y1="55"
              x2={60 + 40 * Math.cos(Math.PI - (user.burnoutScore / 100) * Math.PI)}
              y2={55 - 40 * Math.sin(Math.PI - (user.burnoutScore / 100) * Math.PI)}
              stroke="hsl(var(--text))" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="55" r="4" fill="hsl(var(--text))" />
          </svg>
        </div>
        <span className="stat-number text-3xl font-bold" style={{
          color: user.burnoutScore > 60 ? 'hsl(var(--danger))' : user.burnoutScore > 30 ? 'hsl(var(--warning))' : 'hsl(var(--success))'
        }}>{user.burnoutScore}</span>
        <p className="text-xs mt-1 mb-3" style={{ color: 'hsl(var(--muted))' }}>
          {user.burnoutScore > 60 ? 'High risk — consider recovery mode' : user.burnoutScore > 30 ? 'Moderate — keep monitoring' : "Low — you're in a good place"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {burnoutFactors.map((f, i) => (
            <div key={i} className="p-2 rounded-lg text-left" style={{ background: 'hsl(var(--surface2))' }}>
              <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{f.label} ({f.weight}%)</p>
              <p className="text-xs font-medium" style={{ color: 'hsl(var(--text-secondary))' }}>{f.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recovery Mode */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon size={18} style={{ color: 'hsl(var(--accent))' }} />
            <h3 className="font-display text-base font-semibold" style={{ color: 'hsl(var(--text))' }}>Recovery Mode</h3>
          </div>
          <button onClick={() => setRecoveryMode(!recoveryMode)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: recoveryMode ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
              color: recoveryMode ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text))',
            }}>
            {recoveryMode ? 'Active' : 'Inactive'}
          </button>
        </div>
        <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          Softens the UI, removes timers & competition, locks difficulty to easy. For days when you need it.
        </p>
      </div>

      {/* Breathing Exercise - Box + 4-7-8 */}
      <div className="card-base text-center">
        <h3 className="font-display text-base font-semibold mb-4" style={{ color: 'hsl(var(--text))' }}>
          <Wind size={16} className="inline mr-2" /> Breathing Exercise
        </h3>
        
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={() => { setBreathType('box'); setBreathPhase('idle'); clearBreathTimers(); }}
            className="px-3 py-1 rounded-lg text-xs font-medium border"
            style={{
              background: breathType === 'box' ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
              borderColor: breathType === 'box' ? 'hsl(var(--accent))' : 'hsl(var(--border))',
              color: 'hsl(var(--text))',
            }}>Box Breathing (4-4-4-4)</button>
          <button onClick={() => { setBreathType('478'); setBreathPhase('idle'); clearBreathTimers(); }}
            className="px-3 py-1 rounded-lg text-xs font-medium border"
            style={{
              background: breathType === '478' ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
              borderColor: breathType === '478' ? 'hsl(var(--accent))' : 'hsl(var(--border))',
              color: 'hsl(var(--text))',
            }}>4-7-8 Breathing</button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-[4000ms]"
            style={{
              background: `hsl(var(--accent) / ${breathPhase === 'idle' ? '0.2' : '0.4'})`,
              transform: breathPhase === 'inhale' ? 'scale(1.3)' : (breathPhase === 'hold' || breathPhase === 'hold2') ? 'scale(1.3)' : 'scale(1)',
              transition: breathPhase === 'inhale' ? 'transform 4s ease' : breathPhase === 'exhale' ? 'transform 4s ease' : 'transform 0.3s ease',
            }}>
            <span className="font-display text-sm" style={{ color: 'hsl(var(--accent))' }}>
              {breathPhase === 'idle' ? 'Ready' : breathPhase === 'inhale' ? 'Breathe in' : breathPhase === 'hold' || breathPhase === 'hold2' ? 'Hold' : 'Breathe out'}
            </span>
          </div>
        </div>
        {breathPhase === 'idle' ? (
          <button onClick={startBreathing} className="btn-3d text-sm px-6 py-2.5">Start breathing exercise</button>
        ) : (
          <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
            {breathPhase === 'inhale' ? '4 seconds...' : breathPhase === 'hold' ? (breathType === '478' ? '7 seconds...' : '4 seconds...') : breathPhase === 'exhale' ? (breathType === '478' ? '8 seconds...' : '4 seconds...') : '4 seconds...'}
          </p>
        )}
      </div>

      {/* CBT Exercises */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold" style={{ color: 'hsl(var(--text))' }}>
            <Brain size={16} className="inline mr-2" style={{ color: 'hsl(var(--accent))' }} />
            CBT Exercises
          </h3>
          <button onClick={() => { setShowCBT(!showCBT); setCbtIndex(Math.floor(Math.random() * cbtExercises.length)); setCbtInput(''); }}
            className="text-xs font-medium" style={{ color: 'hsl(var(--accent))' }}>
            {showCBT ? 'Close' : 'Try one →'}
          </button>
        </div>
        <AnimatePresence>
          {showCBT && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card-base">
              <h4 className="font-display text-sm font-semibold mb-1" style={{ color: 'hsl(var(--text))' }}>{cbtExercises[cbtIndex].title}</h4>
              <p className="text-xs mb-3" style={{ color: 'hsl(var(--muted))' }}>{cbtExercises[cbtIndex].desc}</p>
              <p className="font-display text-sm italic mb-3" style={{ color: 'hsl(var(--text-secondary))' }}>{cbtExercises[cbtIndex].prompt}</p>
              <textarea value={cbtInput} onChange={e => setCbtInput(e.target.value)}
                placeholder="Write your thoughts here (private, never shared)..."
                rows={3} className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none outline-none mb-3"
                style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
              <div className="flex gap-2 justify-center">
                <button onClick={() => setShowCBT(false)} className="btn-3d text-xs px-4 py-2">Done</button>
                <button onClick={() => { setCbtIndex((cbtIndex + 1) % cbtExercises.length); setCbtInput(''); }}
                  className="btn-3d-ghost text-xs px-3 py-2">Next exercise</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACT Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold" style={{ color: 'hsl(var(--text))' }}>
            <Heart size={16} className="inline mr-2" style={{ color: 'hsl(var(--accent))' }} />
            ACT Micro-Interventions
          </h3>
          <button onClick={() => { setShowACT(!showACT); setActIndex(Math.floor(Math.random() * actInterventions.length)); }}
            className="text-xs font-medium" style={{ color: 'hsl(var(--accent))' }}>
            {showACT ? 'Close' : 'Try one →'}
          </button>
        </div>
        <AnimatePresence>
          {showACT && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card-base text-center">
              <span className="text-xs px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--muted))' }}>
                {actInterventions[actIndex].type.replace('_', ' ')}
              </span>
              <p className="font-display text-base italic mb-2" style={{ color: 'hsl(var(--text))' }}>{actInterventions[actIndex].content}</p>
              <p className="text-sm mb-4" style={{ color: 'hsl(var(--text-secondary))' }}>{actInterventions[actIndex].instruction}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setShowACT(false)} className="btn-3d text-xs px-4 py-2">Done</button>
                <button onClick={() => setActIndex((actIndex + 1) % actInterventions.length)} className="btn-3d-ghost text-xs px-3 py-2">Next</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grounding Exercise */}
      <div className="card-base">
        <h3 className="font-display text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
          <Smile size={16} style={{ color: 'hsl(var(--accent))' }} /> 5-4-3-2-1 Grounding
        </h3>
        <div className="space-y-2">
          {[
            { num: 5, sense: 'things you can SEE', emoji: '👀' },
            { num: 4, sense: 'things you can TOUCH', emoji: '✋' },
            { num: 3, sense: 'things you can HEAR', emoji: '👂' },
            { num: 2, sense: 'things you can SMELL', emoji: '👃' },
            { num: 1, sense: 'thing you can TASTE', emoji: '👅' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm" style={{ color: 'hsl(var(--text))' }}>
                <strong>{item.num}</strong> {item.sense}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
