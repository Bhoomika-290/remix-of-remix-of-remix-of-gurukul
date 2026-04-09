import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
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

interface BossQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const Quiz = () => {
  const { user, setUser } = useApp();
  const { recoveryMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { subject?: string; subtopic?: string } | null;

  const [subject, setSubject] = useState(state?.subject || '');
  const [subtopic, setSubtopic] = useState(state?.subtopic || '');
  const [numQuestions, setNumQuestions] = useState(5);
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
  const [breakTimer, setBreakTimer] = useState(30);
  const [breakActive, setBreakActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [bossTimer, setBossTimer] = useState(60);
  const [bossQCount, setBossQCount] = useState(0);
  const [bossQuestions, setBossQuestions] = useState<BossQuestion[]>([]);
  const [bossCurrentQ, setBossCurrentQ] = useState(0);
  const [bossSelected, setBossSelected] = useState<number | null>(null);
  const [bossAnswered, setBossAnswered] = useState(false);
  const [bossLoading, setBossLoading] = useState(false);
  const qStartTime = useRef(Date.now());
  const responseTimes = useRef<number[]>([]);

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
    if (!subject.trim() || !subtopic.trim()) { toast.error('Please enter subject and topic'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning', { body: { subject, subtopic, mode: 'quiz', numQuestions } });
      if (error) throw error;
      const result = data?.result;
      if (Array.isArray(result) && result.length > 0) {
        setQuestions(result.slice(0, numQuestions));
        setQuizStarted(true);
        qStartTime.current = Date.now();
      } else { toast.error('Could not generate quiz. Try again.'); }
    } catch (err: any) { toast.error(err.message || 'Failed to generate quiz'); }
    finally { setLoading(false); }
  }, [subject, subtopic, numQuestions]);

  useEffect(() => {
    if (state?.subject && state?.subtopic && !quizStarted && questions.length === 0) fetchQuiz();
  }, [state, quizStarted, questions.length, fetchQuiz]);

  // Adaptive difficulty & boss trigger after 3 consecutive correct
  useEffect(() => {
    if (correctStreak >= 3 && difficulty !== 'hard') {
      setDifficulty(prev => prev === 'easy' ? 'medium' : 'hard');
      setEncouragement('Difficulty increased — you\'re on fire!');
      setTimeout(() => setEncouragement(null), 3000);
    }
    // Boss battle after 3 consecutive correct answers
    if (correctStreak >= 3 && !showBoss && !recoveryMode && quizStarted) {
      setCorrectStreak(0);
      setTimeout(() => triggerBoss(), 1000);
    }
  }, [correctStreak]);

  // Brain fog after 3 consecutive wrong answers
  useEffect(() => {
    if (wrongStreak >= 3 && !brainFog) setBrainFog(true);
  }, [wrongStreak]);

  useEffect(() => {
    if (!breakActive) return;
    if (breakTimer <= 0) { setBreakActive(false); setBrainFog(false); setDifficulty('easy'); setEncouragement('Welcome back 🌿 Switched to easier questions.'); setTimeout(() => setEncouragement(null), 4000); return; }
    const t = setTimeout(() => setBreakTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [breakActive, breakTimer]);

  useEffect(() => {
    if (!breakActive) { setBreathPhase('idle'); return; }
    const cycle = () => { setBreathPhase('in'); setTimeout(() => setBreathPhase('hold'), 4000); setTimeout(() => setBreathPhase('out'), 8000); setTimeout(() => setBreathPhase('in'), 12000); };
    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, [breakActive]);

  // Boss timer
  useEffect(() => {
    if (!showBoss || bossDefeated) return;
    if (bossTimer <= 0) { setShowBoss(false); setBossDefeated(false); setBossHP(99); setBossTimer(60); setBossQCount(0); setBossQuestions([]); setBossCurrentQ(0); toast.error("Time's up! Boss escaped. Keep going! 💪"); return; }
    const t = setTimeout(() => setBossTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [showBoss, bossTimer, bossDefeated]);

  const q = questions[currentQ];

  const handleAnswer = (index: number) => {
    if (answered) return;
    const rt = Date.now() - qStartTime.current;
    responseTimes.current.push(rt);
    const avg = responseTimes.current.length > 2 ? responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length : rt;
    const ratio = rt / avg;
    if (responseTimes.current.length > 3 && ratio > 2.2) setBrainFog(true);

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
      if (q.concept && !weakConcepts.includes(q.concept)) setWeakConcepts(prev => [...prev, q.concept]);
    }

    // Boss trigger is now handled by the correctStreak useEffect above
  };

  const triggerBoss = async () => {
    setBossLoading(true);
    setShowBoss(true);
    setBossHP(99);
    setBossTimer(60);
    setBossDefeated(false);
    setBossQCount(0);
    setBossCurrentQ(0);
    setBossSelected(null);
    setBossAnswered(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-learning', {
        body: { subject, subtopic, mode: 'boss-battle' },
      });
      if (error) throw error;
      const result = data?.result;
      if (Array.isArray(result) && result.length > 0) {
        setBossQuestions(result.slice(0, 3));
      } else {
        // Fallback boss questions
        setBossQuestions([
          { question: `What is the most important application of ${subtopic} in real life?`, options: ['Engineering', 'Medicine', 'Space Science', 'All of the above'], correct: 3, explanation: 'This concept has wide applications across all fields!' },
          { question: `Which concept is a prerequisite for understanding ${subtopic}?`, options: ['Basic Mathematics', 'Fundamentals', 'Observation', 'Critical thinking'], correct: 1, explanation: 'Strong fundamentals are key to mastering any topic.' },
          { question: `How would you explain ${subtopic} to a 5-year-old?`, options: ['Using analogies', 'With formulas', 'Through experiments', 'Using simple analogies and examples'], correct: 3, explanation: 'Simple analogies make complex concepts accessible.' },
        ]);
      }
    } catch {
      setBossQuestions([
        { question: `What is the core principle behind ${subtopic}?`, options: ['Conservation', 'Equilibrium', 'Transformation', 'Depends on context'], correct: 3, explanation: 'Context matters in understanding core principles.' },
        { question: `If you could teach ${subtopic} in one sentence, what would it be?`, options: ['A formula', 'A story', 'An analogy', 'A question'], correct: 2, explanation: 'Analogies are the most powerful teaching tools.' },
        { question: `What makes ${subtopic} challenging for most students?`, options: ['Abstract thinking', 'Too many formulas', 'Lack of practice', 'All of these'], correct: 3, explanation: 'Multiple factors contribute to difficulty.' },
      ]);
    } finally {
      setBossLoading(false);
    }
  };

  const handleBossAnswer = (index: number) => {
    if (bossAnswered) return;
    setBossSelected(index);
    setBossAnswered(true);
    const bq = bossQuestions[bossCurrentQ];
    if (!bq) return;

    if (index === bq.correct) {
      const newHP = bossHP - 33;
      setBossHP(newHP);
      setBossShake(true);
      setBossQCount(prev => prev + 1);
      setTimeout(() => setBossShake(false), 500);
      if (newHP <= 0) {
        setBossDefeated(true);
        setSessionXP(prev => prev + 80);
        setUser(prev => ({ ...prev, xp: prev.xp + 80 }));
      }
    }
  };

  const nextBossQuestion = () => {
    if (bossCurrentQ < bossQuestions.length - 1 && !bossDefeated) {
      setBossCurrentQ(prev => prev + 1);
      setBossSelected(null);
      setBossAnswered(false);
    } else if (!bossDefeated) {
      // Boss survived
      setShowBoss(false);
      setBossQuestions([]);
      toast('Boss survived! Keep going to trigger another battle! 💪');
    }
  };

  const handleStuck = () => {
    setStuckCount(prev => prev + 1);
    setAnswered(true);
    setSelected(-1);
    if (q.concept && !weakConcepts.includes(q.concept)) setWeakConcepts(prev => [...prev, q.concept]);
    setEncouragement(`${Math.floor(Math.random() * 40) + 10} students also got stuck on this. You're not alone.`);
    setTimeout(() => setEncouragement(null), 4000);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null); setAnswered(false); setShowHint(false);
      qStartTime.current = Date.now();
    } else setQuizDone(true);
  };

  const startBreak = () => { setBreakTimer(30); setBreakActive(true); };

  const dismissBrainFog = (action: string) => {
    setBrainFog(false);
    setWrongStreak(0);
    if (action === 'game') navigate('/games');
    if (action === 'easier') { setDifficulty('easy'); setEncouragement('Switched to easier questions.'); setTimeout(() => setEncouragement(null), 3000); }
    if (action === 'breathe') startBreak();
  };

  // Topic selection with question count
  if (!quizStarted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
            <Sparkles size={22} style={{ color: 'hsl(var(--accent))' }} /> Adaptive Quiz
          </h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>AI generates questions that adapt to your level.</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Physics, Biology..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none" style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Topic</label>
              <input type="text" value={subtopic} onChange={e => setSubtopic(e.target.value)} placeholder="e.g., Thermodynamics..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none" style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Number of Questions</label>
              <div className="flex gap-2">
                {[3, 5, 10].map(n => (
                  <button key={n} onClick={() => setNumQuestions(n)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: numQuestions === n ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
                      color: numQuestions === n ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text))',
                      borderColor: numQuestions === n ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                    }}>{n} Qs</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted))' }}>Quick picks:</p>
            <div className="flex flex-wrap gap-2">
              {getQuickPicks().map((qp, i) => (
                <button key={i} onClick={() => { setSubject(qp.s); setSubtopic(qp.t); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:border-accent"
                  style={{
                    background: subject === qp.s && subtopic === qp.t ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
                    borderColor: subject === qp.s && subtopic === qp.t ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                    color: 'hsl(var(--text))',
                  }}>{qp.s} · {qp.t}</button>
              ))}
            </div>
          </div>

          <button onClick={fetchQuiz} disabled={!subject.trim() || !subtopic.trim() || loading}
            className="btn-3d w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating quiz...</> : <><Sparkles size={16} /> Start Quiz ({numQuestions} questions)</>}
          </button>
        </motion.div>
      </div>
    );
  }

  // Breathing break
  if (breakActive) {
    const circleScale = breathPhase === 'in' ? 1.4 : breathPhase === 'hold' ? 1.4 : 1;
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, hsl(180 30% 8%), hsl(220 30% 12%))' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <Wind size={40} className="mx-auto mb-4 text-white/60" />
          <h2 className="font-display text-xl font-bold mb-2 text-white">Breathe with Saathi</h2>
          <p className="text-sm mb-8 text-white/50">You'll resume with easier questions after this.</p>
          <div className="relative flex items-center justify-center mb-8">
            <motion.div animate={{ scale: circleScale }} transition={{ duration: 4, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(100,200,180,0.15)', border: '2px solid rgba(100,200,180,0.3)', boxShadow: '0 0 40px rgba(100,200,180,0.1)' }}>
              <span className="font-display text-lg font-semibold text-white/80">
                {breathPhase === 'in' ? 'In' : breathPhase === 'hold' ? 'Hold' : breathPhase === 'out' ? 'Out' : '...'}
              </span>
            </motion.div>
          </div>
          <p className="stat-number text-3xl font-bold mb-2 text-white/80">{breakTimer}s</p>
          <button onClick={() => { setBreakActive(false); setBrainFog(false); setDifficulty('easy'); }} className="mt-6 text-xs text-white/40 hover:text-white/60">Skip & resume →</button>
        </motion.div>
      </div>
    );
  }

  // Brain Fog card
  if (brainFog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, hsl(180 20% 10%), hsl(200 20% 14%))' }}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(100,200,180,0.15)' }}>
              <Shield size={28} className="text-white/60" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2 text-white">Saathi noticed</h3>
            <p className="text-sm text-white/50">Your brain might need a moment.<br/>Every option is valid. No guilt.</p>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: <Wind size={16} />, label: 'Breathe with me — 30s', action: 'breathe' },
              { icon: <Sparkles size={16} />, label: 'Play a mind break game', action: 'game' },
              { icon: <Shield size={16} />, label: 'Give me easier questions', action: 'easier' },
              { icon: <Zap size={16} />, label: "I'm fine, keep going →", action: 'continue' },
            ].map(opt => (
              <button key={opt.action} onClick={() => dismissBrainFog(opt.action)}
                className="w-full text-left flex items-center gap-3 p-3.5 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white/60" style={{ background: 'rgba(255,255,255,0.08)' }}>{opt.icon}</span>
                <p className="text-sm font-medium text-white/80">{opt.label}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Boss Battle with QUESTIONS
  if (showBoss) {
    const segments = [{ filled: bossHP > 66 }, { filled: bossHP > 33 }, { filled: bossHP > 0 }];
    const bq = bossQuestions[bossCurrentQ];

    if (bossDefeated) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(180deg, hsl(0 20% 8%), hsl(0 15% 12%))' }}>
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center max-w-sm">
            <motion.span className="text-7xl block mb-4" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>🎉</motion.span>
            <h2 className="font-display text-3xl font-bold mb-2 text-white">Victory!</h2>
            <p className="text-sm mb-6 text-white/50">Boss defeated! +80 XP bonus earned.</p>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl mb-6" style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Zap size={20} className="text-yellow-400" /><span className="stat-number text-2xl font-bold text-yellow-400">+80 XP</span>
            </motion.div><br />
            <button onClick={() => { setShowBoss(false); setBossQuestions([]); }} className="btn-3d px-8 py-3 font-semibold mt-2">Continue Quiz →</button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, hsl(0 20% 8%), hsl(0 15% 12%))' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2"><Swords size={20} className="text-red-400" /> Boss Battle</h2>
            <span className="stat-number text-sm px-3 py-1 rounded-full" style={{ background: bossTimer <= 10 ? 'rgba(255,60,60,0.2)' : 'rgba(255,255,255,0.1)', color: bossTimer <= 10 ? '#ff6060' : 'rgba(255,255,255,0.6)' }}>⏱ {bossTimer}s</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <motion.div animate={bossShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : bossHP <= 33 ? { x: [-2, 2, -2, 2, 0] } : {}}
              transition={{ duration: 0.4, repeat: bossHP <= 33 && !bossShake ? Infinity : 0 }}
              className="text-6xl" style={{ filter: `drop-shadow(0 0 ${bossHP > 60 ? 30 : 15}px rgba(220,38,38,0.5))` }}>🐉</motion.div>
            <div className="flex-1">
              <div className="flex gap-1.5 mb-1">
                {segments.map((seg, i) => (
                  <div key={i} className="flex-1 h-3 rounded-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div initial={{ width: '100%' }} animate={{ width: seg.filled ? '100%' : '0%' }} className="h-full rounded-md"
                      style={{ background: bossHP <= 33 ? 'hsl(0 70% 50%)' : bossHP <= 66 ? 'hsl(28 80% 55%)' : 'hsl(0 60% 50%)' }} />
                  </div>
                ))}
              </div>
              <p className="stat-number text-xs text-white/40">HP: {Math.max(0, bossHP)}/99 · Q{bossCurrentQ + 1}/3</p>
            </div>
          </div>

          {bossLoading ? (
            <div className="text-center py-12">
              <Loader2 size={32} className="animate-spin mx-auto text-white/40 mb-3" />
              <p className="text-sm text-white/50">Boss is preparing questions...</p>
            </div>
          ) : bq ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-sm font-medium text-white leading-relaxed">{bq.question}</p>
              </div>

              <div className="space-y-2">
                {bq.options.map((opt, i) => {
                  const isCorrect = bossAnswered && i === bq.correct;
                  const isWrong = bossAnswered && i === bossSelected && i !== bq.correct;
                  return (
                    <button key={i} onClick={() => handleBossAnswer(i)} disabled={bossAnswered}
                      className="w-full text-left p-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all"
                      style={{
                        background: isCorrect ? 'rgba(80,200,120,0.15)' : isWrong ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isCorrect ? 'rgba(80,200,120,0.4)' : isWrong ? 'rgba(255,80,80,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: 'rgba(255,255,255,0.85)',
                      }}>
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono flex-shrink-0"
                        style={{ borderColor: isCorrect ? 'rgba(80,200,120,0.6)' : isWrong ? 'rgba(255,80,80,0.6)' : 'rgba(255,255,255,0.2)' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {bossAnswered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-white/70">{bq.explanation}</p>
                  {!bossDefeated && (
                    <button onClick={nextBossQuestion} className="mt-2 px-4 py-2 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                      {bossCurrentQ < bossQuestions.length - 1 ? 'Next Boss Question →' : 'End Battle'}
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            <p className="text-white/50 text-center py-8">No questions available</p>
          )}

          <button onClick={() => { setShowBoss(false); setBossQuestions([]); }} className="block mx-auto mt-4 text-xs text-white/30">Skip boss</button>
        </motion.div>
      </div>
    );
  }

  // Quiz Done
  if (quizDone) {
    const accuracy = Math.round((totalCorrect / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
          <Sparkles size={36} className="mx-auto mb-3" style={{ color: 'hsl(var(--accent))' }} />
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>Session Complete!</h2>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>{subject} · {subtopic}</p>
          <div className="grid grid-cols-4 gap-4 my-6">
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{accuracy}%</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Accuracy</p></div>
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>+{sessionXP}</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>XP</p></div>
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{totalCorrect}/{questions.length}</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Correct</p></div>
            <div><p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--warning))' }}>{stuckCount}</p><p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Stuck</p></div>
          </div>
          {weakConcepts.length > 0 && (
            <div className="p-3 rounded-xl mb-4 text-left" style={{ background: 'hsl(var(--surface2))' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--warning))' }}>Weak areas:</p>
              <div className="flex flex-wrap gap-1.5">
                {weakConcepts.map((c, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/revision')} className="btn-3d px-6 py-2.5 text-sm font-semibold">Create flashcards →</button>
            <button onClick={() => { setQuizStarted(false); setQuizDone(false); setCurrentQ(0); setSessionXP(0); setTotalCorrect(0); setCorrectStreak(0); setWrongStreak(0); setStuckCount(0); setQuestions([]); setWeakConcepts([]); }}
              className="btn-3d-ghost px-6 py-2.5 text-sm">New quiz</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => setQuizStarted(false)} className="text-xs" style={{ color: 'hsl(var(--muted))' }}>← Back</button>
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
            background: difficulty === 'hard' ? 'hsl(var(--danger) / 0.15)' : difficulty === 'medium' ? 'hsl(var(--warning) / 0.15)' : 'hsl(var(--success) / 0.15)',
            color: difficulty === 'hard' ? 'hsl(var(--danger))' : difficulty === 'medium' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
          }}>{difficulty}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={startBreak} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-border hover:border-accent transition-all" style={{ color: 'hsl(var(--muted))' }}>
            <Wind size={12} /> 30s break
          </button>
          <span className="text-sm" style={{ color: 'hsl(var(--muted))' }}>Q{currentQ + 1}/{questions.length}</span>
          <span className="stat-number text-sm flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}><Zap size={14} /> +{sessionXP}</span>
          {correctStreak >= 2 && <span className="text-sm animate-flame">🔥 {correctStreak}</span>}
        </div>
      </div>

      <AnimatePresence>
        {encouragement && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card-base mb-4 text-center py-2">
            <p className="text-sm font-display" style={{ color: 'hsl(var(--accent))' }}>{encouragement}</p>
          </motion.div>
        )}
      </AnimatePresence>

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
              <button onClick={() => setShowHint(true)} className="flex items-center gap-1 text-xs mt-2" style={{ color: 'hsl(var(--accent))' }}><HelpCircle size={12} /> Hint</button>
            )}
            {showHint && <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--text-secondary))' }}>💡 {q.hint}</p>}
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
                    style={{ borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : 'hsl(var(--border))' }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {!answered && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={handleStuck} className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted))' }}><AlertCircle size={14} /> I'm stuck</button>
              {stuckCount > 0 && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>🤝 {stuckCount} stuck today</span>}
            </div>
          )}

          {answered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base mt-4">
              {selected === -1 && <p className="font-display text-sm mb-2" style={{ color: 'hsl(var(--warning))' }}>Correct answer: <strong>{q.options[q.correct]}</strong></p>}
              <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>{q.explanation}</p>
              <button onClick={nextQuestion} className="btn-3d text-sm mt-3 px-6 py-2">{currentQ < questions.length - 1 ? 'Next →' : 'Finish →'}</button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
