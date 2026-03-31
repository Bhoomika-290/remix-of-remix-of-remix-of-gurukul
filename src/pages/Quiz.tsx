import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Timer, Zap, HelpCircle } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

const mockQuestions: Question[] = [
  {
    question: 'A car of mass 1000 kg accelerates at 2 m/s². What is the net force acting on it?',
    options: ['500 N', '2000 N', '1000 N', '4000 N'],
    correct: 1,
    explanation: 'Using F = ma: F = 1000 × 2 = 2000 N. The net force is directly proportional to both mass and acceleration.',
    concept: "Newton's Second Law",
    difficulty: 'easy',
    hint: 'Remember F = ma. Just multiply the values given!',
  },
  {
    question: 'Which of the following is an example of Newton\'s Third Law?',
    options: ['A ball rolling on a surface', 'Rocket propulsion', 'A book on a table', 'Free fall of an object'],
    correct: 1,
    explanation: 'Rockets push gas backward (action), and the gas pushes the rocket forward (reaction). This is a classic example of equal and opposite forces.',
    concept: "Newton's Third Law",
    difficulty: 'medium',
  },
  {
    question: 'An object is in free fall near Earth\'s surface. What is its acceleration?',
    options: ['0 m/s²', '9.8 m/s²', '10 m/s²', 'Depends on mass'],
    correct: 1,
    explanation: 'Near Earth\'s surface, all objects in free fall accelerate at approximately 9.8 m/s² regardless of mass (ignoring air resistance).',
    concept: 'Gravitational acceleration',
    difficulty: 'easy',
    hint: 'Think about Galileo\'s famous experiment!',
  },
  {
    question: 'A 5 kg block is pushed with 20 N force against 5 N friction. What is the acceleration?',
    options: ['4 m/s²', '3 m/s²', '5 m/s²', '1 m/s²'],
    correct: 1,
    explanation: 'Net force = 20 - 5 = 15 N. Using a = F/m: a = 15/5 = 3 m/s². Always subtract friction from applied force first!',
    concept: 'Net force with friction',
    difficulty: 'medium',
  },
  {
    question: 'In which scenario does an object have zero net force?',
    options: ['Accelerating car', 'Ball thrown upward', 'Satellite in orbit', 'Book resting on table'],
    correct: 3,
    explanation: 'A book on a table has gravity pulling it down and the table pushing it up — these forces are equal and opposite, so net force is zero.',
    concept: 'Equilibrium',
    difficulty: 'easy',
  },
];

const Quiz = () => {
  const { user, setUser } = useApp();
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
  const qStartTime = useRef(Date.now());
  const responseTimes = useRef<number[]>([]);

  const q = mockQuestions[currentQ];

  const handleAnswer = (index: number) => {
    if (answered) return;
    const rt = Date.now() - qStartTime.current;
    responseTimes.current.push(rt);

    // Brain fog detection
    if (responseTimes.current.length > 3) {
      const avg = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length;
      if (rt > avg * 2.2) {
        setBrainFog(true);
      }
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

    // Boss battle trigger
    if ((currentQ + 1) % 5 === 0 && correctStreak >= 2 && isCorrect) {
      setTimeout(() => setShowBoss(true), 1500);
    }
  };

  const nextQuestion = () => {
    if (currentQ < mockQuestions.length - 1) {
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
    if (action === 'easier') {
      // Would lower difficulty in real app
    }
  };

  // Brain Fog Card
  if (brainFog) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-base text-center">
          <span className="text-3xl mb-3 block">🌿</span>
          <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'hsl(var(--text))' }}>Saathi noticed</h3>
          <p className="text-sm mb-1" style={{ color: 'hsl(var(--text-secondary))' }}>
            Your response time slowed down. This happens — your brain might need a moment.
          </p>
          <p className="stat-number text-xs mb-4" style={{ color: 'hsl(var(--muted))' }}>
            Response time: 2.3x your average
          </p>
          <div className="space-y-2">
            {[
              { label: 'Breathe with me — 60s', action: 'breathe' },
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'hsl(var(--bg))' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card-base text-center max-w-md w-full">
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>⚔️ Boss Battle!</h2>
          <span className="text-6xl block mb-4">🐉</span>
          <div className="w-full h-4 rounded-full mb-2" style={{ background: 'hsl(var(--surface2))' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${bossHP}%` }}
              style={{ background: bossHP > 60 ? 'hsl(var(--danger))' : bossHP > 30 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }} />
          </div>
          <p className="stat-number text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>HP: {bossHP}/99</p>
          <button onClick={() => {
            if (bossHP <= 33) {
              setShowBoss(false);
              setSessionXP(prev => prev + 80);
            } else {
              setBossHP(prev => prev - 33);
            }
          }} className="btn-3d px-8 py-3 font-semibold">
            {bossHP <= 33 ? '🎉 Victory!' : '⚔️ Attack!'}
          </button>
          <button onClick={() => setShowBoss(false)} className="block mx-auto mt-3 text-xs"
            style={{ color: 'hsl(var(--muted))' }}>Skip boss</button>
        </motion.div>
      </div>
    );
  }

  // Quiz Done
  if (quizDone) {
    const accuracy = Math.round((totalCorrect / mockQuestions.length) * 100);
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
          <span className="text-4xl mb-3 block">🎯</span>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>Session Complete!</h2>
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
              <p className="stat-number text-2xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{totalCorrect}/{mockQuestions.length}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Correct</p>
            </div>
          </div>
          <div className="p-3 rounded-xl mb-4" style={{ background: 'hsl(var(--accent-soft))' }}>
            <p className="font-display text-sm italic" style={{ color: 'hsl(var(--text))' }}>
              {accuracy >= 80
                ? "Excellent session! Your understanding of Mechanics is getting stronger 🔥"
                : accuracy >= 50
                  ? "Good effort! You're building a solid foundation. Keep at it 💪"
                  : "You showed up and tried — that's what matters. Let's review the tricky parts 🤍"}
            </p>
          </div>
          <button onClick={() => { setCurrentQ(0); setQuizDone(false); setSessionXP(0); setTotalCorrect(0); setCorrectStreak(0); }}
            className="btn-3d px-8 py-3 font-semibold">
            Try again →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'hsl(var(--muted))' }}>← Mechanics</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              background: q.difficulty === 'hard' ? 'hsl(var(--danger) / 0.15)' : q.difficulty === 'medium' ? 'hsl(var(--warning) / 0.15)' : 'hsl(var(--success) / 0.15)',
              color: q.difficulty === 'hard' ? 'hsl(var(--danger))' : q.difficulty === 'medium' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
            }}>
            {q.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: 'hsl(var(--muted))' }}>Q{currentQ + 1}/{mockQuestions.length}</span>
          <span className="stat-number text-sm flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}>
            <Zap size={14} /> +{sessionXP} XP
          </span>
          {correctStreak >= 2 && (
            <span className="text-sm animate-flame">🔥 {correctStreak}</span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {mockQuestions.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full"
            style={{ background: i < currentQ ? 'hsl(var(--accent))' : i === currentQ ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--surface2))' }} />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div className="card-base mb-4">
            <p className="text-xs mb-2" style={{ color: 'hsl(var(--muted))' }}>{q.concept}</p>
            <h3 className="text-base font-medium mb-1" style={{ color: 'hsl(var(--text))' }}>{q.question}</h3>
            {q.hint && !showHint && !answered && (
              <button onClick={() => setShowHint(true)} className="flex items-center gap-1 text-xs mt-2"
                style={{ color: 'hsl(var(--accent))' }}>
                <HelpCircle size={12} /> Hint available
              </button>
            )}
            {showHint && (
              <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--text-secondary))' }}>
                💡 {q.hint}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = answered && i === q.correct;
              const isWrong = answered && i === selected && i !== q.correct;
              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  className="answer-tile w-full text-left text-sm font-medium flex items-center gap-3"
                  style={{
                    borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : undefined,
                    background: isCorrect ? 'hsl(var(--success) / 0.1)' : isWrong ? 'hsl(var(--danger) / 0.1)' : undefined,
                    animation: isCorrect ? 'correctBounce3D 0.5s ease forwards' : isWrong ? 'wrongShake3D 0.4s ease forwards' : undefined,
                    color: 'hsl(var(--text))',
                  }}>
                  <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono"
                    style={{
                      borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : 'hsl(var(--border))',
                    }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card-base mt-4">
              <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>{q.explanation}</p>
              <button onClick={nextQuestion} className="btn-3d text-sm mt-3 px-6 py-2">
                {currentQ < mockQuestions.length - 1 ? 'Next question →' : 'Finish quiz →'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
