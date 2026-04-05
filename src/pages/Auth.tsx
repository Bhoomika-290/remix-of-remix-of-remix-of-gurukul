import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import gurukulLogo from '@/assets/gurukul-logo.png';

const floatingQuotes = [
  "You tried 3 times — that's real learning 💪",
  "47 students are stuck on this too",
  "Your brain needs a moment. Breathe. 🤍",
  "Consistency beats intensity, always 🌱",
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useApp();

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Load profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) {
          setUser(prev => ({
            ...prev,
            name: profile.name || email.split('@')[0],
            email,
            examType: profile.exam_type || '',
            subjects: profile.subjects || [],
            studyTime: profile.study_time || '',
            mood: profile.mood || '',
            xp: profile.xp || 0,
            streak: profile.streak || 0,
            heroLevel: profile.hero_level || 1,
            heroTitle: profile.hero_title || 'Beginner',
            burnoutScore: profile.burnout_score || 0,
            readinessScore: profile.readiness_score || 50,
            onboardingComplete: profile.onboarding_complete || false,
            isLoggedIn: true,
          }));
          navigate(profile.onboarding_complete ? '/dashboard' : '/onboarding');
        } else {
          setUser(prev => ({ ...prev, name: email.split('@')[0], email, isLoggedIn: true }));
          navigate('/onboarding');
        }
        toast.success('Welcome back!');
      } else {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success('Check your email for verification link!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--bg))' }}>
      {/* Left — Floating Quotes (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(var(--accent-soft)), hsl(var(--surface2)))' }}>
        <div className="space-y-6 max-w-sm">
          {floatingQuotes.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3, duration: 0.5 }} className="card-base">
              <p className="font-display text-sm italic" style={{ color: 'hsl(var(--text-secondary))' }}>"{q}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base w-full max-w-md">
          <div className="text-center mb-8">
            <img src={gurukulLogo} alt="Gurukul" className="w-14 h-14 object-contain mx-auto" style={{ mixBlendMode: 'multiply' }} />
            <h1 className="font-brand text-2xl font-bold mt-3 bg-gradient-to-r from-brand-teal to-brand-green bg-clip-text text-transparent">Gurukul</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted))' }}>Your study companion that understands how you feel</p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
            <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>{isLogin ? 'Sign in' : 'Create account'}</span>
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required
                className="w-full px-4 py-3 rounded-xl text-sm border border-border outline-none"
                style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" required
              className="w-full px-4 py-3 rounded-xl text-sm border border-border outline-none"
              style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password (min 6 characters)" required minLength={6}
              className="w-full px-4 py-3 rounded-xl text-sm border border-border outline-none"
              style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
            <button type="submit" disabled={loading} className="btn-3d w-full py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Please wait...</> : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: 'hsl(var(--muted))' }}>
            {isLogin ? "Don't have an account?" : "Already have one?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-semibold" style={{ color: 'hsl(var(--accent))' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          <p className="text-center text-[11px] mt-3" style={{ color: 'hsl(var(--muted))' }}>
            No spam. No ads. Just your study companion.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
