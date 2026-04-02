import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Lightbulb, Heart, Target, Moon, Timer, Brain } from 'lucide-react';

const moods = [
  { emoji: '😊', label: 'Great', risk: 5 },
  { emoji: '😓', label: 'Stressed', risk: 80 },
  { emoji: '😴', label: 'Tired', risk: 65 },
  { emoji: '😰', label: 'Anxious', risk: 75 },
  { emoji: '💪', label: 'Motivated', risk: 10 },
  { emoji: '😶', label: 'Numb', risk: 55 },
  { emoji: '😢', label: 'Sad', risk: 85 },
  { emoji: '😎', label: 'Confident', risk: 8 },
];

// Subject-specific topic pools
const topicsBySubject: Record<string, { continue: string; fading: string; levelUp: string; easyWin: string }> = {
  Physics: { continue: 'Thermodynamics · Chapter 3', fading: 'Mechanics · Rotational Motion', levelUp: 'Electrostatics · 85%+ three sessions', easyWin: 'Modern Physics · Your strongest' },
  Chemistry: { continue: 'Organic Chemistry · Reactions', fading: 'Inorganic Chemistry · Periodic Table', levelUp: 'Physical Chemistry · Equilibrium', easyWin: 'Chemical Bonding · Quick review' },
  Mathematics: { continue: 'Calculus · Integration', fading: 'Coordinate Geometry · Conic Sections', levelUp: 'Probability · 85%+ three sessions', easyWin: 'Trigonometry · Formulae practice' },
  Biology: { continue: 'Genetics · DNA Replication', fading: 'Ecology · Ecosystem Dynamics', levelUp: 'Cell Biology · 85%+ three sessions', easyWin: 'Plant Physiology · Diagram recall' },
  'Computer Science': { continue: 'Data Structures · Trees', fading: 'Algorithms · Sorting', levelUp: 'OOP Concepts · 85%+ three sessions', easyWin: 'HTML/CSS · Quick revision' },
  English: { continue: 'Literature · Poetry Analysis', fading: 'Grammar · Tenses', levelUp: 'Comprehension · 85%+ three sessions', easyWin: 'Vocabulary · Word building' },
  History: { continue: 'Indian Freedom Movement · 1920-1947', fading: 'World War II · Causes', levelUp: 'Ancient India · 85%+ three sessions', easyWin: 'Mughal Empire · Timeline' },
  Economics: { continue: 'Microeconomics · Elasticity', fading: 'Macroeconomics · GDP', levelUp: 'Statistics · 85%+ three sessions', easyWin: 'Indian Economy · Basics' },
  Geography: { continue: 'Climatology · Monsoons', fading: 'Map Work · Rivers', levelUp: 'Human Geography', easyWin: 'Physical Geography · Landforms' },
};

const Dashboard = () => {
  const { user, setUser } = useApp();
  const { recoveryMode, setRecoveryMode } = useTheme();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // Build recommendations based on user's selected subjects
  const recommendations = useMemo(() => {
    const subs = user.subjects.length > 0 ? user.subjects : ['Physics', 'Chemistry', 'Mathematics'];
    const recs: { icon: React.ReactNode; type: string; title: string; subtitle: string; action: string; link: string }[] = [];

    // Continue where you left off (from learning history)
    const history = JSON.parse(localStorage.getItem('saathi-learn-history') || '[]');
    if (history.length > 0) {
      const last = history[history.length - 1];
      recs.push({
        icon: <Target size={18} />,
        type: '🎯 Continue where you left off',
        title: `${last.subject} · ${last.subtopic}`,
        subtitle: `Step ${last.step || 1}/5 · Resume learning`,
        action: 'Resume →',
        link: '/learn',
      });
    }

    subs.forEach(sub => {
      const topics = topicsBySubject[sub] || topicsBySubject['Physics'];
      if (recs.length === 0) {
        recs.push({ icon: <Target size={18} />, type: '🎯 Continue where you left off', title: topics.continue, subtitle: '60% complete · ~12 min left', action: 'Resume →', link: '/learn' });
      }
      if (recs.length < 4) {
        recs.push({ icon: <AlertTriangle size={18} />, type: '⚠️ Memory fading', title: `${sub} · ${topics.fading}`, subtitle: 'Last studied 5 days ago', action: 'Review now →', link: '/learn' });
      }
    });

    if (recs.length < 4) {
      const sub = subs[0];
      const topics = topicsBySubject[sub] || topicsBySubject['Physics'];
      recs.push({ icon: <Lightbulb size={18} />, type: '💡 Ready to level up', title: topics.levelUp, subtitle: 'Try advanced problems today', action: 'Challenge →', link: '/quiz' });
    }
    if (recs.length < 4) {
      const sub = subs[subs.length - 1];
      const topics = topicsBySubject[sub] || topicsBySubject['Physics'];
      recs.push({ icon: <Heart size={18} />, type: '🤍 Easy win for today', title: topics.easyWin, subtitle: 'Low energy day — build confidence', action: 'Start easy →', link: '/learn' });
    }
    return recs.slice(0, 4);
  }, [user.subjects]);

  // Burnout score based on mood, streak, time
  const burnoutScore = useMemo(() => {
    let score = 30; // base
    if (selectedMood !== null) {
      score += moods[selectedMood].risk * 0.4;
    }
    // Streak factor: high streak = lower burnout risk
    score -= Math.min(user.streak * 2, 20);
    // Time of day factor
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) score += 15; // late night studying
    if (hour >= 6 && hour < 10) score -= 5; // morning is good
    return Math.max(5, Math.min(95, Math.round(score)));
  }, [selectedMood, user.streak]);

  useEffect(() => {
    if (burnoutScore !== user.burnoutScore) {
      setUser(prev => ({ ...prev, burnoutScore }));
    }
  }, [burnoutScore]);

  const readinessColor = user.readinessScore >= 80
    ? 'hsl(var(--success))'
    : user.readinessScore >= 50
      ? 'hsl(var(--warning))'
      : 'hsl(var(--danger))';

  const heatmapData = useMemo(() => {
    return Array.from({ length: 182 }, () => Math.floor(Math.random() * 4));
  }, []);

  const handleMoodSelect = (i: number) => {
    setSelectedMood(i);
    const mood = moods[i];
    const newReadiness = Math.max(20, user.readinessScore - Math.floor(mood.risk * 0.3));
    setUser(prev => ({
      ...prev,
      mood: mood.label,
      readinessScore: mood.risk < 30 ? Math.min(95, prev.readinessScore + 5) : newReadiness,
    }));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {recoveryMode && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="card-base flex items-center gap-4" style={{ borderColor: 'hsl(var(--accent))' }}>
            <Moon size={20} style={{ color: 'hsl(var(--accent))' }} />
            <div className="flex-1">
              <p className="font-display font-semibold text-sm" style={{ color: 'hsl(var(--text))' }}>🌙 Recovery Mode Active</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>No pressure, no timers. Saathi thinks you need a gentler day.</p>
            </div>
            <button onClick={() => setRecoveryMode(false)} className="text-xs font-medium px-3 py-1 rounded-lg border border-border" style={{ color: 'hsl(var(--text-secondary))' }}>Exit mode</button>
          </motion.div>
        )}

        {/* Readiness Card - SVG Gauge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base">
          <p className="text-sm mb-1" style={{ color: 'hsl(var(--muted))' }}>{greeting()}, {user.name || 'Student'}</p>
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: 'hsl(var(--text))' }}>Today's Readiness</h2>
          
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-20 flex-shrink-0">
              <svg viewBox="0 0 120 65" className="w-full h-full">
                <path d="M 10 58 A 50 50 0 0 1 110 58" fill="none" stroke="hsl(var(--surface2))" strokeWidth="10" strokeLinecap="round" />
                <path d="M 10 58 A 50 50 0 0 1 43 15" fill="none" stroke="hsl(var(--danger))" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
                <path d="M 43 15 A 50 50 0 0 1 77 15" fill="none" stroke="hsl(var(--warning))" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
                <path d="M 77 15 A 50 50 0 0 1 110 58" fill="none" stroke="hsl(var(--success))" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
                <line x1="60" y1="58"
                  x2={60 + 40 * Math.cos(Math.PI - (user.readinessScore / 100) * Math.PI)}
                  y2={58 - 40 * Math.sin(Math.PI - (user.readinessScore / 100) * Math.PI)}
                  stroke="hsl(var(--text))" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="60" cy="58" r="4" fill="hsl(var(--text))" />
                <text x="60" y="52" textAnchor="middle" fontSize="16" fontWeight="bold" fill={readinessColor}>{user.readinessScore}</text>
              </svg>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2"><span>📱</span><span style={{ color: 'hsl(var(--text-secondary))' }}>Mood: {user.mood || 'Not set'}</span></div>
                <div className="flex items-center gap-2"><span>🌙</span><span style={{ color: 'hsl(var(--text-secondary))' }}>Sleep: Moderate</span></div>
                <div className="flex items-center gap-2"><span>📚</span><span style={{ color: 'hsl(var(--text-secondary))' }}>3 topics due</span></div>
              </div>
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'hsl(var(--accent-soft))' }}>
                <p className="text-sm font-display italic" style={{ color: 'hsl(var(--text))' }}>
                  Saathi recommends: "Good energy today. Tackle that {user.subjects[0] || 'Physics'} chapter you've been avoiding. 🎯"
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mood Check-in */}
        {selectedMood === null && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base">
            <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'hsl(var(--text))' }}>How are you feeling right now?</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {moods.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <button onClick={() => handleMoodSelect(i)} className="mood-orb" style={{ background: 'hsl(var(--surface2))' }}>{m.emoji}</button>
                  <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{m.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedMood !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-base text-center py-4">
            <span className="text-3xl mb-2 block">{moods[selectedMood].emoji}</span>
            <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>
              Session adjusted for your <strong>{moods[selectedMood].label.toLowerCase()}</strong> mood
            </p>
          </motion.div>
        )}

        {/* Recommendation Feed - uses user subjects */}
        <div>
          <h3 className="font-display text-lg font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>What Saathi thinks you need today</h3>
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="card-base flex items-center gap-4 cursor-pointer group" onClick={() => navigate(r.link)}>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--muted))' }}>{r.type}</p>
                  <p className="text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{r.title}</p>
                  <p className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>{r.subtitle}</p>
                </div>
                <span className="text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'hsl(var(--accent))' }}>
                  {r.action} <ArrowRight size={14} />
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pomodoro Quick Start */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card-base flex items-center gap-4 cursor-pointer" onClick={() => navigate('/mental-health')}>
          <Timer size={24} style={{ color: 'hsl(var(--accent))' }} />
          <div className="flex-1">
            <p className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>Focus Timer (Pomodoro)</p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>25 min study · 5 min break · Stay focused</p>
          </div>
          <ArrowRight size={16} style={{ color: 'hsl(var(--accent))' }} />
        </motion.div>

        {/* Mental Health Quick Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card-base flex items-center gap-4 cursor-pointer" onClick={() => navigate('/mental-health')}>
          <Brain size={24} style={{ color: 'hsl(var(--accent))' }} />
          <div className="flex-1">
            <p className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>Mental Wellbeing</p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Breathing, CBT exercises, ACT techniques & more</p>
          </div>
          <ArrowRight size={16} style={{ color: 'hsl(var(--accent))' }} />
        </motion.div>

        {/* Heatmap - Full Width */}
        <div className="card-base">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>Your consistency</h3>
            <span className="text-xs stat-number" style={{ color: 'hsl(var(--muted))' }}>Last 26 weeks</span>
          </div>
          <div className="flex gap-0.5 text-[9px] mb-1 pl-8" style={{ color: 'hsl(var(--muted))' }}>
            {['', '', 'Mon', '', 'Wed', '', 'Fri'].map((d, i) => (
              <span key={i} className="flex-1 text-center">{d}</span>
            ))}
          </div>
          <div className="overflow-x-auto">
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: '3px', width: '100%', minWidth: '100%' }}>
              {Array.from({ length: 182 }, (_, i) => {
                const level = heatmapData[i % heatmapData.length];
                return (
                  <div key={i} className="rounded-sm cursor-pointer hover:ring-1 hover:ring-offset-1 transition-all"
                    style={{
                      aspectRatio: '1', minWidth: '10px',
                      background: level === 0 ? 'hsl(var(--surface2))' : level === 1 ? 'hsl(var(--accent) / 0.25)' : level === 2 ? 'hsl(var(--accent) / 0.55)' : 'hsl(var(--accent))',
                    }}
                    title={`${Math.floor(Math.random() * 90)} min studied`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 justify-end text-[9px]" style={{ color: 'hsl(var(--muted))' }}>
            <span>Less</span>
            {[0, 1, 2, 3].map(l => (
              <div key={l} className="w-2.5 h-2.5 rounded-sm" style={{ background: l === 0 ? 'hsl(var(--surface2))' : `hsl(var(--accent) / ${l * 0.3 + 0.1})` }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:block w-72 space-y-6">
        <div className="card-base text-center">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold mx-auto"
              style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>{user.name?.[0] || '?'}</div>
          </div>
          <p className="font-display font-semibold text-sm" style={{ color: 'hsl(var(--text))' }}>{user.name || 'Student'}</p>
          <p className="font-display text-xs italic" style={{ color: 'hsl(var(--muted))' }}>{user.heroTitle}</p>
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {user.subjects.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>{s}</span>
            ))}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'hsl(var(--muted))' }}>XP</span>
              <span className="stat-number" style={{ color: 'hsl(var(--accent))' }}>{user.xp}/500</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'hsl(var(--surface2))' }}>
              <div className="h-full rounded-full" style={{ width: `${(user.xp / 500) * 100}%`, background: 'hsl(var(--accent))' }} />
            </div>
          </div>
        </div>

        {/* Burnout Gauge - Dynamic */}
        <div className="card-base text-center">
          <h4 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>Burnout Risk</h4>
          <div className="relative w-32 h-16 mx-auto mb-2">
            <svg viewBox="0 0 120 60" className="w-full h-full">
              <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--surface2))" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 55 A 50 50 0 0 1 43 12" fill="none" stroke="hsl(var(--success))" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
              <path d="M 43 12 A 50 50 0 0 1 77 12" fill="none" stroke="hsl(var(--warning))" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
              <path d="M 77 12 A 50 50 0 0 1 110 55" fill="none" stroke="hsl(var(--danger))" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
              <line x1="60" y1="55"
                x2={60 + 40 * Math.cos(Math.PI - (burnoutScore / 100) * Math.PI)}
                y2={55 - 40 * Math.sin(Math.PI - (burnoutScore / 100) * Math.PI)}
                stroke="hsl(var(--text))" strokeWidth="2" strokeLinecap="round" />
              <circle cx="60" cy="55" r="3" fill="hsl(var(--text))" />
            </svg>
          </div>
          <span className="stat-number text-2xl font-bold" style={{
            color: burnoutScore > 60 ? 'hsl(var(--danger))' : burnoutScore > 30 ? 'hsl(var(--warning))' : 'hsl(var(--success))'
          }}>{burnoutScore}</span>
          <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>
            {burnoutScore > 60 ? 'High — consider a break' : burnoutScore > 30 ? 'Moderate — keep it steady' : 'Low — you\'re doing great'}
          </p>
        </div>

        <div className="card-base text-center">
          <span className="text-3xl animate-flame inline-block">🔥</span>
          <p className="stat-number text-2xl font-bold mt-1" style={{ color: 'hsl(var(--text))' }}>{user.streak}</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>day streak</p>
        </div>

        <div className="card-base">
          <h4 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>Leaderboard</h4>
          {[
            { name: 'Arjun', xp: 520 },
            { name: user.name || 'You', xp: user.xp },
            { name: 'Priya', xp: 310 },
            { name: 'Rohit', xp: 280 },
          ].sort((a, b) => b.xp - a.xp).map((p, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-sm" style={{
              borderLeft: p.name === (user.name || 'You') ? '2px solid hsl(var(--accent))' : '2px solid transparent', paddingLeft: '8px',
            }}>
              <span className="w-4 stat-number text-xs" style={{ color: 'hsl(var(--muted))' }}>#{i + 1}</span>
              <span className="flex-1 truncate" style={{ color: 'hsl(var(--text))' }}>{p.name}</span>
              <span className="stat-number text-xs" style={{ color: 'hsl(var(--accent))' }}>{p.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
