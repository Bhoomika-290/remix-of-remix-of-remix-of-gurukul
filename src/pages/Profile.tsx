import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Award, Flame, Target, BookOpen, Clock, TrendingUp, BarChart3, Brain, Trophy, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell } from 'recharts';

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
  const { recoveryMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'quests'>('overview');

  // Learning pulse data (ECG-like)
  const pulseData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d, i) => ({
      day: d,
      focus: Math.floor(30 + Math.random() * 70),
      accuracy: Math.floor(40 + Math.random() * 55),
      energy: Math.floor(20 + Math.random() * 80),
    }));
  }, []);

  // Subject completion data
  const subjectData = useMemo(() => {
    const subs = user.subjects.length > 0 ? user.subjects : ['Physics', 'Chemistry', 'Mathematics'];
    return subs.map(s => ({
      subject: s.slice(0, 4),
      fullName: s,
      completion: Math.floor(15 + Math.random() * 70),
      quizzes: Math.floor(2 + Math.random() * 15),
      accuracy: Math.floor(40 + Math.random() * 50),
    }));
  }, [user.subjects]);

  // Radar chart data for skill analysis
  const radarData = useMemo(() => [
    { skill: 'Accuracy', value: 72 },
    { skill: 'Speed', value: 58 },
    { skill: 'Consistency', value: 85 },
    { skill: 'Retention', value: 63 },
    { skill: 'Focus', value: 70 },
    { skill: 'Resilience', value: 78 },
  ], []);

  // Weekly quests
  const quests = [
    { title: 'Complete 5 quizzes', progress: 3, total: 5, xp: 50 },
    { title: 'Defeat 2 bosses', progress: 1, total: 2, xp: 40 },
    { title: 'Study 3 different subjects', progress: 2, total: 3, xp: 30 },
    { title: 'Maintain 3-day streak', progress: Math.min(user.streak, 3), total: 3, xp: 35 },
    { title: '5 Pomodoro sessions', progress: 2, total: 5, xp: 45 },
  ];

  // Concept map data
  const learnHistory = JSON.parse(localStorage.getItem('saathi-learn-history') || '[]');
  const completedTopics = learnHistory.filter((h: any) => h.completed).length;
  const totalTopics = learnHistory.length || 1;

  // Leaderboard
  const leaderboard = [
    { name: 'Arjun K.', xp: 520, streak: 12 },
    { name: user.name || 'You', xp: user.xp, streak: user.streak },
    { name: 'Priya S.', xp: 410, streak: 8 },
    { name: 'Rohit M.', xp: 380, streak: 5 },
    { name: 'Ananya P.', xp: 350, streak: 9 },
    { name: 'Vikram R.', xp: 290, streak: 4 },
  ].sort((a, b) => b.xp - a.xp);

  const userRank = leaderboard.findIndex(p => p.name === (user.name || 'You')) + 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display font-bold mx-auto"
            style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))',
              boxShadow: '0 8px 24px hsl(var(--accent) / 0.2), inset 0 -3px 6px rgba(0,0,0,0.1), inset 0 3px 6px rgba(255,255,255,0.2)',
            }}>
            {user.name?.[0] || '?'}
          </div>
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
            <div className="h-full rounded-full transition-all" style={{ width: `${(user.xp / 500) * 100}%`, background: 'hsl(var(--accent))' }} />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Flame size={18} />, value: user.streak, label: 'Day Streak', color: 'hsl(var(--warning))' },
          { icon: <Target size={18} />, value: '78%', label: 'Avg Accuracy', color: 'hsl(var(--accent))' },
          { icon: <BookOpen size={18} />, value: completedTopics, label: 'Topics Done', color: 'hsl(var(--success))' },
          { icon: <Trophy size={18} />, value: `#${userRank}`, label: 'Rank', color: 'hsl(var(--warning))' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card-base text-center">
            <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
            <p className="stat-number text-xl font-bold" style={{ color: 'hsl(var(--text))' }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
        {(['overview', 'subjects', 'quests'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize"
            style={{
              background: activeTab === tab ? 'hsl(var(--surface))' : 'transparent',
              color: activeTab === tab ? 'hsl(var(--text))' : 'hsl(var(--muted))',
              boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
            }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Learning Pulse Chart */}
          <div className="card-base">
            <h3 className="font-display text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <TrendingUp size={16} style={{ color: 'hsl(var(--accent))' }} /> Learning Pulse
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pulseData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 11, color: 'hsl(var(--text))' }} />
                  <Line type="monotone" dataKey="focus" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Focus" />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Accuracy" />
                  <Line type="monotone" dataKey="energy" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="Energy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-2">
              {[{ label: 'Focus', color: 'hsl(var(--accent))' }, { label: 'Accuracy', color: 'hsl(var(--success))' }, { label: 'Energy', color: 'hsl(var(--warning))' }].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Radar */}
          <div className="card-base">
            <h3 className="font-display text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <Brain size={16} style={{ color: 'hsl(var(--accent))' }} /> Skill Analysis
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'hsl(var(--muted))' }} />
                  <Radar dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard — hidden in recovery mode */}
          {!recoveryMode && (
          <div className="card-base">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <Trophy size={16} style={{ color: 'hsl(var(--warning))' }} /> Leaderboard
            </h3>
            <div className="space-y-1">
              {leaderboard.map((p, i) => {
                const isUser = p.name === (user.name || 'You');
                return (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all"
                    style={{
                      background: isUser ? 'hsl(var(--accent-soft))' : 'transparent',
                      borderLeft: isUser ? '3px solid hsl(var(--accent))' : '3px solid transparent',
                    }}>
                    <span className="w-6 text-center stat-number text-sm font-bold" style={{ color: i === 0 ? 'hsl(var(--warning))' : 'hsl(var(--muted))' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: isUser ? 'hsl(var(--accent))' : 'hsl(var(--surface2))', color: isUser ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted))' }}>
                      {p.name[0]}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate" style={{ color: 'hsl(var(--text))' }}>{p.name}</span>
                    <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>🔥{p.streak}</span>
                    <span className="stat-number text-sm font-bold" style={{ color: 'hsl(var(--accent))' }}>{p.xp} XP</span>
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Subject Completion Bars */}
          <div className="card-base">
            <h3 className="font-display text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <BarChart3 size={16} style={{ color: 'hsl(var(--accent))' }} /> Subject Progress
            </h3>
            <div className="space-y-4">
              {subjectData.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--text))' }}>{s.fullName}</span>
                    <span className="stat-number text-xs" style={{ color: 'hsl(var(--accent))' }}>{s.completion}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'hsl(var(--surface2))' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.completion}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: s.completion > 60 ? 'hsl(var(--success))' : s.completion > 30 ? 'hsl(var(--accent))' : 'hsl(var(--warning))' }} />
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{s.quizzes} quizzes taken</span>
                    <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{s.accuracy}% accuracy</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Concept Map */}
          <div className="card-base">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <BookOpen size={16} style={{ color: 'hsl(var(--accent))' }} /> Concept Map
            </h3>
            {learnHistory.length > 0 ? (
              <div className="space-y-2">
                {learnHistory.slice(-8).map((h: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                      style={{
                        background: h.completed ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--warning) / 0.15)',
                        color: h.completed ? 'hsl(var(--success))' : 'hsl(var(--warning))',
                      }}>
                      {h.completed ? '✓' : `${h.step + 1}/5`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'hsl(var(--text))' }}>{h.subject} · {h.subtopic}</p>
                      <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{h.completed ? 'Completed' : 'In progress'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: 'hsl(var(--muted))' }}>Start learning to build your concept map!</p>
            )}
          </div>

          {/* Subject Bar Chart */}
          <div className="card-base">
            <h3 className="font-display text-sm font-semibold mb-4" style={{ color: 'hsl(var(--text))' }}>Quiz Performance by Subject</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 11, color: 'hsl(var(--text))' }} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} name="Accuracy %">
                    {subjectData.map((_, i) => (
                      <Cell key={i} fill={`hsl(var(--accent) / ${0.5 + i * 0.15})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quests' && (
        <div className="space-y-6">
          {/* Weekly Quests */}
          <div className="card-base">
            <h3 className="font-display text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <Zap size={16} style={{ color: 'hsl(var(--warning))' }} /> Weekly Quests
            </h3>
            <div className="space-y-3">
              {quests.map((q, i) => {
                const done = q.progress >= q.total;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-3 rounded-xl" style={{ background: done ? 'hsl(var(--success) / 0.08)' : 'hsl(var(--surface2))' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: done ? 'hsl(var(--success))' : 'hsl(var(--text))' }}>
                        {done ? '✓ ' : ''}{q.title}
                      </span>
                      <span className="stat-number text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>+{q.xp} XP</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'hsl(var(--surface3))' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${(q.progress / q.total) * 100}%`,
                        background: done ? 'hsl(var(--success))' : 'hsl(var(--accent))',
                      }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>{q.progress}/{q.total}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <Award size={16} style={{ color: 'hsl(var(--accent))' }} /> Badges
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
        </div>
      )}

      {/* Weekly Report */}
      <div className="card-base">
        <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>📊 Weekly Report Card</h3>
        <div className="grid grid-cols-3 gap-3 text-center mb-3">
          <div>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>+{Math.floor(user.xp * 0.3)}</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>XP this week</p>
          </div>
          <div>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>82%</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Accuracy</p>
          </div>
          <div>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--warning))' }}>Top 15%</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Percentile</p>
          </div>
        </div>
        <p className="font-display text-xs italic" style={{ color: 'hsl(var(--text-secondary))' }}>
          "You studied while anxious 3 times this week — that's rare discipline."
        </p>
      </div>
    </div>
  );
};

export default Profile;
