import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Award, Flame, Target, BookOpen, Clock } from 'lucide-react';

const badges = [
  { id: 'onFire', emoji: '🔥', label: 'On Fire', desc: '5 correct in a row', earned: true },
  { id: 'comebackKid', emoji: '💪', label: 'Comeback Kid', desc: 'Improved after failing', earned: true },
  { id: 'nightOwl', emoji: '🦉', label: 'Night Owl', desc: 'Studied after 10pm', earned: true },
  { id: 'earlyBird', emoji: '🐦', label: 'Early Bird', desc: 'Studied before 8am', earned: false },
  { id: 'resilient', emoji: '🌿', label: 'Resilient', desc: 'Session with low wellbeing', earned: true },
  { id: 'bigBrain', emoji: '🧠', label: 'Big Brain', desc: '100% on hard', earned: false },
  { id: 'bossSlayer', emoji: '⚔️', label: 'Boss Slayer', desc: '10 bosses defeated', earned: false },
  { id: 'focusMaster', emoji: '🎯', label: 'Focus Master', desc: '5 Pomodoros in one day', earned: false },
  { id: 'saathiStar', emoji: '⭐', label: 'Saathi Star', desc: 'Helped 5 peers', earned: false },
];

const Profile = () => {
  const { user } = useApp();
  const { theme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display font-bold mx-auto"
            style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
            {user.name?.[0] || '?'}
          </div>
          <div className="absolute inset-0 w-24 h-24 -m-2 rounded-full border-2 animate-pulse-ring"
            style={{ borderColor: 'hsl(var(--accent) / 0.4)' }} />
        </div>
        <h2 className="font-display text-xl font-bold" style={{ color: 'hsl(var(--text))' }}>{user.name || 'Student'}</h2>
        <p className="font-display text-sm italic" style={{ color: 'hsl(var(--muted))' }}>{user.heroTitle} · Level {user.heroLevel}</p>
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>{user.examType.toUpperCase()} · {user.subjects.join(', ')}</p>

        <div className="mt-4 mx-auto max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'hsl(var(--muted))' }}>XP to next level</span>
            <span className="stat-number" style={{ color: 'hsl(var(--accent))' }}>{user.xp}/500</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'hsl(var(--surface2))' }}>
            <div className="h-full rounded-full" style={{ width: `${(user.xp / 500) * 100}%`, background: 'hsl(var(--accent))' }} />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Flame size={18} />, value: user.streak, label: 'Day Streak' },
          { icon: <Target size={18} />, value: '78%', label: 'Avg Accuracy' },
          { icon: <BookOpen size={18} />, value: '47', label: 'Sessions' },
          { icon: <Clock size={18} />, value: '24h', label: 'Total Study' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card-base text-center">
            <div className="flex justify-center mb-2" style={{ color: 'hsl(var(--accent))' }}>{stat.icon}</div>
            <p className="stat-number text-xl font-bold" style={{ color: 'hsl(var(--text))' }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>
          <Award size={18} className="inline mr-2" style={{ color: 'hsl(var(--accent))' }} />
          Badges
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card-base text-center py-4"
              style={{ opacity: b.earned ? 1 : 0.4 }}>
              <span className="text-2xl mb-1 block">{b.emoji}</span>
              <p className="text-xs font-semibold" style={{ color: 'hsl(var(--text))' }}>{b.label}</p>
              <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Report Preview */}
      <div className="card-base">
        <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>📊 Weekly Report</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>+120</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>XP this week</p>
          </div>
          <div>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>82%</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Accuracy</p>
          </div>
          <div>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>Top 15%</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Percentile</p>
          </div>
        </div>
        <p className="font-display text-xs italic mt-3" style={{ color: 'hsl(var(--text-secondary))' }}>
          "You studied while anxious 3 times this week — that's rare discipline."
        </p>
      </div>
    </div>
  );
};

export default Profile;
