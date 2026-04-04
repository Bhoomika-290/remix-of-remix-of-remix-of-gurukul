import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
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
  const navigate = useNavigate();
  const { login, user } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || email.split('@')[0], email);
    navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
  };

  const handleGoogle = () => {
    login('Student', 'student@gmail.com');
    navigate(user.onboardingComplete ? '/dashboard' : '/onboarding');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--bg))' }}>
      {/* Left — Floating Quotes (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(var(--accent-soft)), hsl(var(--surface2)))' }}>
        <div className="space-y-6 max-w-sm">
          {floatingQuotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3, duration: 0.5 }}
              className="card-base"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              <p className="font-display text-sm italic" style={{ color: 'hsl(var(--text-secondary))' }}>"{q}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src={gurukulLogo} alt="Gurukul" className="w-14 h-14 object-contain mx-auto" />
            <h1 className="font-brand text-2xl font-bold mt-3 bg-gradient-to-r from-brand-teal to-brand-green bg-clip-text text-transparent">Gurukul</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted))' }}>Your study companion that understands how you feel</p>
          </div>

          <button onClick={handleGoogle} className="btn-3d w-full flex items-center justify-center gap-3 mb-4 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
            <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl text-sm border border-border outline-none"
                style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}
              />
            )}
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-xl text-sm border border-border outline-none"
              style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}
            />
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-xl text-sm border border-border outline-none"
              style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}
            />
            <button type="submit" className="btn-3d-ghost w-full py-3 font-semibold">
              {isLogin ? 'Sign in' : 'Create account'}
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
