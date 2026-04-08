import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Award, Flame, Target, BookOpen, Clock, TrendingUp, BarChart3, Brain, Trophy, Zap, Heart, Activity, Moon, Sun, Droplets, Dumbbell, PenLine, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, FileText, Search, Star, Shield, Gamepad2, Users, Sparkles, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';

// --- Badge data with categories ---
const allBadges = [
  { id: 'onFire', icon: <Flame size={18}/>, label: 'On Fire', desc: '5 correct in a row', earned: true, category: 'study' },
  { id: 'comebackKid', icon: <Shield size={18}/>, label: 'Comeback Kid', desc: 'Improved after failing', earned: true, category: 'study' },
  { id: 'nightOwl', icon: <Moon size={18}/>, label: 'Night Owl', desc: 'Studied after 10pm', earned: true, category: 'study' },
  { id: 'earlyBird', icon: <Sun size={18}/>, label: 'Early Bird', desc: 'Studied before 8am', earned: false, category: 'study' },
  { id: 'bigBrain', icon: <Brain size={18}/>, label: 'Big Brain', desc: '100% on hard', earned: false, category: 'study' },
  { id: 'bossSlayer', icon: <Zap size={18}/>, label: 'Boss Slayer', desc: '10 bosses defeated', earned: false, category: 'study' },
  { id: 'focusMaster', icon: <Target size={18}/>, label: 'Focus Master', desc: '5 Pomodoros in one day', earned: false, category: 'study' },
  { id: 'firstFlash', icon: <BookOpen size={18}/>, label: 'First Flashcard', desc: 'Created first card', earned: true, category: 'revision' },
  { id: '100cards', icon: <BarChart3 size={18}/>, label: '100 Cards', desc: 'Reviewed 100 cards', earned: false, category: 'revision' },
  { id: 'deckMaster', icon: <Award size={18}/>, label: 'Deck Master', desc: 'Mastered a full deck', earned: false, category: 'revision' },
  { id: 'firstBreath', icon: <Heart size={18}/>, label: 'First Breathing', desc: 'Completed breathing', earned: true, category: 'wellbeing' },
  { id: 'moodStreak7', icon: <Activity size={18}/>, label: '7-Day Mood', desc: '7-day mood streak', earned: false, category: 'wellbeing' },
  { id: 'cbtChamp', icon: <Brain size={18}/>, label: 'CBT Champion', desc: '10 CBT exercises', earned: false, category: 'wellbeing' },
  { id: 'zenMaster', icon: <Star size={18}/>, label: 'Zen Master', desc: '30 wellness activities', earned: false, category: 'wellbeing' },
  { id: 'firstRoom', icon: <Users size={18}/>, label: 'First Room', desc: 'Joined a study room', earned: true, category: 'social' },
  { id: 'helped10', icon: <Sparkles size={18}/>, label: 'Peer Helper', desc: 'Helped 10 peers', earned: false, category: 'social' },
  { id: 'resilient', icon: <Shield size={18}/>, label: 'Resilient', desc: 'Session with low wellbeing', earned: true, category: 'study' },
];

const moodLevels = [
  { label: 'No Data', color: 'hsl(var(--surface3))', emoji: '' },
  { label: 'Bad', color: 'hsl(0 55% 50%)', emoji: '😢' },
  { label: 'Stressed', color: 'hsl(25 65% 52%)', emoji: '😟' },
  { label: 'Okay', color: 'hsl(45 70% 50%)', emoji: '😐' },
  { label: 'Good', color: 'hsl(100 45% 45%)', emoji: '😊' },
  { label: 'Great', color: 'hsl(150 50% 38%)', emoji: '😁' },
];

const Profile = () => {
  const { user, setUser } = useApp();
  const { recoveryMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'quests' | 'wellbeing'>('overview');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [moodRange, setMoodRange] = useState<'7d' | '30d'>('7d');
  const [calendarView, setCalendarView] = useState<'week' | 'month' | '3month'>('month');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showQuestHistory, setShowQuestHistory] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [wellbeingSubTab, setWellbeingSubTab] = useState<'activity' | 'journal'>('activity');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

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
        { name: 'Applications', quizzes: 1, accuracy: 55, mastery: 'medium', lastAttempted: '3d ago', status: '⚠️' },
        { name: 'Practice Sets', quizzes: 4, accuracy: 72, mastery: 'high', lastAttempted: '1d ago', status: '✅' },
        { name: 'Revision', quizzes: 2, accuracy: 30, mastery: 'low', lastAttempted: '7d ago', status: '❌' },
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

  // Leaderboard is now on Social page - removed hardcoded data

  const moodData = useMemo(() => {
    const days = moodRange === '7d' ? 7 : 30;
    return Array.from({ length: days }, (_, i) => ({
      day: `D${i + 1}`, mood: Math.floor(2 + Math.random() * 3), burnout: Math.floor(20 + Math.random() * 50),
    }));
  }, [moodRange]);

  // Calendar data - generate for 3 months
  const calendarData = useMemo(() => {
    const data: Record<string, { mood: number; note: string; sleep: number; anxiety: number; focus: number; exercises: string[] }> = {};
    for (let m = -2; m <= 0; m++) {
      const month = new Date(calendarYear, calendarMonth + m, 1);
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${month.getFullYear()}-${month.getMonth()}-${d}`;
        const logged = Math.random() > 0.25;
        data[key] = {
          mood: logged ? Math.floor(1 + Math.random() * 5) : 0,
          note: logged && Math.random() > 0.6 ? ['Felt good after breathing', 'Stressed about exam', 'Great study session', 'Tired but productive'][Math.floor(Math.random() * 4)] : '',
          sleep: logged ? Math.floor(4 + Math.random() * 5) : 0,
          anxiety: logged ? Math.floor(1 + Math.random() * 9) : 0,
          focus: logged ? Math.floor(1 + Math.random() * 5) : 0,
          exercises: logged && Math.random() > 0.5 ? ['Breathing', 'CBT'].slice(0, Math.floor(1 + Math.random() * 2)) : [],
        };
      }
    }
    return data;
  }, [calendarMonth, calendarYear]);

  const sleepData = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ day: `D${i+1}`, hours: 5 + Math.random() * 3 })), []);
  const anxietyData = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ day: `D${i+1}`, level: 2 + Math.random() * 6 })), []);
  const habitData = useMemo(() => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ day: d, pct: Math.floor(30 + Math.random() * 70) })), []);

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

  // Calendar helpers
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7; // Mon=0
  const today = new Date();
  const isToday = (d: number) => today.getDate() === d && today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;

  const calendarStats = useMemo(() => {
    let logged = 0, moodSum = 0, bestDay = 1, bestMood = 0, streak = 0, maxStreak = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${calendarYear}-${calendarMonth}-${d}`;
      const entry = calendarData[key];
      if (entry && entry.mood > 0) {
        logged++;
        moodSum += entry.mood;
        if (entry.mood > bestMood) { bestMood = entry.mood; bestDay = d; }
        streak++;
        if (streak > maxStreak) maxStreak = streak;
      } else { streak = 0; }
    }
    const avgMood = logged > 0 ? moodSum / logged : 0;
    return { logged, avgMood, bestDay, maxStreak };
  }, [calendarData, daysInMonth, calendarMonth, calendarYear]);

  const prevMonth = () => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); setSelectedDay(null); };

  const QuestCard = ({ q, i }: { q: typeof weeklyQuests[0]; i: number }) => {
    const done = q.progress >= q.total;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        className="p-2.5 rounded-xl" style={{ background: done ? 'hsl(var(--success) / 0.08)' : 'hsl(var(--surface2))' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: done ? 'hsl(var(--success))' : 'hsl(var(--text))' }}>
            {done ? '✓ ' : ''}{q.title}
          </span>
          <span className="stat-number text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>+{q.xp}</span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ background: 'hsl(var(--surface3))' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(q.progress / q.total) * 100}%`, background: done ? 'hsl(var(--success))' : 'hsl(var(--accent))' }} />
        </div>
      </motion.div>
    );
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const cells = [];
    // Empty cells for first week offset
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} style={{ width: calendarView === 'week' ? 40 : calendarView === '3month' ? 14 : 20, height: calendarView === 'week' ? 40 : calendarView === '3month' ? 14 : 20 }} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${calendarYear}-${calendarMonth}-${d}`;
      const entry = calendarData[key];
      const mood = entry?.mood || 0;
      const ml = moodLevels[mood];
      const isSelected = selectedDay === d;
      const isHovered = hoveredDay === d;

      cells.push(
        <motion.div
          key={d}
          whileHover={{ scale: 1.2 }}
          onClick={() => setSelectedDay(selectedDay === d ? null : d)}
          onMouseEnter={() => setHoveredDay(d)}
          onMouseLeave={() => setHoveredDay(null)}
          className="relative rounded cursor-pointer transition-all flex items-center justify-center"
          style={{
            width: calendarView === 'week' ? 40 : calendarView === '3month' ? 14 : 20,
            height: calendarView === 'week' ? 40 : calendarView === '3month' ? 14 : 20,
            background: ml.color,
            opacity: mood === 0 ? 0.4 : 0.85,
            boxShadow: isSelected ? `0 0 0 2px hsl(var(--accent))` : isToday(d) ? '0 0 0 1.5px hsl(var(--accent))' : 'none',
          }}
        >
          {calendarView !== '3month' && (
            <span className="text-[7px] font-medium absolute top-0 left-0.5" style={{ color: mood > 0 ? 'rgba(255,255,255,0.8)' : 'hsl(var(--muted))' }}>{d}</span>
          )}
          {calendarView === 'week' && mood > 0 && (
            <span className="text-sm">{ml.emoji}</span>
          )}
          {isHovered && mood > 0 && calendarView !== '3month' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none" style={{ minWidth: 120 }}>
              <div className="rounded-lg p-1.5 text-[9px] shadow-lg" style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>
                <p className="font-medium" style={{ color: 'hsl(var(--text))' }}>{monthNames[calendarMonth]} {d}</p>
                <p style={{ color: ml.color }}>{ml.emoji} {ml.label}</p>
                {entry?.note && <p className="mt-0.5" style={{ color: 'hsl(var(--muted))' }}>{entry.note}</p>}
              </div>
            </div>
          )}
        </motion.div>
      );
    }
    return cells;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* Hero — compact */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold shrink-0"
          style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))', boxShadow: '0 8px 24px hsl(var(--accent) / 0.2)' }}>
          {user.name?.[0] || '?'}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-lg font-bold" style={{ color: 'hsl(var(--text))' }}>{user.name || 'Student'}</h2>
          <p className="font-display text-xs italic" style={{ color: 'hsl(var(--muted))' }}>{user.heroTitle} · Level {user.heroLevel} · {user.examType?.toUpperCase()} · {user.subjects.join(', ')}</p>
          <div className="mt-2 max-w-xs mx-auto sm:mx-0">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span style={{ color: 'hsl(var(--muted))' }}>XP</span>
              <span className="stat-number" style={{ color: 'hsl(var(--accent))' }}>{user.xp}/500</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'hsl(var(--surface2))' }}>
              <div className="h-full rounded-full" style={{ width: `${(user.xp / 500) * 100}%`, background: 'hsl(var(--accent))' }} />
            </div>
          </div>
        </div>
        <button onClick={() => { setUser(prev => ({ ...prev, onboardingComplete: false })); navigate('/onboarding'); }}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl border transition-all hover:border-accent"
          style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--accent))', background: 'hsl(var(--accent-soft))' }}>
          <PenLine size={12} /> Edit Preferences
        </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: <Flame size={16}/>, value: user.streak, label: 'Streak', color: 'hsl(var(--warning))' },
          { icon: <Target size={16}/>, value: '78%', label: 'Accuracy', color: 'hsl(var(--accent))' },
          { icon: <BookOpen size={16}/>, value: completedTopics, label: 'Topics', color: 'hsl(var(--success))' },
          { icon: <Trophy size={16}/>, value: `—`, label: 'Rank', color: 'hsl(var(--warning))' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card-base text-center py-2">
            <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
            <p className="stat-number text-base font-bold" style={{ color: 'hsl(var(--text))' }}>{stat.value}</p>
            <p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl sticky top-0 z-10" style={{ background: 'hsl(var(--surface2))' }}>
        {(['overview', 'subjects', 'quests', 'wellbeing'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
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
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Charts side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <TrendingUp size={14} style={{ color: 'hsl(var(--accent))' }} /> Learning Pulse
                </h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pulseData}>
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 10 }} />
                      <Line type="monotone" dataKey="focus" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="energy" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-3 justify-center mt-1">
                  {[{ l: 'Focus', c: 'hsl(var(--accent))' }, { l: 'Accuracy', c: 'hsl(var(--success))' }, { l: 'Energy', c: 'hsl(var(--warning))' }].map(x => (
                    <div key={x.l} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: x.c }} /><span className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{x.l}</span></div>
                  ))}
                </div>
              </div>
              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Brain size={14} style={{ color: 'hsl(var(--accent))' }} /> Skill Analysis
                </h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: 'hsl(var(--muted))' }} />
                      <Radar dataKey="value" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 3-column: Activity + Saathi + Upcoming */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Activity size={14} style={{ color: 'hsl(var(--accent))' }} /> Recent Activity
                </h3>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {recentActivities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                      <span style={{ color: 'hsl(var(--accent))' }}>{a.icon}</span>
                      <span className="flex-1 text-[10px]" style={{ color: 'hsl(var(--text))' }}>{a.text}</span>
                      <span className="text-[9px] shrink-0" style={{ color: 'hsl(var(--muted))' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-base" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
                <h3 className="font-display text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'hsl(var(--accent))' }}>
                  <Sparkles size={14} /> Saathi's Summary
                </h3>
                <p className="text-[10px] leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
                  You completed 2 quizzes today with 80% accuracy — solid! Focus dipped after 4PM. 12 flashcards due.
                </p>
              </div>

              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Calendar size={14} style={{ color: 'hsl(var(--accent))' }} /> Coming Up
                </h3>
                <div className="space-y-1.5">
                  {[
                    { text: '12 flashcards due', tag: 'Rev', color: 'hsl(var(--accent))' },
                    { text: 'Quest expires in 2d', tag: 'Quest', color: 'hsl(var(--warning))' },
                    { text: 'Thermodynamics basics', tag: 'Learn', color: 'hsl(var(--success))' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ background: `${item.color}20`, color: item.color }}>{item.tag}</span>
                      <span className="text-[10px]" style={{ color: 'hsl(var(--text))' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard - see Social page */}
            {!recoveryMode && (
              <div className="card-base text-center py-4">
                <Trophy size={20} className="mx-auto mb-1" style={{ color: 'hsl(var(--warning))' }} />
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--text))' }}>See full leaderboard</p>
                <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Visit Study Together page for rankings</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ===================== SUBJECTS TAB ===================== */}
        {activeTab === 'subjects' && (
          <motion.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {subjectData.map((s, si) => (
              <div key={si} className="card-base">
                <button onClick={() => { setExpandedSubject(expandedSubject === s.fullName ? null : s.fullName); setShowAllTopics(false); }}
                  className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft))' }}>
                      <BookOpen size={16} style={{ color: 'hsl(var(--accent))' }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{s.fullName}</p>
                      <p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{s.quizzes} quizzes · {s.accuracy}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-9 h-9">
                      <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--surface2))" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                          stroke={s.completion > 60 ? 'hsl(var(--success))' : s.completion > 30 ? 'hsl(var(--accent))' : 'hsl(var(--warning))'}
                          strokeWidth="3" strokeDasharray={`${s.completion}, 100`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: 'hsl(var(--text))' }}>{s.completion}%</span>
                    </div>
                    {expandedSubject === s.fullName ? <ChevronUp size={14} style={{ color: 'hsl(var(--muted))' }} /> : <ChevronDown size={14} style={{ color: 'hsl(var(--muted))' }} />}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedSubject === s.fullName && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 space-y-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                        {/* Stats row — compact horizontal */}
                        <div className="flex gap-2 overflow-x-auto">
                          {[
                            { l: 'Quizzes', v: s.quizzes }, { l: 'Accuracy', v: `${s.accuracy}%` }, { l: 'Time', v: s.timeSpent },
                            { l: 'Topics', v: s.topicsCompleted }, { l: 'Streak', v: `${s.streak}d` }, { l: 'Rank', v: `#${s.rank}` },
                          ].map((st, i) => (
                            <div key={i} className="text-center px-3 py-1.5 rounded-lg shrink-0" style={{ background: 'hsl(var(--surface2))' }}>
                              <p className="stat-number text-xs font-bold" style={{ color: 'hsl(var(--accent))' }}>{st.v}</p>
                              <p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{st.l}</p>
                            </div>
                          ))}
                        </div>

                        {/* Strengths & Weaknesses side by side */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl" style={{ background: 'hsl(var(--success) / 0.08)' }}>
                            <p className="text-[10px] font-medium mb-1" style={{ color: 'hsl(var(--success))' }}>Strengths</p>
                            {s.strengths.map((st, i) => (
                              <p key={i} className="text-[10px] py-0.5 flex items-center gap-1" style={{ color: 'hsl(var(--text))' }}>
                                <CheckCircle2 size={9} style={{ color: 'hsl(var(--success))' }} /> {st}
                              </p>
                            ))}
                          </div>
                          <div className="p-2.5 rounded-xl" style={{ background: 'hsl(var(--danger) / 0.08)' }}>
                            <p className="text-[10px] font-medium mb-1" style={{ color: 'hsl(var(--danger))' }}>Weak Areas</p>
                            {s.weaknesses.map((w, i) => (
                              <p key={i} className="text-[10px] py-0.5" style={{ color: 'hsl(var(--text))' }}>{w}</p>
                            ))}
                          </div>
                        </div>

                        {/* Topic breakdown — collapsible */}
                        <div>
                          <p className="text-[10px] font-medium mb-1.5" style={{ color: 'hsl(var(--text))' }}>Topic Breakdown</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr style={{ color: 'hsl(var(--muted))' }}>
                                  <th className="text-left py-1 font-medium">Topic</th>
                                  <th className="text-center py-1 font-medium">Quiz</th>
                                  <th className="text-center py-1 font-medium">Acc%</th>
                                  <th className="text-center py-1 font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(showAllTopics ? s.topics : s.topics.slice(0, 3)).map((t, ti) => (
                                  <tr key={ti} className="border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                                    <td className="py-1.5 font-medium" style={{ color: 'hsl(var(--text))' }}>{t.name}</td>
                                    <td className="text-center" style={{ color: 'hsl(var(--muted))' }}>{t.quizzes}</td>
                                    <td className="text-center">
                                      <span className="px-1 py-0.5 rounded-full" style={{
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
                          {s.topics.length > 3 && (
                            <button onClick={() => setShowAllTopics(!showAllTopics)} className="text-[10px] font-medium mt-1" style={{ color: 'hsl(var(--accent))' }}>
                              {showAllTopics ? 'Show less' : `Show all ${s.topics.length} →`}
                            </button>
                          )}
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
          <motion.div key="quests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Daily + Weekly side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Sun size={14} style={{ color: 'hsl(var(--warning))' }} /> Daily Quests
                </h3>
                <div className="space-y-1.5">{dailyQuests.map((q, i) => <QuestCard key={i} q={q} i={i} />)}</div>
              </div>
              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Zap size={14} style={{ color: 'hsl(var(--warning))' }} /> Weekly Quests
                </h3>
                <div className="space-y-1.5">{weeklyQuests.map((q, i) => <QuestCard key={i} q={q} i={i} />)}</div>
              </div>
            </div>

            {/* Milestones — horizontal scroll */}
            <div className="card-base">
              <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                <Trophy size={14} style={{ color: 'hsl(var(--accent))' }} /> Milestones
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {milestoneQuests.map((q, i) => (
                  <div key={i} className="min-w-[180px] p-2.5 rounded-xl shrink-0" style={{ background: 'hsl(var(--surface2))' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--text))' }}>{q.title}</p>
                    <div className="w-full h-1 rounded-full mb-1" style={{ background: 'hsl(var(--surface3))' }}>
                      <div className="h-full rounded-full" style={{ width: `${(q.progress / q.total) * 100}%`, background: 'hsl(var(--accent))' }} />
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span style={{ color: 'hsl(var(--muted))' }}>{q.progress}/{q.total}</span>
                      <span className="stat-number" style={{ color: 'hsl(var(--accent))' }}>+{q.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges — max 2 rows with expand */}
            <div className="card-base">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-xs font-semibold flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Award size={14} style={{ color: 'hsl(var(--accent))' }} /> Badges
                </h3>
                <button onClick={() => setShowAllBadges(!showAllBadges)} className="text-[10px] font-medium" style={{ color: 'hsl(var(--accent))' }}>
                  {showAllBadges ? 'Show less' : 'Show all →'}
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {(showAllBadges ? allBadges : allBadges.slice(0, 8)).map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                    className="text-center py-2 px-1 rounded-xl" style={{ background: 'hsl(var(--surface2))', opacity: b.earned ? 1 : 0.35 }}>
                    <div className="flex justify-center mb-0.5" style={{ color: b.earned ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>{b.icon}</div>
                    <p className="text-[9px] font-semibold" style={{ color: 'hsl(var(--text))' }}>{b.label}</p>
                    {!b.earned && <span className="text-[8px]">🔒</span>}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quest History — collapsible */}
            <div className="card-base">
              <button onClick={() => setShowQuestHistory(!showQuestHistory)} className="w-full flex items-center justify-between">
                <h3 className="font-display text-xs font-semibold flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Clock size={14} style={{ color: 'hsl(var(--muted))' }} /> Quest History
                </h3>
                {showQuestHistory ? <ChevronUp size={14} style={{ color: 'hsl(var(--muted))' }} /> : <ChevronDown size={14} style={{ color: 'hsl(var(--muted))' }} />}
              </button>
              {showQuestHistory && (
                <div className="space-y-1.5 mt-2">
                  {questHistory.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                      <div><p className="text-[10px] font-medium" style={{ color: 'hsl(var(--text))' }}>{q.title}</p><p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{q.date}</p></div>
                      <span className="stat-number text-[10px]" style={{ color: 'hsl(var(--success))' }}>+{q.xp} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===================== WELLBEING TAB ===================== */}
        {activeTab === 'wellbeing' && (
          <motion.div key="wellbeing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Stats — tight horizontal row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Wellness', value: 72, icon: <Heart size={16}/>, color: 'hsl(var(--success))' },
                { label: 'Mood', value: '😊 Good', icon: <Activity size={16}/>, color: 'hsl(var(--accent))' },
                { label: 'Streak', value: '5d', icon: <Flame size={16}/>, color: 'hsl(var(--warning))' },
                { label: 'Burnout', value: 'Low', icon: <Shield size={16}/>, color: 'hsl(var(--success))' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card-base text-center py-2">
                  <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                  <p className="stat-number text-sm font-bold" style={{ color: 'hsl(var(--text))' }}>{s.value}</p>
                  <p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Mood + Burnout Charts side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="card-base">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-xs font-semibold flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                    <Activity size={12} style={{ color: 'hsl(var(--accent))' }} /> Mood Trend
                  </h3>
                  <div className="flex gap-1">
                    {(['7d','30d'] as const).map(r => (
                      <button key={r} onClick={() => setMoodRange(r)} className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: moodRange === r ? 'hsl(var(--accent-soft))' : 'transparent', color: moodRange === r ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData}>
                      <XAxis dataKey="day" tick={{ fontSize: 8, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 5]} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 10 }} />
                      <Area type="monotone" dataKey="mood" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <Shield size={12} style={{ color: 'hsl(var(--warning))' }} /> Burnout Trend
                </h3>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData}>
                      <XAxis dataKey="day" tick={{ fontSize: 8, fill: 'hsl(var(--muted))' }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 10 }} />
                      <Area type="monotone" dataKey="burnout" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ===== MOOD CALENDAR HEATMAP ===== */}
            <div className="card-base">
              {/* Mini stats bar */}
              <div className="flex flex-wrap gap-3 mb-3 text-[10px]" style={{ color: 'hsl(var(--muted))' }}>
                <span>📅 <strong style={{ color: 'hsl(var(--text))' }}>{calendarStats.logged}</strong> days logged</span>
                <span>😊 Avg: <strong style={{ color: 'hsl(var(--text))' }}>{moodLevels[Math.round(calendarStats.avgMood)]?.label || 'N/A'}</strong></span>
                <span>⭐ Best: <strong style={{ color: 'hsl(var(--text))' }}>{monthNames[calendarMonth]} {calendarStats.bestDay}</strong></span>
                <span>🔥 Streak: <strong style={{ color: 'hsl(var(--text))' }}>{calendarStats.maxStreak}d</strong></span>
              </div>

              {/* Header with nav + view toggle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--surface2))' }}>
                    <ChevronLeft size={14} style={{ color: 'hsl(var(--muted))' }} />
                  </button>
                  <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>
                    {monthNames[calendarMonth]} {calendarYear}
                  </h3>
                  <button onClick={nextMonth} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--surface2))' }}>
                    <ChevronRight size={14} style={{ color: 'hsl(var(--muted))' }} />
                  </button>
                </div>
                <div className="flex gap-1">
                  {(['week','month','3month'] as const).map(v => (
                    <button key={v} onClick={() => setCalendarView(v)} className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: calendarView === v ? 'hsl(var(--accent-soft))' : 'transparent', color: calendarView === v ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>
                      {v === '3month' ? '3M' : v === 'week' ? 'W' : 'M'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center text-[8px] font-medium" style={{ color: 'hsl(var(--muted))', width: calendarView === 'week' ? 40 : calendarView === '3month' ? 14 : 20 }}>{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="flex flex-wrap gap-0.5" style={{ maxHeight: calendarView === '3month' ? 120 : 'auto' }}>
                {renderCalendarGrid()}
              </div>

              {/* Color legend */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                {moodLevels.slice(1).map((ml, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ background: ml.color }} />
                    <span className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{ml.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'hsl(var(--surface3))', opacity: 0.4 }} />
                  <span className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>No Data</span>
                </div>
              </div>

              {/* Selected day detail */}
              <AnimatePresence>
                {selectedDay && (() => {
                  const key = `${calendarYear}-${calendarMonth}-${selectedDay}`;
                  const entry = calendarData[key];
                  if (!entry || entry.mood === 0) return null;
                  const ml = moodLevels[entry.mood];
                  return (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mt-3 p-3 rounded-xl overflow-hidden" style={{ background: 'hsl(var(--surface2))' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{monthNames[calendarMonth]} {selectedDay} — {ml.emoji} {ml.label}</span>
                        <button onClick={() => setSelectedDay(null)} className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>✕</button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div><p className="stat-number text-xs font-bold" style={{ color: 'hsl(var(--accent))' }}>{entry.sleep}h</p><p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>Sleep</p></div>
                        <div><p className="stat-number text-xs font-bold" style={{ color: 'hsl(var(--warning))' }}>{entry.anxiety}/10</p><p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>Anxiety</p></div>
                        <div><p className="stat-number text-xs font-bold" style={{ color: 'hsl(var(--success))' }}>{entry.focus}</p><p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>Focus</p></div>
                        <div><p className="text-xs font-bold" style={{ color: 'hsl(var(--accent))' }}>{entry.exercises.length || 0}</p><p className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>Exercises</p></div>
                      </div>
                      {entry.note && <p className="text-[10px] mt-2 italic" style={{ color: 'hsl(var(--text-secondary))' }}>"{entry.note}"</p>}
                      {entry.exercises.length > 0 && <p className="text-[9px] mt-1" style={{ color: 'hsl(var(--muted))' }}>Activities: {entry.exercises.join(', ')}</p>}
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Activity Log + Journal — tabbed switcher */}
            <div className="card-base">
              <div className="flex gap-1 mb-2">
                {(['activity', 'journal'] as const).map(t => (
                  <button key={t} onClick={() => setWellbeingSubTab(t)} className="text-[10px] px-3 py-1 rounded-lg font-medium capitalize"
                    style={{ background: wellbeingSubTab === t ? 'hsl(var(--accent-soft))' : 'transparent', color: wellbeingSubTab === t ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>{t}</button>
                ))}
              </div>
              {wellbeingSubTab === 'activity' ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {wellbeingActivities.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                      <span className="text-[10px]" style={{ color: 'hsl(var(--text))' }}>{a.text}</span>
                      <span className="text-[9px]" style={{ color: 'hsl(var(--muted))' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {journalEntries.map((j, i) => (
                    <div key={i} className="p-2 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">{j.mood} <span className="font-medium" style={{ color: 'hsl(var(--text))' }}>{j.note}</span></span>
                        <span className="text-[9px] shrink-0 ml-2" style={{ color: 'hsl(var(--muted))' }}>{j.time}</span>
                      </div>
                      <div className="flex gap-2 text-[9px] mt-0.5" style={{ color: 'hsl(var(--muted))' }}>
                        <span>😴 {j.sleep}h</span><span>😰 {j.anxiety}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sleep + Anxiety + Habit — 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-base">
                <h4 className="text-[10px] font-medium mb-1.5 flex items-center gap-1" style={{ color: 'hsl(var(--text))' }}><Moon size={10} style={{ color: 'hsl(var(--accent))' }} /> Sleep</h4>
                <div className="h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sleepData}><Area type="monotone" dataKey="hours" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={1.5} /></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card-base">
                <h4 className="text-[10px] font-medium mb-1.5 flex items-center gap-1" style={{ color: 'hsl(var(--text))' }}><Activity size={10} style={{ color: 'hsl(var(--warning))' }} /> Anxiety</h4>
                <div className="h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={anxietyData}><Area type="monotone" dataKey="level" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} strokeWidth={1.5} /></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card-base">
                <h4 className="text-[10px] font-medium mb-1.5" style={{ color: 'hsl(var(--text))' }}>Habits</h4>
                <div className="h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitData}>
                      <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
                        {habitData.map((_, i) => <Cell key={i} fill={`hsl(var(--accent) / ${0.4 + i * 0.08})`} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Saathi Insights + Weekly Report — side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="card-base" style={{ borderLeft: '3px solid hsl(var(--accent))' }}>
                <h3 className="font-display text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'hsl(var(--accent))' }}>
                  <Sparkles size={14} /> Saathi Insights
                </h3>
                <p className="text-[10px] leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
                  Your mood improves on days you do breathing exercises. Try scheduling breaks every 90 mins. Best focus days: Mon-Wed.
                </p>
              </div>
              <div className="card-base">
                <h3 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}>
                  <FileText size={12} style={{ color: 'hsl(var(--accent))' }} /> Weekly Report
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { l: 'Mood', v: '😊 3.8' }, { l: 'Focus', v: '4h 20m' }, { l: 'Activities', v: '12' },
                    { l: 'Badges', v: '2 new' }, { l: 'vs Last', v: '+15%' }, { l: 'Habit %', v: '72%' },
                  ].map((s, i) => (
                    <div key={i} className="text-center p-1 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                      <p className="stat-number text-[10px] font-bold" style={{ color: 'hsl(var(--accent))' }}>{s.v}</p>
                      <p className="text-[8px]" style={{ color: 'hsl(var(--muted))' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Report (bottom) — compact horizontal */}
      <div className="card-base">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={12} style={{ color: 'hsl(var(--accent))' }} />
          <h3 className="font-display text-xs font-semibold" style={{ color: 'hsl(var(--text))' }}>Weekly Report Card</h3>
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {[
            { l: 'XP', v: `+${Math.floor(user.xp * 0.3)}`, c: 'hsl(var(--accent))' },
            { l: 'Accuracy', v: '82%', c: 'hsl(var(--success))' },
            { l: 'Top', v: '15%', c: 'hsl(var(--warning))' },
            { l: 'Cards', v: '47', c: 'hsl(var(--accent))' },
            { l: 'Retain', v: '78%', c: 'hsl(var(--success))' },
            { l: 'Mood', v: '😊', c: 'hsl(var(--accent))' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="stat-number text-xs font-bold" style={{ color: s.c }}>{s.v}</p>
              <p className="text-[8px]" style={{ color: 'hsl(var(--muted))' }}>{s.l}</p>
            </div>
          ))}
        </div>
        <p className="font-display text-[10px] italic text-center mt-2" style={{ color: 'hsl(var(--text-secondary))' }}>
          "You studied while anxious 3 times this week — that's rare discipline."
        </p>
      </div>
    </div>
  );
};

export default Profile;
