import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, BookOpen, Target, Brain, Gamepad2, Users, User, Moon, ArrowLeft } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import SaathiChatFAB from '@/components/SaathiChatFAB';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/quiz', icon: Target, label: 'Quiz' },
  { path: '/mental-health', icon: Brain, label: 'Wellness' },
  { path: '/games', icon: Gamepad2, label: 'Games' },
  { path: '/social', icon: Users, label: 'Social' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recoveryMode, setRecoveryMode } = useTheme();
  const { user } = useApp();
  const canGoBack = location.pathname !== '/dashboard';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col items-center w-16 py-6 gap-6 border-r border-border fixed h-full z-40"
        style={{ background: 'hsl(var(--surface))' }}>
        <Link to="/dashboard" className="font-display text-xl font-bold" style={{ color: 'hsl(var(--accent))' }}>स</Link>
        <div className="flex-1 flex flex-col items-center gap-2 mt-4">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} title={item.label}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative"
                style={{
                  background: active ? 'hsl(var(--accent-soft))' : 'transparent',
                  color: active ? 'hsl(var(--accent))' : 'hsl(var(--muted))',
                }}>
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: 'hsl(var(--accent))' }} />}
                <item.icon size={20} />
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-4">
          <button onClick={() => setRecoveryMode(!recoveryMode)} title="Recovery Mode"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: recoveryMode ? 'hsl(var(--accent-soft))' : 'transparent', color: recoveryMode ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>
            <Moon size={18} />
          </button>
          <ThemeSwitcher />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 z-40"
        style={{ background: 'hsl(var(--surface))' }}>
        <div className="flex items-center gap-2">
          {canGoBack && (
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'hsl(var(--muted))' }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <Link to="/dashboard" className="font-display text-lg font-bold flex items-center gap-2" style={{ color: 'hsl(var(--accent))' }}>
            <span className="text-xl">स</span> Gurukul
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm flex items-center gap-1">
            <span className="animate-flame inline-block">🔥</span>
            <span className="stat-number">{user.streak}</span>
          </span>
          <ThemeSwitcher />
          <Link to="/profile" className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
            {user.name?.[0] || '?'}
          </Link>
        </div>
      </header>

      <main className="flex-1 lg:ml-16 pb-20 lg:pb-0">
        {/* Desktop back button */}
        {canGoBack && (
          <div className="hidden lg:block px-6 pt-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border transition-all hover:border-accent"
              style={{ color: 'hsl(var(--muted))' }}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        )}
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 border-t border-border z-40"
        style={{ background: 'hsl(var(--surface))' }}>
        {navItems.slice(0, 5).map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path}
              className="flex flex-col items-center gap-0.5 p-1 transition-colors"
              style={{ color: active ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && <div className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: 'hsl(var(--accent))' }} />}
            </Link>
          );
        })}
      </nav>

      <SaathiChatFAB />
    </div>
  );
};

export default AppLayout;
