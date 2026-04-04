import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Award, Flame, Target, BookOpen, Clock, TrendingUp, BarChart3, Brain, Trophy, Zap, Heart, Activity, Moon, Sun, Droplets, Dumbbell, PenLine, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, FileText, Search, Star, Shield, Gamepad2, Users, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';

// --- Badge data with categories ---
const allBadges = [
  // Study
  { id: 'onFire', icon: <Flame size={18}/>, label: 'On Fire', desc: '5 correct in a row', earned: true, category: 'study' },
  { id: 'comebackKid', icon: <Shield size={18}/>, label: 'Comeback Kid', desc: 'Improved after failing', earned: true, category: 'study' },
  { id: 'nightOwl', icon: <Moon size={18}/>, label: 'Night Owl', desc: 'Studied after 10pm', earned: true, category: 'study' },
  { id: 'earlyBird', icon: <Sun size={18}/>, label: 'Early Bird', desc: 'Studied before 8am', earned: false, category: 'study' },
  { id: 'bigBrain', icon: <Brain size={18}/>, label: 'Big Brain', desc: '100% on hard', earned: false, category: 'study' },
  { id: 'bossSlayer', icon: <Zap size={18}/>, label: 'Boss Slayer', desc: '10 bosses defeated', earned: false, category: 'study' },
  { id: 'focusMaster', icon: <Target size={18}/>, label: 'Focus Master', desc: '5 Pomodoros in one day', earned: false, category: 'study' },
  // Revision
  { id: 'firstFlash', icon: <BookOpen size={18}/>, label: 'First Flashcard', desc: 'Created first card', earned: true, category: 'revision' },
  { id: '100cards', icon: <BarChart3 size={18}/>, label: '100 Cards', desc: 'Reviewed 100 cards', earned: false, category: 'revision' },
  { id: 'deckMaster', icon: <Award size={18}/>, label: 'Deck Master', desc: 'Mastered a full deck', earned: false, category: 'revision' },
  // Wellbeing
  { id: 'firstBreath', icon: <Heart size={18}/>, label: 'First Breathing', desc: 'Completed breathing', earned: true, category: 'wellbeing' },
  { id: 'moodStreak7', icon: <Activity size={18}/>, label: '7-Day Mood', desc: '7-day mood streak', earned: false, category: 'wellbeing' },
  { id: 'cbtChamp', icon: <Brain size={18}/>, label: 'CBT Champion', desc: '10 CBT exercises', earned: false, category: 'wellbeing' },
  { id: 'zenMaster', icon: <Star size={18}/>, label: 'Zen Master', desc: '30 wellness activities', earned: false, category: 'wellbeing' },
  // Social
  { id: 'firstRoom', icon: <Users size={18}/>, label: 'First Room', desc: 'Joined a study room', earned: true, category: 'social' },
  { id: 'helped10', icon: <Sparkles size={18}/>, label: 'Peer Helper', desc: 'Helped 10 peers', earned: false, category: 'social' },
  { id: 'resilient', icon: <Shield size={18}/>, label: 'Resilient', desc: 'Session with low wellbeing', earned: true, category: 'study' },
];

const Profile = () => {
  const { user } = useApp();
  const { recoveryMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'quests' | 'wellbeing'>('overview');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [moodRange, setMoodRange] = useState<'7d' | '30d'>('7d');

  // --- Data ---
  const pulseData = useMemo(() => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({
    day: d, focus: Math.floor(30+Math.random()*70), accuracy: Math.floor(40+Math.random()*55), energy: Math.floor(20+Math.random()*80),
  })), []);

  const subjectData = useMemo(() => {
    const subs = user.subjects.length > 0 ? user.subjects : ['Physics','Chemistry','Mathematics'];
    return subs.map(s => ({
      subject: s.slice(0,4), fullName: s,
      completion: Math.floor(15+Math.random()*70), quizzes: Math.floor(2+Math.random()*15),
      accuracy: Math.floor(40+Math.random()*50), timeSpent: `${Math.floor(1+Math.random()*8)}h ${Math.floor(Math.random()*59)}m`,
      topicsCompleted: Math.floor(1+Math.random()*12), streak: Math.floor(1+Math.random()*7), rank: Math.floor(1+Math.random()*20),
      topics: [
        { name: 'Basics', quizzes: 3, accuracy: 85, mastery: 'high', lastAttempted: '2d ago', status: '✅' },
        { name: 'Intermediate', quizzes: 5, accuracy: 62, mastery: 'medium', lastAttempted: '1d ago', status: '⚠️' },
        { name: 'Advanced', quizzes: 2, accuracy: 40, mastery: 'low', lastAttempted: '5d ago', status: '❌' },
      ],
      strengths: ['Basics', 'Formulas', 'Theory'],
      weaknesses: ['Problem Solving', 'Applications', 'Proofs'],
    }));
  }, [user.subjects]);

  const radarData = useMemo(() => [
    { skill: 'Accuracy', value: 72 }, { skill: 'Speed', value: 58 }, { skill: 'Consistency', value: 85 },
    { skill: 'Retention', value: 63 }, { skill: 'Focus', value: 70 }, { skill: 'Resilience', value: 78 },
  ], []);

  const learnHistory = JSON.parse(localStorage.getItem('saathi-learn-history') || '[]');
  const completedTopics = learnHistory.filter((h: any) => h.completed).length;

  const leaderboard = [
    { name: 'Arjun K.', xp: 520, streak: 12 },
    { name: user.name || 'You', xp: user.xp, streak: user.streak },
    { name: 'Priya S.', xp: 410, streak: 8 },
    { name: 'Rohit M.', xp: 380, streak: 5 },
    { name: 'Ananya P.', xp: 350, streak: 9 },
  ].sort((a, b) => b.xp - a.xp);
  const userRank = leaderboard.findIndex(p => p.name === (user.name || 'You')) + 1;

  // Wellbeing data
  const moodData = useMemo(() => {
    const days = moodRange === '7d' ? 7 : 30;
    return Array.from({ length: days }, (_, i) => ({
      day: `D${i + 1}`, mood: Math.floor(2 + Math.random() * 3), burnout: Math.floor(20 + Math.random() * 50),
    }));
  }, [moodRange]);

  const moodCalendar = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    day: i + 1, mood: Math.floor(1 + Math.random() * 5), note: i % 5 === 0 ? 'Felt good after breathing' : '',
  })), []);

  const sleepData = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ day: `D${i+1}`, hours: 5 + Math.random() * 3 })), []);
  const anxietyData = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ day: `D${i+1}`, level: 2 + Math.random() * 6 })), []);

  const habitData = useMemo(() => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({
    day: d, pct: Math.floor(30 + Math.random() * 70),
  })), []);

  const recentActivities = [
    { icon: <Target size={14}/>, text: 'Completed Physics quiz — 80%', time: '2h ago' },
    { icon: <Heart size={14}/>, text: 'Breathing exercise completed', time: '3h ago' },
    { icon: <BookOpen size={14}/>, text: 'Reviewed 12 flashcards', time: '5h ago' },
    { icon: <Brain size={14}/>, text: 'CBT thought reframe done', time: '6h ago' },
    { icon: <Flame size={14}/>, text: 'Streak extended to 7 days!', time: 'Yesterday' },
  ];

  const wellbeingActivities = [
    { text: '4-7-8 Breathing', time: '2h ago', type: 'breathing' },
    { text: 'CBT Thought Reframe', time: '5h ago', type: 'cbt' },
    { text: '25min Focus Session', time: '6h ago', type: 'focus' },
    { text: 'Mood check-in: 😊', time: 'Yesterday', type: 'mood' },
    { text: '5-4-3-2-1 Grounding', time: '2d ago', type: 'grounding' },
  ];

  const journalEntries = [
    { mood: '😊', note: 'Good study session, felt productive', time: 'Today 2:30 PM', sleep: 7, anxiety: 3 },
    { mood: '😐', note: 'Average day, a bit tired', time: 'Yesterday 9 PM', sleep: 6, anxiety: 5 },
    { mood: '😢', note: 'Stressed about exam prep', time: '2 days ago', sleep: 5, anxiety: 7 },
    { mood: '😊', note: 'Great score on practice test!', time: '3 days ago', sleep: 8, anxiety: 2 },
  ];

  // Quests
  const weeklyQuests = [
    { title: 'Complete 5 quizzes', progress: 3, total: 5, xp: 50 },
    { title: 'Defeat 2 bosses', progress: 1, total: 2, xp: 40 },
    { title: 'Study 3 subjects', progress: 2, total: 3, xp: 30 },
    { title: 'Maintain 3-day streak', progress: Math.min(user.streak, 3), total: 3, xp: 35 },
    { title: '5 Pomodoro sessions', progress: 2, total: 5, xp: 45 },
  ];

  const dailyQuests = [
    { title: 'Review 10 flashcards', progress: 4, total: 10, xp: 15 },
    { title: 'Log your mood', progress: 1, total: 1, xp: 5 },
    { title: 'Do breathing exercise', progress: 0, total: 1, xp: 10 },
    { title: 'Complete 1 quiz', progress: 0, total: 1, xp: 20 },
  ];

  const milestoneQuests = [
    { title: 'Review 500 flashcards', progress: 87, total: 500, xp: 200 },
    { title: '30-day streak', progress: user.streak, total: 30, xp: 300 },
    { title: 'Master 10 topics', progress: completedTopics, total: 10, xp: 250 },
  ];

  const questHistory = [
    { title: 'Complete 3 quizzes', date: '2 days ago', xp: 30 },
    { title: 'First breathing exercise', date: '3 days ago', xp: 10 },
    { title: '3-day streak', date: '4 days ago', xp: 35 },
  ];

  const moodEmojis = ['', '😢', '😟', '😐', '😊', '😁'];
  const moodColors = ['', 'hsl(0 60% 50%)', 'hsl(30 70% 50%)', 'hsl(45 70% 50%)', 'hsl(100 50% 45%)', 'hsl(140 50% 40%)'];

  const QuestCard = ({ q, i }: { q: typeof weeklyQuests[0]; i: number }) => {
    const done = q.progress >= q.total;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        className="p-3 rounded-xl" style={{ background: done ? 'hsl(var(--success) / 0.08)' : 'hsl(var(--surface2))' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium" style={{ color: done ? 'hsl(var(--success))' : 'hsl(var(--text))' }}>
            {done ? '✓ ' : ''}{q.title}
          </span>
          <span className="stat-number text-xs px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>+{q.xp} XP</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: 'hsl(var(--surface3))' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(q.progress / q.total) * 100}%`, background: done ? 'hsl(var(--success))' : 'hsl(var(--accent))' }} />
        </div>
        <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>{q.progress}/{q.total}</p>
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-display font-bold mx-auto"
            style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))', boxShadow: '0 8px 24px hsl(var(--accent) / 0.2)' }}>
            {user.name?.[0] || '?'}
          </div>
        </div>
        <h2 className="font-display text-xl font-bold" style={{ color: 'hsl(var(--text))' }}>{user.name || 'Student'}</h2>
        <p className="font-display text-sm italic" style={{ color: 'hsl(var(--muted))' }}>{user.heroTitle} · Level {user.heroLevel}</p>
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>{user.examType?.toUpperCase()} · {user.subjects.join(', ')}</p>
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
          { icon: <Flame size={18}/>, value: user.streak, label: 'Day Streak', color: 'hsl(var(--warning))' },
          { icon: <Target size={18}/>, value: '78%', label: 'Avg Accuracy', color: 'hsl(var(--accent))' },
          { icon: <BookOpen size={18}/>, value: completedTopics, label: 'Topics Done', color: 'hsl(var(--success))' },
          { icon: <Trophy size={18}/>, value: `#${userRank}`, label: 'Rank', color: 'hsl(var(--warning))' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card-base text-center">
            <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
            <p className="stat-number text-xl font-bold" style={{ color: 'hsl(var(--text))' }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
        {(['overview', 'subjects', 'quests', 'wellbeing'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize"
            style={{
              background: activeTab === tab ? 'hsl(var(--surface))' : 'transparent',
              color: activeTab === tab ? 'hsl(var(--text))' : 'hsl(var(--muted))',
              boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
            }}>{tab}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Learning Pulse */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <TrendingUp size={16} style={{ color: 'hsl(var(--accent))' }} /> Learning Pulse
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pulseData}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 11 }} />
                    <Line type="monotone" dataKey="focus" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="energy" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 justify-center mt-2">
                {[{ l: 'Focus', c: 'hsl(var(--accent))' }, { l: 'Accuracy', c: 'hsl(var(--success))' }, { l: 'Energy', c: 'hsl(var(--warning))' }].map(x => (
                  <div key={x.l} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: x.c }} /><span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{x.l}</span></div>
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

            {/* Recent Activity Feed */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Activity size={16} style={{ color: 'hsl(var(--accent))' }} /> Recent Activity
              </h3>
              <div className="space-y-2">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                    <span style={{ color: 'hsl(var(--accent))' }}>{a.icon}</span>
                    <span className="flex-1 text-xs" style={{ color: 'hsl(var(--text))' }}>{a.text}</span>
                    <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saathi Daily Summary */}
            <div className="card-base" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
              <h3 className="font-display text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'hsl(var(--accent))' }}>
                <Sparkles size={16} /> Saathi's Daily Summary
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
                You completed 2 quizzes today with 80% accuracy — solid! Your focus dipped after 4PM, so consider scheduling hard topics in the morning. You have 12 flashcards due for review and a boss battle waiting.
              </p>
            </div>

            {/* Upcoming */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Calendar size={16} style={{ color: 'hsl(var(--accent))' }} /> Coming Up
              </h3>
              <div className="space-y-2">
                {[
                  { text: '12 flashcards due for review', tag: 'Revision', color: 'hsl(var(--accent))' },
                  { text: 'Weekly quest expires in 2 days', tag: 'Quest', color: 'hsl(var(--warning))' },
                  { text: 'Suggested: Thermodynamics basics', tag: 'Learn', color: 'hsl(var(--success))' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${item.color}20`, color: item.color }}>{item.tag}</span>
                    <span className="text-xs flex-1" style={{ color: 'hsl(var(--text))' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard (hidden in recovery) */}
            {!recoveryMode && (
              <div className="card-base">
                <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                  <Trophy size={16} style={{ color: 'hsl(var(--warning))' }} /> Leaderboard
                </h3>
                <div className="space-y-1">
                  {leaderboard.map((p, i) => {
                    const isUser = p.name === (user.name || 'You');
                    return (
                      <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: isUser ? 'hsl(var(--accent-soft))' : 'transparent', borderLeft: isUser ? '3px solid hsl(var(--accent))' : '3px solid transparent' }}>
                        <span className="w-6 text-center stat-number text-sm font-bold" style={{ color: i === 0 ? 'hsl(var(--warning))' : 'hsl(var(--muted))' }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                        </span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: isUser ? 'hsl(var(--accent))' : 'hsl(var(--surface2))', color: isUser ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted))' }}>{p.name[0]}</div>
                        <span className="flex-1 text-sm font-medium truncate" style={{ color: 'hsl(var(--text))' }}>{p.name}</span>
                        <span className="stat-number text-sm font-bold" style={{ color: 'hsl(var(--accent))' }}>{p.xp} XP</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ===================== SUBJECTS TAB ===================== */}
        {activeTab === 'subjects' && (
          <motion.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {subjectData.map((s, si) => (
              <div key={si} className="card-base">
                <button onClick={() => setExpandedSubject(expandedSubject === s.fullName ? null : s.fullName)}
                  className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft))' }}>
                      <BookOpen size={18} style={{ color: 'hsl(var(--accent))' }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{s.fullName}</p>
                      <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{s.quizzes} quizzes · {s.accuracy}% accuracy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mastery ring */}
                    <div className="relative w-10 h-10">
                      <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--surface2))" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                          stroke={s.completion > 60 ? 'hsl(var(--success))' : s.completion > 30 ? 'hsl(var(--accent))' : 'hsl(var(--warning))'}
                          strokeWidth="3" strokeDasharray={`${s.completion}, 100`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: 'hsl(var(--text))' }}>{s.completion}%</span>
                    </div>
                    {expandedSubject === s.fullName ? <ChevronUp size={16} style={{ color: 'hsl(var(--muted))' }} /> : <ChevronDown size={16} style={{ color: 'hsl(var(--muted))' }} />}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedSubject === s.fullName && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 space-y-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                        {/* Stats row */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[
                            { l: 'Quizzes', v: s.quizzes }, { l: 'Accuracy', v: `${s.accuracy}%` }, { l: 'Time', v: s.timeSpent },
                            { l: 'Topics', v: s.topicsCompleted }, { l: 'Streak', v: `${s.streak}d` }, { l: 'Rank', v: `#${s.rank}` },
                          ].map((st, i) => (
                            <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                              <p className="stat-number text-sm font-bold" style={{ color: 'hsl(var(--accent))' }}>{st.v}</p>
                              <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{st.l}</p>
                            </div>
                          ))}
                        </div>

                        {/* Topic breakdown */}
                        <div>
                          <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--text))' }}>Topic Breakdown</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr style={{ color: 'hsl(var(--muted))' }}>
                                  <th className="text-left py-1.5 font-medium">Topic</th>
                                  <th className="text-center py-1.5 font-medium">Quizzes</th>
                                  <th className="text-center py-1.5 font-medium">Accuracy</th>
                                  <th className="text-center py-1.5 font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.topics.map((t, ti) => (
                                  <tr key={ti} className="border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                                    <td className="py-2 font-medium" style={{ color: 'hsl(var(--text))' }}>{t.name}</td>
                                    <td className="text-center" style={{ color: 'hsl(var(--muted))' }}>{t.quizzes}</td>
                                    <td className="text-center">
                                      <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{
                                        background: t.accuracy > 70 ? 'hsl(var(--success) / 0.15)' : t.accuracy > 50 ? 'hsl(var(--warning) / 0.15)' : 'hsl(var(--danger) / 0.15)',
                                        color: t.accuracy > 70 ? 'hsl(var(--success))' : t.accuracy > 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))',
                                      }}>{t.accuracy}%</span>
                                    </td>
                                    <td className="text-center">{t.status}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl" style={{ background: 'hsl(var(--success) / 0.08)' }}>
                            <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--success))' }}>Strengths</p>
                            {s.strengths.map((st, i) => (
                              <p key={i} className="text-xs py-0.5 flex items-center gap-1" style={{ color: 'hsl(var(--text))' }}>
                                <CheckCircle2 size={10} style={{ color: 'hsl(var(--success))' }} /> {st}
                              </p>
                            ))}
                          </div>
                          <div className="p-3 rounded-xl" style={{ background: 'hsl(var(--danger) / 0.08)' }}>
                            <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--danger))' }}>Weak Areas</p>
                            {s.weaknesses.map((w, i) => (
                              <p key={i} className="text-xs py-0.5" style={{ color: 'hsl(var(--text))' }}>{w}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* ===================== QUESTS TAB ===================== */}
        {activeTab === 'quests' && (
          <motion.div key="quests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Daily Quests */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Sun size={16} style={{ color: 'hsl(var(--warning))' }} /> Daily Quests
              </h3>
              <div className="space-y-2">{dailyQuests.map((q, i) => <QuestCard key={i} q={q} i={i} />)}</div>
            </div>

            {/* Weekly Quests */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Zap size={16} style={{ color: 'hsl(var(--warning))' }} /> Weekly Quests
              </h3>
              <div className="space-y-2">{weeklyQuests.map((q, i) => <QuestCard key={i} q={q} i={i} />)}</div>
            </div>

            {/* Milestone Quests */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Trophy size={16} style={{ color: 'hsl(var(--accent))' }} /> Milestone Quests
              </h3>
              <div className="space-y-2">{milestoneQuests.map((q, i) => <QuestCard key={i} q={q} i={i} />)}</div>
            </div>

            {/* Quest History */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Clock size={16} style={{ color: 'hsl(var(--muted))' }} /> Quest History
              </h3>
              <div className="space-y-2">
                {questHistory.map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                    <div><p className="text-xs font-medium" style={{ color: 'hsl(var(--text))' }}>{q.title}</p><p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{q.date}</p></div>
                    <span className="stat-number text-xs" style={{ color: 'hsl(var(--success))' }}>+{q.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Award size={16} style={{ color: 'hsl(var(--accent))' }} /> Badges
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {allBadges.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                    className="card-base text-center py-3" style={{ opacity: b.earned ? 1 : 0.35 }}>
                    <div className="flex justify-center mb-1" style={{ color: b.earned ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>{b.icon}</div>
                    <p className="text-[11px] font-semibold" style={{ color: 'hsl(var(--text))' }}>{b.label}</p>
                    <p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{b.desc}</p>
                    {!b.earned && <span className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>🔒</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== WELLBEING TAB ===================== */}
        {activeTab === 'wellbeing' && (
          <motion.div key="wellbeing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Wellbeing Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Wellness', value: 72, icon: <Heart size={18}/>, color: 'hsl(var(--success))' },
                { label: 'Mood', value: '😊 Good', icon: <Activity size={18}/>, color: 'hsl(var(--accent))' },
                { label: 'Mood Streak', value: '5d', icon: <Flame size={18}/>, color: 'hsl(var(--warning))' },
                { label: 'Burnout', value: 'Low', icon: <Shield size={18}/>, color: 'hsl(var(--success))' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card-base text-center">
                  <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
                  <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--text))' }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Mood + Burnout Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-base">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-semibold flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                    <Activity size={14} style={{ color: 'hsl(var(--accent))' }} /> Mood Trend
                  </h3>
                  <div className="flex gap-1">
                    {(['7d','30d'] as const).map(r => (
                      <button key={r} onClick={() => setMoodRange(r)} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: moodRange === r ? 'hsl(var(--accent-soft))' : 'transparent', color: moodRange === r ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData}>
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 5]} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 11 }} />
                      <Area type="monotone" dataKey="mood" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card-base">
                <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                  <Shield size={14} style={{ color: 'hsl(var(--warning))' }} /> Burnout Trend
                </h3>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData}>
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 11 }} />
                      <Area type="monotone" dataKey="burnout" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Mood Calendar Heatmap */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Calendar size={14} style={{ color: 'hsl(var(--accent))' }} /> Mood Calendar
              </h3>
              <div className="grid grid-cols-7 gap-1.5">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-medium" style={{ color: 'hsl(var(--muted))' }}>{d}</div>
                ))}
                {moodCalendar.map((d, i) => (
                  <div key={i} title={`Day ${d.day}: ${moodEmojis[d.mood]} ${d.note}`}
                    className="aspect-square rounded-md flex items-center justify-center text-[10px] cursor-pointer hover:ring-1 hover:ring-accent transition-all"
                    style={{ background: moodColors[d.mood] ? `${moodColors[d.mood]}30` : 'hsl(var(--surface2))', color: moodColors[d.mood] || 'hsl(var(--muted))' }}>
                    {moodEmojis[d.mood] || d.day}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Clock size={14} style={{ color: 'hsl(var(--accent))' }} /> Activity Log
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {wellbeingActivities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                    <span className="text-xs" style={{ color: 'hsl(var(--text))' }}>{a.text}</span>
                    <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saathi AI Insights */}
            <div className="card-base" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
              <h3 className="font-display text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'hsl(var(--accent))' }}>
                <Sparkles size={16} /> Saathi Wellbeing Insights
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
                Your mood improves on days you do breathing exercises. You tend to feel stressed after long study sessions. Try scheduling breaks every 90 mins. Your best focus days are Mon-Wed.
              </p>
            </div>

            {/* Sleep & Anxiety sparklines */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-base">
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'hsl(var(--text))' }}><Moon size={12} style={{ color: 'hsl(var(--accent))' }} /> Sleep Hours</h4>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sleepData}><Area type="monotone" dataKey="hours" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={1.5} /></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card-base">
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'hsl(var(--text))' }}><Activity size={12} style={{ color: 'hsl(var(--warning))' }} /> Anxiety Level</h4>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={anxietyData}><Area type="monotone" dataKey="level" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} strokeWidth={1.5} /></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Habit Completion Bar Chart */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>Habit Completion (This Week)</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitData}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {habitData.map((_, i) => <Cell key={i} fill={`hsl(var(--accent) / ${0.4 + i * 0.08})`} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Journal History */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <PenLine size={14} style={{ color: 'hsl(var(--accent))' }} /> Journal History
              </h3>
              <div className="space-y-2">
                {journalEntries.map((j, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{j.mood} <span className="text-xs font-medium" style={{ color: 'hsl(var(--text))' }}>{j.note}</span></span>
                      <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{j.time}</span>
                    </div>
                    <div className="flex gap-3 text-[10px]" style={{ color: 'hsl(var(--muted))' }}>
                      <span>😴 {j.sleep}h</span><span>😰 {j.anxiety}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Wellbeing Report */}
            <div className="card-base">
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <FileText size={14} style={{ color: 'hsl(var(--accent))' }} /> Weekly Wellbeing Report
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {[
                  { l: 'Mood Avg', v: '😊 3.8/5', arrow: true },
                  { l: 'Focus Time', v: '4h 20m', arrow: true },
                  { l: 'Activities', v: '12', arrow: false },
                  { l: 'Badges', v: '2 new', arrow: true },
                  { l: 'vs Last Week', v: '+15%', arrow: true },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                    <p className="stat-number text-xs font-bold flex items-center justify-center gap-0.5" style={{ color: 'hsl(var(--accent))' }}>
                      {s.v} {s.arrow && <ArrowUpRight size={10} style={{ color: 'hsl(var(--success))' }} />}
                    </p>
                    <p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Report (bottom of every tab) */}
      <div className="card-base">
        <h3 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>
          <FileText size={14} className="inline mr-1" style={{ color: 'hsl(var(--accent))' }} /> Weekly Report Card
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center mb-3">
          {[
            { l: 'XP', v: `+${Math.floor(user.xp * 0.3)}`, c: 'hsl(var(--accent))' },
            { l: 'Accuracy', v: '82%', c: 'hsl(var(--success))' },
            { l: 'Percentile', v: 'Top 15%', c: 'hsl(var(--warning))' },
            { l: 'Flashcards', v: '47', c: 'hsl(var(--accent))' },
            { l: 'Retention', v: '78%', c: 'hsl(var(--success))' },
            { l: 'Mood Avg', v: '😊', c: 'hsl(var(--accent))' },
          ].map((s, i) => (
            <div key={i}>
              <p className="stat-number text-sm font-bold" style={{ color: s.c }}>{s.v}</p>
              <p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{s.l}</p>
            </div>
          ))}
        </div>
        <p className="font-display text-xs italic" style={{ color: 'hsl(var(--text-secondary))' }}>
          "You studied while anxious 3 times this week — that's rare discipline."
        </p>
      </div>
    </div>
  );
};

export default Profile;
