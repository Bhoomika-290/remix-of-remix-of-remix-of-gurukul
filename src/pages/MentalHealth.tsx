import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Moon, Heart, Wind } from 'lucide-react';

const actInterventions = [
  {
    type: 'defusion',
    content: 'Notice what thoughts showed up about this quiz.',
    instruction: 'Can you hold them lightly — like clouds passing?',
  },
  {
    type: 'self_compassion',
    content: "This is a hard moment. That's okay.",
    instruction: 'What would you say to a friend who just struggled with this?',
  },
  {
    type: 'values',
    content: 'Before we start — why does this matter to you?',
    instruction: 'Take 10 seconds to remember your reason.',
  },
];

const MentalHealth = () => {
  const { user } = useApp();
  const { recoveryMode, setRecoveryMode } = useTheme();
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [showACT, setShowACT] = useState(false);
  const [actIndex, setActIndex] = useState(0);

  const startBreathing = () => {
    setBreathPhase('inhale');
    // 4-7-8 cycle
    setTimeout(() => setBreathPhase('hold'), 4000);
    setTimeout(() => setBreathPhase('exhale'), 11000);
    setTimeout(() => setBreathPhase('idle'), 19000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--text))' }}>Mental Wellbeing</h2>
      <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>
        Your emotional state is a learning variable, not a separate problem.
      </p>

      {/* Burnout Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
        <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'hsl(var(--text))' }}>Burnout Risk Score</h3>
        <div className="relative w-48 h-24 mx-auto mb-3">
          <svg viewBox="0 0 120 60" className="w-full h-full">
            <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--surface2))" strokeWidth="10" strokeLinecap="round" />
            <path d="M 10 55 A 50 50 0 0 1 43 12" fill="none" stroke="hsl(var(--success))" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
            <path d="M 43 12 A 50 50 0 0 1 77 12" fill="none" stroke="hsl(var(--warning))" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
            <path d="M 77 12 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--danger))" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
            <line
              x1="60" y1="55"
              x2={60 + 40 * Math.cos(Math.PI - (user.burnoutScore / 100) * Math.PI)}
              y2={55 - 40 * Math.sin(Math.PI - (user.burnoutScore / 100) * Math.PI)}
              stroke="hsl(var(--text))" strokeWidth="2.5" strokeLinecap="round"
            />
            <circle cx="60" cy="55" r="4" fill="hsl(var(--text))" />
          </svg>
        </div>
        <span className="stat-number text-3xl font-bold" style={{
          color: user.burnoutScore > 60 ? 'hsl(var(--danger))' : user.burnoutScore > 30 ? 'hsl(var(--warning))' : 'hsl(var(--success))'
        }}>
          {user.burnoutScore}
        </span>
        <p className="text-xs mt-1 mb-3" style={{ color: 'hsl(var(--muted))' }}>
          {user.burnoutScore > 60 ? 'High risk — consider recovery mode' :
            user.burnoutScore > 30 ? 'Moderate — keep monitoring' : 'Low — you're in a good place'}
        </p>
        <p className="text-xs p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text-secondary))' }}>
          Factors: Mood trend (30%) · Break habits (25%) · Study timing (25%) · Session load (20%)
        </p>
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

      {/* Breathing Exercise */}
      <div className="card-base text-center">
        <h3 className="font-display text-base font-semibold mb-4" style={{ color: 'hsl(var(--text))' }}>
          <Wind size={16} className="inline mr-2" />
          4-7-8 Breathing
        </h3>
        <div className="flex justify-center mb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-[4000ms]"
            style={{
              background: `hsl(var(--accent) / ${breathPhase === 'idle' ? '0.2' : '0.4'})`,
              transform: breathPhase === 'inhale' ? 'scale(1.3)' : breathPhase === 'hold' ? 'scale(1.3)' : 'scale(1)',
              transition: breathPhase === 'inhale' ? 'transform 4s ease' : breathPhase === 'exhale' ? 'transform 8s ease' : 'transform 0.3s ease',
            }}
          >
            <span className="font-display text-sm" style={{ color: 'hsl(var(--accent))' }}>
              {breathPhase === 'idle' ? 'Ready' : breathPhase === 'inhale' ? 'Breathe in' : breathPhase === 'hold' ? 'Hold' : 'Breathe out'}
            </span>
          </div>
        </div>
        {breathPhase === 'idle' ? (
          <button onClick={startBreathing} className="btn-3d text-sm px-6 py-2.5">
            Start breathing exercise
          </button>
        ) : (
          <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
            {breathPhase === 'inhale' ? '4 seconds...' : breathPhase === 'hold' ? '7 seconds...' : '8 seconds...'}
          </p>
        )}
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
        {showACT && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
            <p className="font-display text-base italic mb-2" style={{ color: 'hsl(var(--text))' }}>
              {actInterventions[actIndex].content}
            </p>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--text-secondary))' }}>
              {actInterventions[actIndex].instruction}
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowACT(false)} className="btn-3d text-xs px-4 py-2">Done</button>
              <button onClick={() => setShowACT(false)} className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Skip</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MentalHealth;
