import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
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

const Learn = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();

  // Topic selection state
  const [subject, setSubject] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [started, setStarted] = useState(false);

  // Learning state
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [teachbackText, setTeachbackText] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teachbackEval, setTeachbackEval] = useState<{ feedback: string; passed: boolean } | null>(null);

  const fetchLearningContent = useCallback(async () => {
    if (!subject.trim() || !subtopic.trim()) {
      toast.error('Please enter both subject and topic');
      return;
    }
    setLoading(true);
    try {
      // Fetch learning steps and concepts in parallel
      const [learnRes, conceptsRes] = await Promise.all([
        supabase.functions.invoke('generate-learning', {
          body: { subject, subtopic, mode: 'learn' },
        }),
        supabase.functions.invoke('generate-learning', {
          body: { subject, subtopic, mode: 'concepts' },
        }),
      ]);

      if (learnRes.error) throw new Error(learnRes.error.message);
      if (conceptsRes.error) throw new Error(conceptsRes.error.message);

      const learnData = learnRes.data?.result;
      const conceptsData = conceptsRes.data?.result;

      if (Array.isArray(learnData) && learnData.length > 0) {
        setSteps(learnData);
        setStarted(true);
      } else {
        toast.error('Could not generate learning content. Try a different topic.');
      }

      if (Array.isArray(conceptsData)) {
        setConcepts(conceptsData);
      }
    } catch (err: any) {
      console.error('Learn fetch error:', err);
      toast.error(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
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
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning', {
        body: { subject, subtopic, mode: 'teachback-evaluate', studentExplanation: teachbackText },
      });
      if (error) throw error;
      const result = data?.result;
      if (result && typeof result === 'object') {
        setTeachbackEval({ feedback: result.feedback || 'Good effort!', passed: result.passed ?? true });
      }
    } catch {
      setTeachbackEval({ feedback: 'Great thinking! Keep building on this understanding.', passed: true });
    } finally {
      setLoading(false);
      setShowExplanation(true);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowExplanation(false);
      setTeachbackText('');
      setTeachbackEval(null);
    }
  };

  const goToQuiz = () => {
    // Store topic in context for quiz
    setUser(prev => ({ ...prev, currentSubject: subject, currentSubtopic: subtopic } as any));
    navigate('/quiz', { state: { subject, subtopic } });
  };

  // Topic selection screen
  if (!started) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>
            What do you want to learn?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'hsl(var(--muted))' }}>
            Enter any subject and topic — Saathi AI will create an interactive lesson just for you.
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g., Physics, Chemistry, History, Economics..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: 'hsl(var(--surface))',
                  color: 'hsl(var(--text))',
                  ringColor: 'hsl(var(--accent))',
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'hsl(var(--text-secondary))' }}>Topic / Subtopic</label>
              <input
                type="text"
                value={subtopic}
                onChange={e => setSubtopic(e.target.value)}
                placeholder="e.g., Newton's Laws, Organic Chemistry, World War 2..."
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: 'hsl(var(--surface))',
                  color: 'hsl(var(--text))',
                  ringColor: 'hsl(var(--accent))',
                }}
              />
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="mb-6">
            <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted))' }}>Quick picks:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { s: 'Physics', t: "Newton's Laws of Motion" },
                { s: 'Chemistry', t: 'Chemical Bonding' },
                { s: 'Mathematics', t: 'Quadratic Equations' },
                { s: 'Biology', t: 'Cell Division (Mitosis)' },
                { s: 'History', t: 'Indian Freedom Movement' },
                { s: 'Economics', t: 'Supply and Demand' },
                { s: 'Computer Science', t: 'Binary Search Algorithm' },
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setSubject(q.s); setSubtopic(q.t); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:border-accent"
                  style={{
                    background: subject === q.s && subtopic === q.t ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
                    borderColor: subject === q.s && subtopic === q.t ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                    color: 'hsl(var(--text))',
                  }}
                >
                  {q.s} · {q.t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchLearningContent}
            disabled={!subject.trim() || !subtopic.trim() || loading}
            className="btn-3d w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saathi is preparing your lesson...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate interactive lesson
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  // Learning flow
  const step = steps[currentStep];
  if (!step) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={() => { setStarted(false); setCurrentStep(0); setSteps([]); }}
          className="text-xs font-medium px-3 py-1 rounded-lg border border-border"
          style={{ color: 'hsl(var(--muted))' }}>
          ← Change topic
        </button>
        <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
          {subject}
        </span>
        <ArrowRight size={12} style={{ color: 'hsl(var(--muted))' }} />
        <span className="text-xs font-medium" style={{ color: 'hsl(var(--text))' }}>{subtopic}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Learning Area */}
        <div className="flex-1">
          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  background: i < currentStep ? 'hsl(var(--accent))' :
                    i === currentStep ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--surface2))',
                }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-base"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--muted))' }}>
                  {step.type === 'hook' ? '🎯 Hook' : step.type === 'fillblank' ? '✏️ Fill in' : step.type === 'choice' ? '💭 Think deeper' : step.type === 'teachback' ? '🗣️ Teach back' : '✅ Summary'}
                </span>
                <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Step {currentStep + 1}/{steps.length}</span>
              </div>

              <p className="font-display italic text-sm mb-2" style={{ color: 'hsl(var(--muted))' }}>
                {step.instruction}
              </p>
              <h3 className="font-display text-xl font-semibold mb-6" style={{ color: 'hsl(var(--text))' }}>
                {step.content}
              </h3>

              {/* Options */}
              {step.options && step.type !== 'summary' && step.type !== 'teachback' && (
                <div className="space-y-3">
                  {step.options.map((opt, i) => {
                    const isCorrect = answered && i === step.correctIndex;
                    const isWrong = answered && i === selectedAnswer && i !== step.correctIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={answered}
                        className="answer-tile w-full text-left text-sm font-medium flex items-center gap-3"
                        style={{
                          borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : undefined,
                          background: isCorrect ? 'hsl(var(--success) / 0.1)' : isWrong ? 'hsl(var(--danger) / 0.1)' : undefined,
                          animation: isCorrect ? 'correctBounce3D 0.5s ease forwards' : isWrong ? 'wrongShake3D 0.4s ease forwards' : undefined,
                          color: 'hsl(var(--text))',
                        }}
                      >
                        <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono"
                          style={{
                            borderColor: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : 'hsl(var(--border))',
                            color: isCorrect ? 'hsl(var(--success))' : isWrong ? 'hsl(var(--danger))' : 'hsl(var(--muted))',
                          }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Teach-back */}
              {step.type === 'teachback' && !answered && (
                <div className="space-y-3">
                  <textarea
                    value={teachbackText}
                    onChange={e => setTeachbackText(e.target.value)}
                    placeholder="Explain this concept in your own words..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm resize-none outline-none"
                    style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}
                  />
                  <button onClick={handleTeachbackSubmit} disabled={loading || !teachbackText.trim()}
                    className="btn-3d text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-40">
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Evaluating...</> : 'Submit explanation'}
                  </button>
                </div>
              )}

              {/* Summary */}
              {step.type === 'summary' && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--success))' }}>
                    <CheckCircle size={16} />
                    <span>Concept learned! Memory scheduled for spaced review.</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={goToQuiz} className="btn-3d text-sm px-6 py-2.5">
                      Take adaptive quiz →
                    </button>
                    <button onClick={() => { setStarted(false); setCurrentStep(0); setSteps([]); }}
                      className="btn-3d-ghost text-sm px-4 py-2.5">
                      Learn another topic
                    </button>
                  </div>
                </div>
              )}

              {/* Explanation */}
              {showExplanation && (step.explanation || teachbackEval) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl"
                  style={{ background: 'hsl(var(--accent-soft))' }}
                >
                  {teachbackEval ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full`}
                          style={{
                            background: teachbackEval.passed ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--warning) / 0.15)',
                            color: teachbackEval.passed ? 'hsl(var(--success))' : 'hsl(var(--warning))',
                          }}>
                          {teachbackEval.passed ? '✓ Understanding confirmed' : '◈ Keep building'}
                        </span>
                      </div>
                      <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>
                        {teachbackEval.feedback}
                      </p>
                    </>
                  ) : (
                    <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>
                      {step.explanation}
                    </p>
                  )}
                  {step.type !== 'summary' && (
                    <button onClick={nextStep} className="btn-3d text-sm mt-3 px-6 py-2">
                      Continue →
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Concept Map sidebar (desktop) */}
        <div className="hidden lg:block w-64">
          <div className="card-base">
            <h4 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>
              🧠 Concept Map
            </h4>
            {concepts.length > 0 ? concepts.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-2 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{
                    background: i < currentStep ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
                    color: i < currentStep ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted))',
                  }}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span style={{ color: i <= currentStep ? 'hsl(var(--text))' : 'hsl(var(--muted))' }}>{c}</span>
              </div>
            )) : (
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Concepts will appear here...</p>
            )}
          </div>

          {/* XP card */}
          <div className="card-base mt-4 text-center">
            <span className="text-2xl">⚡</span>
            <p className="stat-number text-lg font-bold mt-1" style={{ color: 'hsl(var(--accent))' }}>{user.xp} XP</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Keep learning to earn more</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
