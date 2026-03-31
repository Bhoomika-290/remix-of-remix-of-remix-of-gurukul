import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

const steps = [
  {
    title: 'What are you preparing for?',
    type: 'single',
    options: [
      { label: '🎯 JEE Mains + Advanced', value: 'jee' },
      { label: '🩺 NEET', value: 'neet' },
      { label: '📚 Board Exams (10th/12th)', value: 'boards' },
      { label: '💻 Engineering Degree', value: 'engineering' },
      { label: '📖 Other / Custom', value: 'other' },
    ],
  },
  {
    title: 'Pick your subjects',
    type: 'multi',
    options: [
      'Physics', 'Chemistry', 'Mathematics', 'Biology',
      'English', 'History', 'Geography', 'Economics', 'Computer Science',
    ],
  },
  {
    title: 'When do you usually study?',
    subtitle: 'Saathi will schedule reviews around your peak time',
    type: 'single',
    options: [
      { label: '🌅 Morning 6-10am', value: 'morning' },
      { label: '☀️ Afternoon 12-4pm', value: 'afternoon' },
      { label: '🌆 Evening 5-9pm', value: 'evening' },
      { label: '🌙 Night 9pm-12am', value: 'night' },
      { label: '🦉 Late night 12am+', value: 'latenight' },
      { label: '🔄 Varies', value: 'varies' },
    ],
  },
  {
    title: 'How are you feeling about studies right now?',
    type: 'single',
    options: [
      { label: '😤 Overwhelmed', value: 'overwhelmed' },
      { label: '😐 Getting by', value: 'gettingby' },
      { label: '💪 Ready to grind', value: 'ready' },
      { label: '😟 Really struggling', value: 'struggling' },
      { label: '🎯 Confident', value: 'confident' },
    ],
  },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [examType, setExamType] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [studyTime, setStudyTime] = useState('');
  const [feeling, setFeeling] = useState('');
  const navigate = useNavigate();
  const { setUser, user } = useApp();

  const handleSelect = (value: string) => {
    if (step === 0) setExamType(value);
    if (step === 2) setStudyTime(value);
    if (step === 3) setFeeling(value);
  };

  const toggleSubject = (s: string) => {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const currentSelection = step === 0 ? examType : step === 2 ? studyTime : step === 3 ? feeling : '';
  const canNext = step === 1 ? subjects.length > 0 : !!currentSelection;

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      setUser(prev => ({
        ...prev,
        examType,
        subjects,
        studyTime,
        mood: feeling,
        onboardingComplete: true,
        readinessScore: feeling === 'ready' || feeling === 'confident' ? 82 : feeling === 'gettingby' ? 65 : 45,
      }));
      navigate('/dashboard');
    }
  };

  // Final "ready" screen
  if (step === 4) return null;

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--bg))' }}>
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? 'hsl(var(--accent))' : 'hsl(var(--surface2))' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>
              {currentStep.title}
            </h2>
            {'subtitle' in currentStep && (
              <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>{currentStep.subtitle as string}</p>
            )}

            <div className={`grid gap-3 mb-8 ${currentStep.type === 'multi' ? 'grid-cols-2 sm:grid-cols-3' : ''}`}>
              {currentStep.options.map((opt, i) => {
                const value = typeof opt === 'string' ? opt : opt.value;
                const label = typeof opt === 'string' ? opt : opt.label;
                const selected = currentStep.type === 'multi'
                  ? subjects.includes(value)
                  : currentSelection === value;

                return (
                  <button
                    key={i}
                    onClick={() => currentStep.type === 'multi' ? toggleSubject(value) : handleSelect(value)}
                    className="answer-tile text-left text-sm font-medium transition-all"
                    style={{
                      borderColor: selected ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                      background: selected ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface))',
                      color: 'hsl(var(--text))',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="btn-3d-ghost px-6 py-3 text-sm font-medium">
                  ← Back
                </button>
              )}
              <button
                onClick={next}
                disabled={!canNext}
                className="btn-3d flex-1 py-3 text-sm font-semibold disabled:opacity-40"
              >
                {step === 3 ? "Let's begin →" : 'Continue →'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
