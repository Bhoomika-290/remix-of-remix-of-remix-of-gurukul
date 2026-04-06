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
  const { setUser } = useApp();

  // Check if already logged in
  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || !active) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', session.user.id)
        .maybeSingle();

      if (active) {
        navigate(profile?.onboarding_complete ? '/dashboard' : '/onboarding', { replace: true });
      }
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        // Load profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
        if (profile) {
          setUser(prev => ({
            ...prev,
            name: profile.name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
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
          navigate(profile.onboarding_complete ? '/dashboard' : '/onboarding', { replace: true });
        } else {
          setUser(prev => ({ ...prev, name: normalizedEmail.split('@')[0], email: normalizedEmail, isLoggedIn: true }));
          navigate('/onboarding', { replace: true });
        }
        toast.success('Welcome back!');
      } else {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
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
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'hsl(var(--bg))' }}>
      <div className="lg:hidden px-4 pt-6 pb-2">
        <div className="flex items-center gap-4 rounded-[28px] border p-4" style={{ background: 'hsl(var(--accent-soft))', borderColor: 'hsl(var(--border))' }}>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
            <img src={gurukulLogo} alt="Gurukul" className="h-10 w-10 object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-brand text-xl font-bold leading-tight bg-gradient-to-r from-brand-teal to-brand-green bg-clip-text text-transparent">Gurukul</h1>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted))' }}>A calm study companion that adapts to your pace.</p>
          </div>
        </div>
      </div>

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
      <div className="flex-1 flex items-center justify-center p-4 pb-8 sm:p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base w-full max-w-md rounded-[28px]">
          <div className="text-center mb-8 hidden lg:block">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border" style={{ background: 'hsl(var(--surface2))', borderColor: 'hsl(var(--border))' }}>
              <img src={gurukulLogo} alt="Gurukul" className="w-10 h-10 object-contain" />
            </div>
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
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-semibold" style={{ color: 'hsl(var(--accent))' }}>
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
