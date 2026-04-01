import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Zap, HelpCircle, Loader2, Sparkles } from 'lucide-react';
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

  // Topic input
  const [subject, setSubject] = useState(state?.subject || '');
  const [subtopic, setSubtopic] = useState(state?.subtopic || '');
  const [quizStarted, setQuizStarted] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [showBoss, setShowBoss] = useState(false);
  const [bossHP, setBossHP] = useState(99);
  const [brainFog, setBrainFog] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const qStartTime = useRef(Date.now());
  const responseTimes = useRef<number[]>([]);

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

  // Auto-start if navigated from Learn
  useEffect(() => {
    if (state?.subject && state?.subtopic && !quizStarted && questions.length === 0) {
      fetchQuiz();
    }
  }, [state, quizStarted, questions.length, fetchQuiz]);

  const q = questions[currentQ];

  const handleAnswer = (index: number) => {
    if (answered) return;
    const rt = Date.now() - qStartTime.current;
    responseTimes.current.push(rt);

    if (responseTimes.current.length > 3) {
      const avg = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length;
      if (rt > avg * 2.2) setBrainFog(true);
    }

    setSelected(index);
    setAnswered(true);
    const isCorrect = index === q.correct;

    if (isCorrect) {
      const xp = q.difficulty === 'hard' ? 30 : q.difficulty === 'medium' ? 20 : 10;
      setSessionXP(prev => prev + xp);
      setTotalCorrect(prev => prev + 1);
      setCorrectStreak(prev => prev + 1);
      setUser(prev => ({ ...prev, xp: prev.xp + xp }));
    } else {
      setCorrectStreak(0);
    }

    if ((currentQ + 1) % 5 === 0 && correctStreak >= 2 && isCorrect) {
      setTimeout(() => setShowBoss(true), 1500);
    }
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

  const dismissBrainFog = (action: string) => {
    setBrainFog(false);
    if (action === 'game') navigate('/games');
  };

  // Topic selection screen
  if (!quizStarted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>
            🎯 Adaptive Quiz
          </h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>
            Enter any topic — Saathi AI generates questions adapted to your level.
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

          <p className="text-xs mb-4" style={{ color: 'hsl(var(--muted))' }}>
            💡 Tip: Learn a topic first, then take the quiz for best results.
          </p>

          <button onClick={fetchQuiz} disabled={!subject.trim() || !subtopic.trim() || loading}
            className="btn-3d w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating quiz...</> : <><Sparkles size={16} /> Start AI Quiz</>}
          </button>
        </motion.div>
      </div>
    );
  }

  // Brain Fog
  if (brainFog) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-base text-center">
          <span className="text-3xl mb-3 block">🌿</span>
          <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'hsl(var(--text))' }}>Saathi noticed</h3>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--text-secondary))' }}>
            Your response time slowed down. Your brain might need a moment.
          </p>
          <div className="space-y-2">
            {[
              { label: 'Play a mind break game', action: 'game' },
              { label: 'Give me easier questions', action: 'easier' },
              { label: "I'm fine, keep going →", action: 'continue' },
            ].map(opt => (
              <button key={opt.action} onClick={() => dismissBrainFog(opt.action)}
                className="answer-tile w-full text-sm text-left" style={{ color: 'hsl(var(--text))' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Boss Battle
  if (showBoss) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'hsl(var(--bg))' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-base text-center max-w-md w-full">
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>⚔️ Boss Battle!</h2>
          <span className="text-6xl block mb-4">🐉</span>
          <div className="w-full h-4 rounded-full mb-2" style={{ background: 'hsl(var(--surface2))' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${bossHP}%` }}
              style={{ background: bossHP > 60 ? 'hsl(var(--danger))' : bossHP > 30 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }} />
          </div>
          <p className="stat-number text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>HP: {bossHP}/99</p>
          <button onClick={() => {
            if (bossHP <= 33) { setShowBoss(false); setSessionXP(prev => prev + 80); }
            else setBossHP(prev => prev - 33);
          }} className="btn-3d px-8 py-3 font-semibold">
            {bossHP <= 33 ? '🎉 Victory!' : '⚔️ Attack!'}
          </button>
          <button onClick={() => setShowBoss(false)} className="block mx-auto mt-3 text-xs" style={{ color: 'hsl(var(--muted))' }}>Skip boss</button>
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
          <span className="text-4xl mb-3 block">🎯</span>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>Session Complete!</h2>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>{subject} · {subtopic}</p>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div>
              <p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{accuracy}%</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Accuracy</p>
            </div>
            <div>
              <p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>+{sessionXP}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>XP Earned</p>
            </div>
            <div>
              <p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{totalCorrect}/{questions.length}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Correct</p>
            </div>
          </div>
          <div className="p-3 rounded-xl mb-4" style={{ background: 'hsl(var(--accent-soft))' }}>
            <p className="font-display text-sm italic" style={{ color: 'hsl(var(--text))' }}>
              {accuracy >= 80 ? "Excellent! Your understanding is getting stronger 🔥"
                : accuracy >= 50 ? "Good effort! You're building solid foundations 💪"
                  : "You showed up and tried — that's what matters 🤍"}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setQuizStarted(false); setQuizDone(false); setCurrentQ(0); setSessionXP(0); setTotalCorrect(0); setCorrectStreak(0); setQuestions([]); }}
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setQuizStarted(false)} className="text-xs" style={{ color: 'hsl(var(--muted))' }}>← {subtopic}</button>
          <span className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              background: q.difficulty === 'hard' ? 'hsl(var(--danger) / 0.15)' : q.difficulty === 'medium' ? 'hsl(var(--warning) / 0.15)' : 'hsl(var(--success) / 0.15)',
              color: q.difficulty === 'hard' ? 'hsl(var(--danger))' : q.difficulty === 'medium' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
            }}>
            {q.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: 'hsl(var(--muted))' }}>Q{currentQ + 1}/{questions.length}</span>
          <span className="stat-number text-sm flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}>
            <Zap size={14} /> +{sessionXP} XP
          </span>
          {correctStreak >= 2 && <span className="text-sm animate-flame">🔥 {correctStreak}</span>}
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full"
            style={{ background: i < currentQ ? 'hsl(var(--accent))' : i === currentQ ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--surface2))' }} />
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
              <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--text-secondary))' }}>
                💡 {q.hint}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = answered && i === q.correct;
              const isWrong = answered && i === selected && i !== q.correct;
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                  className="answer-tile w-full text-left text-sm font-medium flex items-center gap-3"
                  style={{
                    borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : undefined,
                    background: isCorrect ? 'hsl(var(--success) / 0.1)' : isWrong ? 'hsl(var(--danger) / 0.1)' : undefined,
                    animation: isCorrect ? 'correctBounce3D 0.5s ease forwards' : isWrong ? 'wrongShake3D 0.4s ease forwards' : undefined,
                    color: 'hsl(var(--text))',
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

          {answered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base mt-4">
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
