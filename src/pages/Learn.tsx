import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Sparkles, ArrowRight, BookOpen, AlertTriangle, Target, PenLine, MessageCircle, Mic, ClipboardCheck, Brain, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LearningStep {
  type: 'hook' | 'fillblank' | 'choice' | 'teachback' | 'summary';
  instruction: string;
  content: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

interface LearnHistory {
  subject: string;
  subtopic: string;
  step: number;
  completed: boolean;
  timestamp: number;
}

const TIMEOUT_MS = 30000;

const Learn = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [started, setStarted] = useState(false);
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [teachbackText, setTeachbackText] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachbackEval, setTeachbackEval] = useState<{ feedback: string; passed: boolean } | null>(null);
  const requestIdRef = useRef(0);

  const [history, setHistory] = useState<LearnHistory[]>(() => {
    try { return JSON.parse(localStorage.getItem('saathi-learn-history') || '[]'); } catch { return []; }
  });

  const getQuickPicks = () => {
    const picks: { s: string; t: string }[] = [];
    const subjectTopics: Record<string, string[]> = {
      Physics: ["Newton's Laws of Motion", 'Thermodynamics', 'Electrostatics', 'Optics', 'Waves'],
      Chemistry: ['Chemical Bonding', 'Organic Reactions', 'Periodic Table', 'Equilibrium', 'Electrochemistry'],
      Mathematics: ['Quadratic Equations', 'Calculus - Limits', 'Probability', 'Trigonometry', 'Matrices'],
      Biology: ['Cell Division (Mitosis)', 'Genetics & DNA', 'Ecology', 'Human Physiology', 'Plant Biology'],
      'Computer Science': ['Binary Search Algorithm', 'Data Structures - Arrays', 'OOP Concepts', 'SQL Basics', 'Recursion'],
      English: ['Grammar - Tenses', 'Poetry Analysis', 'Essay Writing', 'Comprehension', 'Vocabulary'],
      History: ['Indian Freedom Movement', 'World War II', 'Mughal Empire', 'French Revolution', 'Ancient India'],
      Economics: ['Supply and Demand', 'GDP & National Income', 'Money & Banking', 'Inflation', 'Indian Economy'],
      Geography: ['Monsoons', 'Rivers of India', 'Map Reading', 'Climatology', 'Human Geography'],
    };
    const subs = user.subjects.length > 0 ? user.subjects : ['Physics', 'Chemistry', 'Mathematics'];
    subs.forEach(sub => {
      const topics = subjectTopics[sub] || subjectTopics['Physics'];
      topics.slice(0, 2).forEach(t => picks.push({ s: sub, t }));
    });
    return picks.slice(0, 8);
  };

  const saveHistory = (sub: string, topic: string, step: number, completed: boolean) => {
    const entry: LearnHistory = { subject: sub, subtopic: topic, step, completed, timestamp: Date.now() };
    const updated = [...history.filter(h => !(h.subject === sub && h.subtopic === topic)), entry];
    setHistory(updated);
    localStorage.setItem('saathi-learn-history', JSON.stringify(updated));
  };

  const fetchWithTimeout = async (body: any, requestId: number): Promise<any> => {
    const invokePromise = supabase.functions.invoke('generate-learning', { body }).then(({ data, error }) => {
      if (error) throw new Error(error.message);
      return data;
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), TIMEOUT_MS);
    });

    const result = await Promise.race([invokePromise, timeoutPromise]);

    if (requestId !== requestIdRef.current) {
      throw new Error('STALE_REQUEST');
    }

    return result;
  };

  const fetchLearningContent = useCallback(async () => {
    if (!subject.trim() || !subtopic.trim()) {
      toast.error('Please enter both subject and topic');
      return;
    }
    setLoading(true);
    setError(null);
    const requestId = ++requestIdRef.current;

    try {
      const [learnData, conceptsData] = await Promise.all([
        fetchWithTimeout({ subject, subtopic, mode: 'learn' }, requestId),
        fetchWithTimeout({ subject, subtopic, mode: 'concepts' }, requestId),
      ]);

      const learnResult = learnData?.result;
      const conceptsResult = conceptsData?.result;

      if (Array.isArray(learnResult) && learnResult.length > 0) {
        // Validate each step has required fields
        const validSteps = learnResult.map((s: any, i: number) => ({
          type: s.type || ['hook', 'fillblank', 'choice', 'teachback', 'summary'][i] || 'choice',
          instruction: s.instruction || 'Think about this...',
          content: s.content || s.question || 'Question not available',
          options: Array.isArray(s.options) ? s.options : undefined,
          correctIndex: typeof s.correctIndex === 'number' ? s.correctIndex : 0,
          explanation: s.explanation || (Array.isArray(s.options) && s.options.length > 0
            ? `The key idea here is: ${s.options[typeof s.correctIndex === 'number' ? s.correctIndex : 0] || 'focus on the highlighted answer'}.`
            : 'Nice progress — keep building your understanding.'),
        }));
        setSteps(validSteps);
        setStarted(true);
        saveHistory(subject, subtopic, 0, false);
      } else {
        setError('Could not generate learning content. Please try a different topic or try again.');
      }
      if (Array.isArray(conceptsResult)) setConcepts(conceptsResult);
    } catch (err: any) {
      if (err.message === 'STALE_REQUEST') {
        return;
      }

      if (err.message === 'REQUEST_TIMEOUT') {
        setError('Request timed out. The AI is taking too long — please try again.');
      } else {
        setError(err.message || 'Failed to generate content. Please try again.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [subject, subtopic]);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    setTimeout(() => setShowExplanation(true), 500);
  };

  const handleTeachbackSubmit = async () => {
    if (!teachbackText.trim()) return;
    setAnswered(true);
    setLoading(true);
    const requestId = ++requestIdRef.current;
    try {
      const data = await fetchWithTimeout({ subject, subtopic, mode: 'teachback-evaluate', studentExplanation: teachbackText }, requestId);
      const result = data?.result;
      if (result && typeof result === 'object') {
        setTeachbackEval({ feedback: result.feedback || 'Good effort!', passed: result.passed ?? true });
      } else {
        setTeachbackEval({ feedback: 'Great thinking! Keep building on this understanding.', passed: true });
      }
    } catch (err: any) {
      if (err.message === 'STALE_REQUEST') return;
      setTeachbackEval({ feedback: 'Great thinking! Keep building on this understanding.', passed: true });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setShowExplanation(true);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowExplanation(false);
      setTeachbackText('');
      setTeachbackEval(null);
      saveHistory(subject, subtopic, next, false);
    }
  };

  const goToQuiz = () => {
    saveHistory(subject, subtopic, steps.length - 1, true);
    setUser(prev => ({ ...prev, currentSubject: subject, currentSubtopic: subtopic } as any));
    navigate('/quiz', { state: { subject, subtopic } });
  };

  const resetLesson = () => {
    requestIdRef.current += 1;
    setStarted(false);
    setCurrentStep(0);
    setSteps([]);
    setConcepts([]);
    setSelectedAnswer(null);
    setAnswered(false);
    setShowExplanation(false);
    setTeachbackText('');
    setTeachbackEval(null);
    setError(null);
    setLoading(false);
  };

  const incompleteLessons = history.filter(h => !h.completed);

  // Topic selection screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>What do you want to learn?</h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>
            Enter any subject and topic — Saathi AI will create an interactive lesson just for you.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl flex items-start gap-2" style={{ background: 'hsl(var(--danger) / 0.1)', border: '1px solid hsl(var(--danger) / 0.3)' }}>
              <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: 'hsl(var(--danger))' }} />
              <div>
                <p className="text-sm" style={{ color: 'hsl(var(--danger))' }}>{error}</p>
                <button onClick={() => { setError(null); fetchLearningContent(); }} className="text-xs font-medium mt-1 underline" style={{ color: 'hsl(var(--accent))' }}>Try again</button>
              </div>
            </div>
          )}

          {incompleteLessons.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}>
                <BookOpen size={12} /> Continue where you left off
              </p>
              <div className="space-y-2">
                {incompleteLessons.slice(-3).map((h, i) => (
                  <button key={i} onClick={() => { setSubject(h.subject); setSubtopic(h.subtopic); }}
                    className="w-full text-left p-3 rounded-xl border transition-all hover:border-accent flex items-center justify-between"
                    style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--text))' }}>
                    <div>
                      <span className="text-sm font-medium">{h.subject} · {h.subtopic}</span>
                      <span className="text-xs block" style={{ color: 'hsl(var(--muted))' }}>Step {h.step + 1}/5</span>
                    </div>
                    <ArrowRight size={14} style={{ color: 'hsl(var(--accent))' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="e.g., Physics, Chemistry, History, Economics..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none transition-all focus:ring-2"
                style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Topic / Subtopic</label>
              <input type="text" value={subtopic} onChange={e => setSubtopic(e.target.value)}
                placeholder="e.g., Newton's Laws, Organic Chemistry, World War 2..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none transition-all focus:ring-2"
                style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted))' }}>
              Based on your stream ({user.subjects.join(', ') || 'General'}):
            </p>
            <div className="flex flex-wrap gap-2">
              {getQuickPicks().map((q, i) => (
                <button key={i} onClick={() => { setSubject(q.s); setSubtopic(q.t); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:border-accent"
                  style={{
                    background: subject === q.s && subtopic === q.t ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
                    borderColor: subject === q.s && subtopic === q.t ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                    color: 'hsl(var(--text))',
                  }}>
                  {q.s} · {q.t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={fetchLearningContent} disabled={!subject.trim() || !subtopic.trim() || loading}
            className="btn-3d w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saathi is preparing your lesson...</> : <><Sparkles size={16} /> Generate interactive lesson</>}
          </button>
        </motion.div>
      </div>
    );
  }

  // Learning flow
  const step = steps[currentStep];
  if (!step) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: 'hsl(var(--warning))' }} />
        <p className="text-sm mb-4" style={{ color: 'hsl(var(--text))' }}>Something went wrong loading this step.</p>
        <button onClick={resetLesson} className="btn-3d text-sm px-6 py-2.5">← Back to topic selection</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={resetLesson}
          className="text-xs font-medium px-3 py-1 rounded-lg border border-border" style={{ color: 'hsl(var(--muted))' }}>← Change topic</button>
        <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>{subject}</span>
        <ArrowRight size={12} style={{ color: 'hsl(var(--muted))' }} />
        <span className="text-xs font-medium" style={{ color: 'hsl(var(--text))' }}>{subtopic}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{
                background: i < currentStep ? 'hsl(var(--accent))' : i === currentStep ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--surface2))',
              }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-base">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--muted))' }}>
                  <span className="inline-flex items-center gap-1">{step.type === 'hook' ? <><Target size={10} /> Hook</> : step.type === 'fillblank' ? <><PenLine size={10} /> Fill in</> : step.type === 'choice' ? <><MessageCircle size={10} /> Think deeper</> : step.type === 'teachback' ? <><Mic size={10} /> Teach back</> : <><ClipboardCheck size={10} /> Summary</>}</span>
                </span>
                <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Step {currentStep + 1}/{steps.length}</span>
              </div>

              <p className="font-display italic text-sm mb-2" style={{ color: 'hsl(var(--muted))' }}>{step.instruction}</p>
              <h3 className="font-display text-xl font-semibold mb-6" style={{ color: 'hsl(var(--text))' }}>{step.content}</h3>

              {step.options && step.type !== 'summary' && step.type !== 'teachback' && (
                <div className="space-y-3">
                  {step.options.map((opt, i) => {
                    const isCorrect = answered && i === step.correctIndex;
                    const isWrong = answered && i === selectedAnswer && i !== step.correctIndex;
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                        className="answer-tile w-full text-left text-sm font-medium flex items-center gap-3"
                        style={{
                          borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : undefined,
                          background: isCorrect ? 'hsl(var(--success) / 0.1)' : isWrong ? 'hsl(var(--danger) / 0.1)' : undefined,
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
              )}

              {step.type === 'teachback' && !answered && (
                <div className="space-y-3">
                  <textarea value={teachbackText} onChange={e => setTeachbackText(e.target.value)}
                    placeholder="Explain this concept in your own words..." rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm resize-none outline-none"
                    style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
                  <button onClick={handleTeachbackSubmit} disabled={loading || !teachbackText.trim()}
                    className="btn-3d text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-40">
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Evaluating...</> : 'Submit explanation'}
                  </button>
                </div>
              )}

              {step.type === 'summary' && (
                <div className="space-y-3 mt-4">
                  {step.explanation && (
                    <div className="p-4 rounded-xl mb-3" style={{ background: 'hsl(var(--accent-soft))' }}>
                      <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}><ClipboardCheck size={12} /> Concept Summary</p>
                      <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>{step.explanation}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--success))' }}>
                    <CheckCircle size={16} />
                    <span>Concept learned! Memory scheduled for spaced review.</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={goToQuiz} className="btn-3d text-sm px-6 py-2.5">Take adaptive quiz →</button>
                    <button onClick={resetLesson} className="btn-3d-ghost text-sm px-4 py-2.5">Learn another topic</button>
                  </div>
                </div>
              )}

              {showExplanation && (step.options || step.type === 'teachback') && step.type !== 'summary' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl" style={{ background: 'hsl(var(--accent-soft))' }}>
                  {teachbackEval ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                          background: teachbackEval.passed ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--warning) / 0.15)',
                          color: teachbackEval.passed ? 'hsl(var(--success))' : 'hsl(var(--warning))',
                        }}>{teachbackEval.passed ? '✓ Understanding confirmed' : '◈ Keep building'}</span>
                      </div>
                      <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>{teachbackEval.feedback}</p>
                    </>
                  ) : (
                    <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>{step.explanation || 'Nice try — review the idea and keep going.'}</p>
                  )}
                  <button onClick={nextStep} className="btn-3d text-sm mt-3 px-6 py-2">Continue →</button>
                </motion.div>
              )}

              {/* Auto-advance for steps without options (non-teachback, non-summary) that need manual next */}
              {!step.options && step.type !== 'teachback' && step.type !== 'summary' && (
                <div className="mt-4">
                  {step.explanation && (
                    <div className="p-4 rounded-xl mb-3" style={{ background: 'hsl(var(--accent-soft))' }}>
                      <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>{step.explanation}</p>
                    </div>
                  )}
                  <button onClick={nextStep} className="btn-3d text-sm px-6 py-2">Continue →</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Concept Map sidebar */}
        <div className="hidden lg:block w-64">
          <div className="card-base">
            <h4 className="font-display text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}><Brain size={14} style={{ color: 'hsl(var(--accent))' }} /> Concept Map</h4>
            {concepts.length > 0 ? concepts.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-2 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{
                  background: i < currentStep ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
                  color: i < currentStep ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted))',
                }}>{i < currentStep ? '✓' : i + 1}</div>
                <span style={{ color: i <= currentStep ? 'hsl(var(--text))' : 'hsl(var(--muted))' }}>{c}</span>
              </div>
            )) : (
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Concepts will appear here...</p>
            )}
          </div>

          <div className="card-base mt-4 text-center">
            <Zap size={24} style={{ color: 'hsl(var(--accent))' }} />
            <p className="stat-number text-lg font-bold mt-1" style={{ color: 'hsl(var(--accent))' }}>{user.xp} XP</p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Keep learning to level up</p>
          </div>
        </div>
      </div>

      <div className="lg:hidden mt-4">
        <div className="card-base">
          <h4 className="font-display text-sm font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'hsl(var(--text))' }}><Brain size={14} style={{ color: 'hsl(var(--accent))' }} /> Concept Map</h4>
          {concepts.length > 0 ? concepts.map((c, i) => (
            <div key={i} className="flex items-center gap-2 py-2 text-sm">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{
                background: i < currentStep ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
                color: i < currentStep ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted))',
              }}>{i < currentStep ? '✓' : i + 1}</div>
              <span style={{ color: i <= currentStep ? 'hsl(var(--text))' : 'hsl(var(--muted))' }}>{c}</span>
            </div>
          )) : (
            <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Concepts will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learn;
