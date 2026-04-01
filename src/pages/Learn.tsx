import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle } from 'lucide-react';

const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'History', 'Economics'];
const chapters: Record<string, string[]> = {
  Physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Modern Physics', 'Electromagnetism', 'Waves & Sound', 'Semiconductor Physics'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Electrochemistry', 'Chemical Bonding', 'Solutions'],
  Mathematics: ['Calculus', 'Algebra', 'Coordinate Geometry', 'Trigonometry', 'Probability & Statistics', 'Vectors & 3D'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Biology', 'Evolution'],
  'Computer Science': ['Data Structures', 'Algorithms', 'Python', 'Networking', 'DBMS', 'OS Concepts'],
  English: ['Grammar', 'Comprehension', 'Essay Writing', 'Literature', 'Vocabulary'],
  History: ['Ancient India', 'Medieval India', 'Modern India', 'World History', 'Indian Freedom Movement'],
  Economics: ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Statistics for Economics'],
};

interface LearningStep {
  type: 'hook' | 'fillblank' | 'choice' | 'teachback' | 'summary';
  instruction: string;
  content: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

const mockSteps: LearningStep[] = [
  {
    type: 'hook',
    instruction: 'Before we begin — what do you think?',
    content: 'A feather and a rock fall from the same height in a vacuum. Which hits the ground first?',
    options: ['Feather', 'Rock', 'Same time'],
    correctIndex: 2,
  },
  {
    type: 'fillblank',
    instruction: "Let's build the concept step by step",
    content: 'Force = mass × ___',
    options: ['velocity', 'acceleration', 'displacement'],
    correctIndex: 1,
    explanation: "Newton's Second Law: F = ma. Force is directly proportional to both mass and acceleration.",
  },
  {
    type: 'choice',
    instruction: 'What would happen if...',
    content: 'If we double the mass but want the same acceleration, what happens to the force needed?',
    options: ['Double it', 'Halve it', 'Keep it same'],
    correctIndex: 0,
    explanation: "Since F = ma, doubling m means F must double too. That's why trucks need bigger engines than bikes! 🚛",
  },
  {
    type: 'teachback',
    instruction: 'Now explain it back',
    content: "In your own words, explain why a truck needs a bigger engine than a bike to accelerate at the same rate.",
    explanation: "Great thinking! You captured the key relationship between force and mass. The more mass, the more force needed for the same acceleration.",
  },
  {
    type: 'summary',
    instruction: '✓ Newton\'s Second Law — got it!',
    content: 'F = ma',
    explanation: 'Key idea: Force equals mass times acceleration. Connected to: Carnot efficiency, energy conservation.',
  },
];

const Learn = () => {
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('Mechanics');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [teachbackText, setTeachbackText] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const step = mockSteps[currentStep];
  const completedSteps = currentStep;

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    setTimeout(() => setShowExplanation(true), 500);
  };

  const handleTeachbackSubmit = () => {
    if (!teachbackText.trim()) return;
    setAnswered(true);
    setShowExplanation(true);
  };

  const nextStep = () => {
    if (currentStep < mockSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowExplanation(false);
      setTeachbackText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <select value={subject} onChange={e => { setSubject(e.target.value); setChapter(chapters[e.target.value][0]); }}
          className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium"
          style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
        <ChevronRight size={14} style={{ color: 'hsl(var(--muted))' }} />
        <select value={chapter} onChange={e => setChapter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium"
          style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}>
          {chapters[subject]?.map(c => <option key={c}>{c}</option>)}
        </select>
        <ChevronRight size={14} style={{ color: 'hsl(var(--muted))' }} />
        <span style={{ color: 'hsl(var(--accent))' }}>Newton's Second Law</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Learning Area */}
        <div className="flex-1">
          {/* Progress */}
          <div className="flex gap-1.5 mb-6">
            {mockSteps.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                style={{ background: i < completedSteps ? 'hsl(var(--accent))' : i === completedSteps ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--surface2))' }} />
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
              <p className="font-display italic text-sm mb-2" style={{ color: 'hsl(var(--muted))' }}>
                {step.instruction}
              </p>
              <h3 className="font-display text-xl font-semibold mb-6" style={{ color: 'hsl(var(--text))' }}>
                {step.content}
              </h3>

              {/* Options */}
              {step.options && step.type !== 'summary' && (
                <div className="space-y-3">
                  {step.options.map((opt, i) => {
                    const isCorrect = answered && i === step.correctIndex;
                    const isWrong = answered && i === selectedAnswer && i !== step.correctIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
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
                    placeholder="Type your explanation here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm resize-none outline-none"
                    style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}
                  />
                  <button onClick={handleTeachbackSubmit} className="btn-3d text-sm px-6 py-2.5">
                    Submit explanation
                  </button>
                </div>
              )}

              {/* Summary */}
              {step.type === 'summary' && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'hsl(var(--success))' }}>
                    <CheckCircle size={16} />
                    <span>Memory scheduled: review in 48hrs</span>
                  </div>
                  <button onClick={() => setCurrentStep(0)} className="btn-3d text-sm px-6 py-2.5">
                    Continue to quiz →
                  </button>
                </div>
              )}

              {/* Explanation */}
              {showExplanation && step.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl"
                  style={{ background: 'hsl(var(--accent-soft))' }}
                >
                  <p className="font-display text-sm" style={{ color: 'hsl(var(--text))' }}>
                    {step.explanation}
                  </p>
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

        {/* Concept Map (desktop) */}
        <div className="hidden lg:block w-64">
          <div className="card-base">
            <h4 className="font-display text-sm font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>
              Concept Map
            </h4>
            {['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Friction', 'Momentum'].map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-2 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{
                    background: i < completedSteps ? 'hsl(var(--accent))' : 'hsl(var(--surface2))',
                    color: i < completedSteps ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted))',
                  }}>
                  {i < completedSteps ? '✓' : i + 1}
                </div>
                <span style={{ color: i <= completedSteps ? 'hsl(var(--text))' : 'hsl(var(--muted))' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
