import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Zap, HelpCircle, Loader2, Sparkles, AlertCircle, Wind, Shield, Swords, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

const Quiz = () => {
  const { user, setUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { subject?: string; subtopic?: string } | null;

  const [subject, setSubject] = useState(state?.subject || '');
  const [subtopic, setSubtopic] = useState(state?.subtopic || '');
  const [quizStarted, setQuizStarted] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [showBoss, setShowBoss] = useState(false);
  const [bossHP, setBossHP] = useState(99);
  const [bossShake, setBossShake] = useState(false);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [brainFog, setBrainFog] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stuckCount, setStuckCount] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [manualBreak, setManualBreak] = useState(false);
  const [breakTimer, setBreakTimer] = useState(30);
  const [breakActive, setBreakActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [lastResponseRatio, setLastResponseRatio] = useState(1);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [bossTimer, setBossTimer] = useState(30);
  const qStartTime = useRef(Date.now());
  const responseTimes = useRef<number[]>([]);

  // Quick picks
  const getQuickPicks = () => {
    const subjectTopics: Record<string, string[]> = {
      Physics: ['Thermodynamics', "Newton's Laws", 'Electrostatics', 'Optics'],
      Chemistry: ['Chemical Bonding', 'Organic Reactions', 'Periodic Table', 'Equilibrium'],
      Mathematics: ['Quadratic Equations', 'Calculus', 'Probability', 'Trigonometry'],
      Biology: ['Cell Division', 'Genetics', 'Ecology', 'Human Physiology'],
      'Computer Science': ['Binary Search', 'Data Structures', 'OOP', 'SQL'],
      English: ['Grammar', 'Poetry', 'Essay Writing', 'Comprehension'],
      History: ['Freedom Movement', 'World War II', 'Mughal Empire', 'French Revolution'],
      Economics: ['Supply & Demand', 'GDP', 'Banking', 'Inflation'],
    };
    const subs = user.subjects.length > 0 ? user.subjects : ['Physics', 'Chemistry', 'Mathematics'];
    const picks: { s: string; t: string }[] = [];
    subs.forEach(sub => {
      const topics = subjectTopics[sub] || [];
      topics.slice(0, 2).forEach(t => picks.push({ s: sub, t }));
    });
    return picks.slice(0, 6);
  };

  const fetchQuiz = useCallback(async () => {
    if (!subject.trim() || !subtopic.trim()) {
      toast.error('Please enter subject and topic');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning', {
        body: { subject, subtopic, mode: 'quiz' },
      });
      if (error) throw error;
      const result = data?.result;
      if (Array.isArray(result) && result.length > 0) {
        setQuestions(result);
        setQuizStarted(true);
        qStartTime.current = Date.now();
      } else {
        toast.error('Could not generate quiz. Try again.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }, [subject, subtopic]);

  useEffect(() => {
    if (state?.subject && state?.subtopic && !quizStarted && questions.length === 0) {
      fetchQuiz();
    }
  }, [state, quizStarted, questions.length, fetchQuiz]);

  // Adaptive difficulty
  useEffect(() => {
    if (correctStreak >= 3 && difficulty !== 'hard') {
      setDifficulty(prev => prev === 'easy' ? 'medium' : 'hard');
      setEncouragement('🔥 You\'re on fire! Difficulty increased.');
      setTimeout(() => setEncouragement(null), 3000);
      setCorrectStreak(0);
    }
  }, [correctStreak]);

  useEffect(() => {
    if (wrongStreak >= 3 && difficulty !== 'easy') {
      setDifficulty(prev => prev === 'hard' ? 'medium' : 'easy');
      setEncouragement('No worries! Giving you easier questions to build confidence.');
      setTimeout(() => setEncouragement(null), 3000);
      setWrongStreak(0);
    }
  }, [wrongStreak]);

  // Break timer countdown
  useEffect(() => {
    if (!breakActive) return;
    if (breakTimer <= 0) {
      setBreakActive(false);
      setManualBreak(false);
      setBrainFog(false);
      setDifficulty('easy');
      setEncouragement('Welcome back 🌿 Switched to easier questions.');
      setTimeout(() => setEncouragement(null), 4000);
      return;
    }
    const t = setTimeout(() => setBreakTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [breakActive, breakTimer]);

  // Breathing cycle during break
  useEffect(() => {
    if (!breakActive) { setBreathPhase('idle'); return; }
    const cycle = () => {
      setBreathPhase('in');
      setTimeout(() => setBreathPhase('hold'), 4000);
      setTimeout(() => setBreathPhase('out'), 8000);
      setTimeout(() => setBreathPhase('in'), 12000);
    };
    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, [breakActive]);

  // Boss timer
  useEffect(() => {
    if (!showBoss || bossDefeated) return;
    if (bossTimer <= 0) {
      setShowBoss(false);
      setBossDefeated(false);
      setBossHP(99);
      setBossTimer(30);
      toast.error('Time\'s up! Boss escaped. Keep going! 💪');
      return;
    }
    const t = setTimeout(() => setBossTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [showBoss, bossTimer, bossDefeated]);

  const q = questions[currentQ];

  const handleAnswer = (index: number) => {
    if (answered) return;
    const rt = Date.now() - qStartTime.current;
    responseTimes.current.push(rt);

    const avg = responseTimes.current.length > 2
      ? responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length
      : rt;
    setAvgResponseTime(avg);
    const ratio = rt / avg;
    setLastResponseRatio(ratio);

    if (responseTimes.current.length > 3 && ratio > 2.2) {
      setBrainFog(true);
    }

    setSelected(index);
    setAnswered(true);
    const isCorrect = index === q.correct;

    if (isCorrect) {
      const xp = q.difficulty === 'hard' ? 30 : q.difficulty === 'medium' ? 20 : 10;
      setSessionXP(prev => prev + xp);
      setTotalCorrect(prev => prev + 1);
      setCorrectStreak(prev => prev + 1);
      setWrongStreak(0);
      setUser(prev => ({ ...prev, xp: prev.xp + xp }));
    } else {
      setCorrectStreak(0);
      setWrongStreak(prev => prev + 1);
      // Track weak concepts
      if (q.concept && !weakConcepts.includes(q.concept)) {
        setWeakConcepts(prev => [...prev, q.concept]);
      }
    }

    // Boss battle trigger
    if ((currentQ + 1) % 5 === 0 && correctStreak >= 2 && isCorrect) {
      setTimeout(() => {
        setShowBoss(true);
        setBossHP(99);
        setBossTimer(30);
        setBossDefeated(false);
      }, 1500);
    }
  };

  const handleStuck = () => {
    setStuckCount(prev => prev + 1);
    setAnswered(true);
    setSelected(-1);
    if (q.concept && !weakConcepts.includes(q.concept)) {
      setWeakConcepts(prev => [...prev, q.concept]);
    }
    setEncouragement(`🤝 ${stuckCount + 1} student(s) got stuck on this today. You're not alone.`);
    setTimeout(() => setEncouragement(null), 4000);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
      setShowHint(false);
      qStartTime.current = Date.now();
    } else {
      setQuizDone(true);
    }
  };

  const startBreak = () => {
    setBreakTimer(30);
    setBreakActive(true);
  };

  const dismissBrainFog = (action: string) => {
    setBrainFog(false);
    if (action === 'game') navigate('/games');
    if (action === 'easier') {
      setDifficulty('easy');
      setEncouragement('Switched to easier questions. Take your time.');
      setTimeout(() => setEncouragement(null), 3000);
    }
    if (action === 'breathe') {
      startBreak();
    }
  };

  const handleBossAttack = () => {
    const newHP = bossHP - 33;
    setBossHP(newHP);
    setBossShake(true);
    setTimeout(() => setBossShake(false), 500);
    if (newHP <= 0) {
      setBossDefeated(true);
      setSessionXP(prev => prev + 80);
      setUser(prev => ({ ...prev, xp: prev.xp + 80 }));
    }
  };

  // Topic selection
  if (!quizStarted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>🎯 Adaptive Quiz</h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>
            AI generates questions that adapt to your level. Difficulty adjusts automatically!
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="e.g., Physics, Biology, History..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none"
                style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Topic</label>
              <input type="text" value={subtopic} onChange={e => setSubtopic(e.target.value)}
                placeholder="e.g., Thermodynamics, Genetics, World War 2..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none"
                style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted))' }}>
              Based on your subjects ({user.subjects.join(', ') || 'General'}):
            </p>
            <div className="flex flex-wrap gap-2">
              {getQuickPicks().map((q, i) => (
                <button key={i} onClick={() => { setSubject(q.s); setSubtopic(q.t); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:border-accent"
                  style={{
                    background: subject === q.s && subtopic === q.t ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
                    borderColor: subject === q.s && subtopic === q.t ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                    color: 'hsl(var(--text))',
                  }}>{q.s} · {q.t}</button>
              ))}
            </div>
          </div>

          <button onClick={fetchQuiz} disabled={!subject.trim() || !subtopic.trim() || loading}
            className="btn-3d w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating quiz...</> : <><Sparkles size={16} /> Start AI Quiz</>}
          </button>
        </motion.div>
      </div>
    );
  }

  // Breathing break overlay
  if (breakActive) {
    const circleScale = breathPhase === 'in' ? 1.4 : breathPhase === 'hold' ? 1.4 : breathPhase === 'out' ? 1 : 1;
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6" style={{ background: 'hsl(var(--bg))' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <span className="text-4xl mb-4 block">🌿</span>
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>Breathe with Saathi</h2>
          <p className="text-sm mb-8" style={{ color: 'hsl(var(--muted))' }}>You'll resume with easier questions after this.</p>

          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(var(--accent) / 0.15)', border: '2px solid hsl(var(--accent) / 0.3)' }}>
              <motion.div
                animate={{ scale: circleScale * 0.7 }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'hsl(var(--accent) / 0.25)' }}>
                <span className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--accent))' }}>
                  {breathPhase === 'in' ? 'In' : breathPhase === 'hold' ? 'Hold' : breathPhase === 'out' ? 'Out' : '...'}
                </span>
              </motion.div>
            </motion.div>
          </div>

          <p className="stat-number text-3xl font-bold mb-2" style={{ color: 'hsl(var(--accent))' }}>{breakTimer}s</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Break ends automatically</p>

          <button onClick={() => { setBreakActive(false); setManualBreak(false); setBrainFog(false); setDifficulty('easy'); }}
            className="mt-6 text-xs font-medium" style={{ color: 'hsl(var(--muted))' }}>Skip & resume →</button>
        </motion.div>
      </div>
    );
  }

  // Brain Fog Card — full design
  if (brainFog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'hsl(var(--bg))' }}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          className="card-base max-w-md w-full p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-3 block">🌿</span>
            <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>Saathi noticed</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
              Your response time slowed down.<br />
              This happens — your brain might need a moment.
            </p>
          </div>

          {/* Insight card */}
          <div className="p-3 rounded-xl mb-6 text-center" style={{ background: 'hsl(var(--surface2))' }}>
            <p className="text-xs mb-1" style={{ color: 'hsl(var(--muted))' }}>Response time</p>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--warning))' }}>
              {lastResponseRatio.toFixed(1)}x your average
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>
              Avg: {(avgResponseTime / 1000).toFixed(1)}s · This one: {((avgResponseTime * lastResponseRatio) / 1000).toFixed(1)}s
            </p>
          </div>

          <p className="text-xs font-medium mb-3" style={{ color: 'hsl(var(--muted))' }}>What do you want to do?</p>
          <div className="space-y-2.5">
            {[
              { icon: <Wind size={16} />, label: 'Breathe with me — 30s', desc: 'Guided breathing, then easier questions', action: 'breathe' },
              { icon: '🎮', label: 'Play a mind break game', desc: 'Come back refreshed', action: 'game' },
              { icon: '📉', label: 'Give me easier questions', desc: 'Lower difficulty, keep going', action: 'easier' },
              { icon: '→', label: "I'm fine, keep going", desc: 'No changes, continue quiz', action: 'continue' },
            ].map(opt => (
              <button key={opt.action} onClick={() => dismissBrainFog(opt.action)}
                className="answer-tile w-full text-left flex items-center gap-3 group">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                  {typeof opt.icon === 'string' ? opt.icon : opt.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'hsl(var(--text))' }}>{opt.label}</p>
                  <p className="text-[11px]" style={{ color: 'hsl(var(--muted))' }}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-center mt-4" style={{ color: 'hsl(var(--muted))' }}>
            Every option is valid. No guilt on any choice.
          </p>
        </motion.div>
      </div>
    );
  }

  // Boss Battle — Epic fullscreen
  if (showBoss) {
    const segments = [
      { filled: bossHP > 66 },
      { filled: bossHP > 33 },
      { filled: bossHP > 0 },
    ];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, hsl(0 20% 8%), hsl(0 15% 12%))',
        }}>
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

        {bossDefeated ? (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center max-w-sm">
            <motion.span className="text-7xl block mb-4"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}>🎉</motion.span>
            <h2 className="font-display text-3xl font-bold mb-2 text-white">Victory!</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>Boss defeated! You earned bonus XP.</p>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl mb-6"
              style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Zap size={20} className="text-yellow-400" />
              <span className="stat-number text-2xl font-bold text-yellow-400">+80 XP</span>
            </motion.div>
            <br />
            <button onClick={() => { setShowBoss(false); setBossDefeated(false); setBossHP(99); setBossTimer(30); }}
              className="btn-3d px-8 py-3 font-semibold mt-2">Continue Quiz →</button>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center max-w-md w-full px-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Swords size={20} className="text-red-400" /> Boss Battle
              </h2>
              <span className="stat-number text-sm px-3 py-1 rounded-full"
                style={{ background: bossTimer <= 10 ? 'rgba(255,60,60,0.2)' : 'rgba(255,255,255,0.1)', color: bossTimer <= 10 ? '#ff6060' : 'rgba(255,255,255,0.6)' }}>
                ⏱ {bossTimer}s
              </span>
            </div>

            {/* Boss character */}
            <motion.div animate={bossShake ? { x: [-8, 8, -6, 6, -3, 3, 0], rotateY: [-5, 5, -3, 3, 0] } : bossHP <= 33 ? { x: [-2, 2, -2, 2, 0] } : {}}
              transition={{ duration: 0.4, repeat: bossHP <= 33 && !bossShake ? Infinity : 0 }}
              className="text-8xl mb-4 block" style={{ filter: `drop-shadow(0 0 ${bossHP > 60 ? 30 : 15}px rgba(220,38,38,0.5))` }}>
              🐉
            </motion.div>

            {/* Segmented HP bar */}
            <div className="flex gap-1.5 mb-2 max-w-xs mx-auto">
              {segments.map((seg, i) => (
                <div key={i} className="flex-1 h-4 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: seg.filled ? '100%' : '0%' }}
                    className="h-full rounded-md"
                    style={{
                      background: bossHP <= 33 ? 'hsl(0 70% 50%)' : bossHP <= 66 ? 'hsl(28 80% 55%)' : 'hsl(0 60% 50%)',
                      animation: bossHP <= 33 ? 'pulse 1s ease infinite' : undefined,
                    }} />
                </div>
              ))}
            </div>
            <p className="stat-number text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              HP: {Math.max(0, bossHP)}/99
            </p>

            <button onClick={handleBossAttack}
              className="relative px-10 py-4 rounded-xl font-display text-lg font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, hsl(0 60% 45%), hsl(0 70% 35%))',
                boxShadow: '0 4px 0 hsl(0 50% 25%), 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                transform: 'perspective(800px) translateZ(0)',
                transition: 'all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
              <Swords size={20} className="inline mr-2" /> Attack! (-33 HP)
            </button>

            <button onClick={() => { setShowBoss(false); setBossHP(99); setBossTimer(30); }}
              className="block mx-auto mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Skip boss</button>
          </motion.div>
        )}
      </div>
    );
  }

  // Quiz Done
  if (quizDone) {
    const accuracy = Math.round((totalCorrect / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
          <span className="text-4xl mb-3 block">🎯</span>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>Session Complete!</h2>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>{subject} · {subtopic}</p>
          <div className="grid grid-cols-4 gap-4 my-6">
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{accuracy}%</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Accuracy</p></div>
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>+{sessionXP}</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>XP</p></div>
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{totalCorrect}/{questions.length}</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Correct</p></div>
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--warning))' }}>{stuckCount}</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Stuck</p></div>
          </div>

          {/* Weak areas */}
          {weakConcepts.length > 0 && (
            <div className="p-3 rounded-xl mb-4 text-left" style={{ background: 'hsl(var(--surface2))' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--warning))' }}>⚠️ Weak areas detected:</p>
              <div className="flex flex-wrap gap-1.5">
                {weakConcepts.map((c, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl mb-4" style={{ background: 'hsl(var(--accent-soft))' }}>
            <p className="font-display text-sm italic" style={{ color: 'hsl(var(--text))' }}>
              {accuracy >= 80 ? "Excellent! Your understanding is getting stronger 🔥" : accuracy >= 50 ? "Good effort! You're building solid foundations 💪" : "You showed up and tried — that's what matters 🤍"}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setQuizStarted(false); setQuizDone(false); setCurrentQ(0); setSessionXP(0); setTotalCorrect(0); setCorrectStreak(0); setWrongStreak(0); setStuckCount(0); setQuestions([]); setWeakConcepts([]); }}
              className="btn-3d px-6 py-2.5 text-sm font-semibold">New quiz</button>
            <button onClick={() => navigate('/learn')} className="btn-3d-ghost px-6 py-2.5 text-sm">Learn more</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setQuizStarted(false)} className="text-xs" style={{ color: 'hsl(var(--muted))' }}>← {subtopic}</button>
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
            background: difficulty === 'hard' ? 'hsl(var(--danger) / 0.15)' : difficulty === 'medium' ? 'hsl(var(--warning) / 0.15)' : 'hsl(var(--success) / 0.15)',
            color: difficulty === 'hard' ? 'hsl(var(--danger))' : difficulty === 'medium' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
          }}>Level: {difficulty}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Quick break button */}
          <button onClick={() => { setManualBreak(true); startBreak(); }}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-border hover:border-accent transition-all"
            style={{ color: 'hsl(var(--muted))' }}>
            <Wind size={12} /> 30s break
          </button>
          <span className="text-sm" style={{ color: 'hsl(var(--muted))' }}>Q{currentQ + 1}/{questions.length}</span>
          <span className="stat-number text-sm flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}><Zap size={14} /> +{sessionXP} XP</span>
          {correctStreak >= 2 && <span className="text-sm animate-flame">🔥 {correctStreak}</span>}
        </div>
      </div>

      {/* Encouragement message */}
      <AnimatePresence>
        {encouragement && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card-base mb-4 text-center py-2">
            <p className="text-sm font-display" style={{ color: 'hsl(var(--accent))' }}>{encouragement}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < currentQ ? 'hsl(var(--accent))' : i === currentQ ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--surface2))' }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div className="card-base mb-4">
            <p className="text-xs mb-2" style={{ color: 'hsl(var(--muted))' }}>{q.concept}</p>
            <h3 className="text-base font-medium mb-1" style={{ color: 'hsl(var(--text))' }}>{q.question}</h3>
            {q.hint && !showHint && !answered && (
              <button onClick={() => setShowHint(true)} className="flex items-center gap-1 text-xs mt-2" style={{ color: 'hsl(var(--accent))' }}>
                <HelpCircle size={12} /> Hint available
              </button>
            )}
            {showHint && (
              <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--text-secondary))' }}>💡 {q.hint}</p>
            )}
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = answered && i === q.correct;
              const isWrong = answered && i === selected && i !== q.correct;
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`answer-tile w-full text-left text-sm font-medium flex items-center gap-3 ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  style={{
                    borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : undefined,
                    background: isCorrect ? 'hsl(var(--success) / 0.1)' : isWrong ? 'hsl(var(--danger) / 0.1)' : undefined,
                    color: 'hsl(var(--text))',
                    animation: isCorrect ? 'correctBounce3D 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : isWrong ? 'wrongShake3D 0.4s ease' : undefined,
                  }}>
                  <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono"
                    style={{ borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : 'hsl(var(--border))' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* I'm Stuck + stuck count */}
          {!answered && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={handleStuck} className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted))' }}>
                <AlertCircle size={14} /> I'm stuck on this one
              </button>
              {stuckCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>
                  🤝 {stuckCount} stuck today
                </span>
              )}
            </div>
          )}

          {answered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base mt-4">
              {selected === -1 ? (
                <p className="font-display text-sm mb-2" style={{ color: 'hsl(var(--warning))' }}>
                  The correct answer was: <strong>{q.options[q.correct]}</strong>
                </p>
              ) : null}
              <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>{q.explanation}</p>
              <button onClick={nextQuestion} className="btn-3d text-sm mt-3 px-6 py-2">
                {currentQ < questions.length - 1 ? 'Next question →' : 'Finish quiz →'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
