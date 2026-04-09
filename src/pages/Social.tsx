import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Timer, Users, ArrowLeft, Search, Plus, Trophy, Clock, Zap, Heart, AlertCircle, TrendingUp, Loader2, Flame } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

const Social = () => {
  const { user } = useApp();
  const { recoveryMode } = useTheme();
  const [joinedRoom, setJoinedRoom] = useState<number | null>(null);
  const [cheeredRooms, setCheeredRooms] = useState<number[]>([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [stuckTopics, setStuckTopics] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'trending'>('all');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'week' | 'month' | 'all'>('all');
  const [userRank, setUserRank] = useState<number | null>(null);

  const subs = user.subjects.length > 0 ? user.subjects : ['Physics', 'Chemistry', 'Mathematics'];

  const roomTopics: Record<string, string[]> = {
    Physics: ['Thermodynamics', 'Mechanics', 'Optics', 'Electrostatics', 'Modern Physics'],
    Chemistry: ['Organic Chemistry', 'Inorganic', 'Physical Chemistry', 'Chemical Bonding', 'Electrochemistry'],
    Mathematics: ['Calculus', 'Algebra', 'Coordinate Geometry', 'Trigonometry', 'Probability'],
    Biology: ['Genetics', 'Ecology', 'Cell Biology', 'Human Physiology', 'Plant Biology'],
    'Computer Science': ['Data Structures', 'Algorithms', 'OOP', 'SQL & Databases', 'Web Dev'],
    English: ['Literature', 'Grammar', 'Essay Writing', 'Poetry', 'Comprehension'],
    History: ['Indian History', 'World History', 'Modern History', 'Ancient India', 'Medieval India'],
    Economics: ['Microeconomics', 'Macroeconomics', 'Statistics', 'Indian Economy', 'Banking'],
    Geography: ['Physical Geography', 'Human Geography', 'Climatology', 'Map Work', 'Resources'],
  };

  const allRooms = subs.flatMap((sub, si) => {
    const topics = roomTopics[sub] || ['General Study'];
    return topics.slice(0, 4).map((topic, ti) => {
      const id = si * 100 + ti;
      const u = 2 + Math.floor(Math.random() * 12);
      const timeLeft = 5 + Math.floor(Math.random() * 20);
      return {
        id, topic, subject: sub, users: u,
        stuckCount: stuckTopics[id] || Math.floor(Math.random() * 25),
        focusing: Math.ceil(u * 0.7), onBreak: Math.floor(u * 0.3),
        timeRemaining: `${timeLeft}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      };
    });
  });

  const filteredRooms = allRooms.filter(r => {
    if (searchQuery) return r.topic.toLowerCase().includes(searchQuery.toLowerCase()) || r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'mine') return subs.includes(r.subject);
    if (activeTab === 'trending') return r.users > 5;
    return true;
  });

  // Load leaderboard from real profiles
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, name, xp, streak')
          .order('xp', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (!profiles || profiles.length === 0) {
          setLeaderboard([]);
          setUserRank(null);
          setLeaderboardLoading(false);
          return;
        }

        const entries: LeaderboardEntry[] = profiles.map(p => ({
          name: p.name || 'Student',
          xp: p.xp || 0,
          streak: p.streak || 0,
          isCurrentUser: p.id === currentUserId,
        }));

        // Show ALL users including 0 XP so new signups appear
        const activeEntries = entries;
        setLeaderboard(activeEntries);

        const rank = activeEntries.findIndex(e => e.isCurrentUser);
        setUserRank(rank >= 0 ? rank + 1 : null);
      } catch {
        setLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    loadLeaderboard();
  }, [leaderboardFilter]);

  useEffect(() => {
    if (pomodoroActive && pomodoroTime > 0) {
      timerRef.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) { setPomodoroActive(false); toast.success('Focus session complete!'); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pomodoroActive, pomodoroTime]);

  const handleJoin = (id: number) => { setJoinedRoom(id); setPomodoroTime(25 * 60); setPomodoroActive(true); toast.success('Joined room! Timer started.'); };
  const handleCheer = (id: number) => { if (cheeredRooms.includes(id)) return; setCheeredRooms(prev => [...prev, id]); toast.success('Cheer sent!'); };
  const handleLeave = () => { setJoinedRoom(null); setPomodoroActive(false); setPomodoroTime(25 * 60); if (timerRef.current) clearInterval(timerRef.current); toast('Left room'); };

  // In-room view
  if (joinedRoom !== null) {
    const room = allRooms.find(r => r.id === joinedRoom) || allRooms[0];
    const mins = Math.floor(pomodoroTime / 60);
    const secs = pomodoroTime % 60;
    const progress = ((25 * 60 - pomodoroTime) / (25 * 60)) * 100;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base">
          <button onClick={handleLeave} className="flex items-center gap-1 text-xs mb-4" style={{ color: 'hsl(var(--muted))' }}><ArrowLeft size={14} /> Back to rooms</button>
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold mb-1" style={{ color: 'hsl(var(--text))' }}>{room.subject} — {room.topic}</h2>
            <p className="text-sm flex items-center justify-center gap-1" style={{ color: 'hsl(var(--muted))' }}><Users size={14} /> {room.users + 1} students · {room.focusing} focusing</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ring-2" style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary-foreground))', boxShadow: '0 0 0 2px hsl(var(--accent))' }}>{user.name?.[0] || 'Y'}</div>
            {Array.from({ length: Math.min(room.users, 6) }).map((_, j) => (
              <div key={j} className="w-11 h-11 rounded-full flex items-center justify-center text-sm relative" style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                {String.fromCharCode(65 + j)}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: 'hsl(var(--success))', borderColor: 'hsl(var(--surface))' }} />
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--surface2))" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={264} strokeDashoffset={264 - (progress / 100) * 264} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="stat-number text-4xl font-bold" style={{ color: 'hsl(var(--text))' }}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</p>
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted))' }}>{pomodoroActive ? 'Focusing...' : pomodoroTime === 0 ? 'Done!' : 'Paused'}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              {pomodoroActive ? (
                <button onClick={() => setPomodoroActive(false)} className="btn-3d-ghost text-sm px-6 py-2.5">Pause</button>
              ) : pomodoroTime > 0 ? (
                <button onClick={() => setPomodoroActive(true)} className="btn-3d text-sm px-6 py-2.5"><Timer size={14} className="inline mr-1" /> Resume</button>
              ) : (
                <button onClick={() => { setPomodoroTime(25 * 60); setPomodoroActive(true); }} className="btn-3d text-sm px-6 py-2.5">New session</button>
              )}
              <button onClick={() => toast.success('Cheer sent!')} className="btn-3d text-sm px-6 py-2.5"><Heart size={14} className="inline mr-1" /> Cheer</button>
            </div>
          </div>

          {room.stuckCount > 0 && (
            <div className="mt-4 p-3 rounded-xl flex items-center justify-between" style={{ background: 'hsl(var(--warning) / 0.08)' }}>
              <span className="text-xs" style={{ color: 'hsl(var(--warning))' }}><AlertCircle size={12} className="inline mr-1" />{room.stuckCount} students stuck</span>
              <button onClick={() => { setStuckTopics(prev => ({ ...prev, [room.id]: (prev[room.id] || room.stuckCount) + 1 })); toast("Marked as stuck — you're not alone!"); }}
                className="text-xs font-medium px-3 py-1 rounded-lg" style={{ background: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}>I'm stuck too</button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      <div>
        <h2 className="font-display text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}><Users size={24} style={{ color: 'hsl(var(--accent))' }} /> Study Together</h2>
        <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>Silent co-working rooms. Join to start a 25-min focus session with peers.</p>

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted))' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search rooms by subject or topic..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm outline-none" style={{ background: 'hsl(var(--surface))', color: 'hsl(var(--text))' }} />
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
            {(['all', 'mine', 'trending'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                style={{ background: activeTab === tab ? 'hsl(var(--surface))' : 'transparent', color: activeTab === tab ? 'hsl(var(--text))' : 'hsl(var(--muted))' }}>{tab === 'mine' ? 'My Subjects' : tab}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Clock size={18} />, value: '12h', label: 'Co-study this week', color: 'hsl(var(--accent))' },
          { icon: <Users size={18} />, value: '8', label: 'Sessions joined', color: 'hsl(var(--success))' },
          { icon: <Heart size={18} />, value: '24', label: 'Cheers sent', color: 'hsl(var(--warning))' },
          { icon: <TrendingUp size={18} />, value: '3', label: 'People studied with', color: 'hsl(var(--accent))' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card-base text-center py-3">
            <div className="flex justify-center mb-1.5" style={{ color: s.color }}>{s.icon}</div>
            <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--text))' }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="card-base overflow-hidden" style={{ borderLeft: `3px solid hsl(var(--accent))` }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'hsl(var(--accent))' }}>{room.subject}</p>
                <h3 className="font-display text-base font-semibold" style={{ color: 'hsl(var(--text))' }}>{room.topic}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--success))' }} />
                <span className="text-xs font-medium" style={{ color: 'hsl(var(--success))' }}>{room.users} active</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              {Array.from({ length: Math.min(room.users, 5) }).map((_, j) => (
                <div key={j} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium relative"
                  style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                  {String.fromCharCode(65 + j)}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: 'hsl(var(--success))', borderColor: 'hsl(var(--surface))' }} />
                </div>
              ))}
              {room.users > 5 && <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>+{room.users - 5}</span>}
            </div>

            <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: 'hsl(var(--muted))' }}>
              <span><Timer size={12} className="inline mr-1" />{room.timeRemaining} remaining</span>
              <span>{room.focusing} focusing, {room.onBreak} on break</span>
            </div>

            {room.stuckCount > 0 && (
              <p className="text-xs mb-3" style={{ color: 'hsl(var(--warning))' }}><AlertCircle size={12} className="inline mr-1" />{room.stuckCount} students stuck on concepts</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleJoin(room.id)} className="btn-3d flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5">
                <Timer size={14} /> Join Room
              </button>
              <button onClick={() => handleCheer(room.id)} disabled={cheeredRooms.includes(room.id)}
                className={`btn-3d-ghost text-xs px-4 py-2.5 ${cheeredRooms.includes(room.id) ? 'opacity-50' : ''}`}>
                {cheeredRooms.includes(room.id) ? <><Heart size={12} /> Cheered</> : <><Heart size={12} /> Cheer</>}
              </button>
            </div>
          </motion.div>
        ))}

        {/* Create Room Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card-base flex flex-col items-center justify-center py-12 cursor-pointer hover:scale-[1.02] transition-transform border-2 border-dashed"
          style={{ borderColor: 'hsl(var(--border))' }} onClick={() => toast('Room creation coming soon!')}>
          <Plus size={32} style={{ color: 'hsl(var(--muted))' }} />
          <p className="font-display text-sm font-semibold mt-2" style={{ color: 'hsl(var(--text))' }}>Create Room</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Start a study session</p>
        </motion.div>
      </div>

      {/* Accountability + Leaderboard */}
      {!recoveryMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-base">
            <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
              <Heart size={18} style={{ color: 'hsl(var(--accent))' }} /> Accountability Pair
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-display font-bold"
                style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>{user.name?.[0] || 'Y'}</div>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'hsl(var(--muted))' }}>
                  <span>3 sessions</span> <span>·</span> <span className="flex items-center gap-0.5"><Flame size={10} /> {user.streak}</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-display font-bold"
                style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>?</div>
            </div>
            <p className="text-sm text-center" style={{ color: 'hsl(var(--muted))' }}>Find an accountability partner by joining study rooms!</p>
            <button className="btn-3d-ghost w-full text-xs py-2 mt-3" onClick={() => toast('Join a study room to pair up!')}>Find partner</button>
          </div>

          <div className="card-base">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-semibold flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
                <Trophy size={18} style={{ color: 'hsl(var(--warning))' }} /> Leaderboard
              </h3>
              <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
                {(['week', 'month', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setLeaderboardFilter(f)}
                    className="px-2 py-1 rounded text-[10px] font-medium transition-all capitalize"
                    style={{
                      background: leaderboardFilter === f ? 'hsl(var(--surface))' : 'transparent',
                      color: leaderboardFilter === f ? 'hsl(var(--text))' : 'hsl(var(--muted))',
                    }}>
                    {f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {leaderboardLoading ? (
              <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin" style={{ color: 'hsl(var(--accent))' }} /></div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-6">
                <Trophy size={24} className="mx-auto mb-2" style={{ color: 'hsl(var(--muted))' }} />
                <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>No rankings yet — be the first to take a quiz!</p>
              </div>
            ) : (
              <>
                {leaderboard.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg" style={{ background: p.isCurrentUser ? 'hsl(var(--accent-soft))' : 'transparent' }}>
                    <span className="w-5 text-center stat-number text-xs" style={{ color: i === 0 ? 'hsl(var(--warning))' : 'hsl(var(--muted))' }}>
                      {i === 0 ? <Trophy size={14} className="text-yellow-500" /> : i === 1 ? <Trophy size={14} className="text-gray-400" /> : i === 2 ? <Trophy size={14} className="text-amber-700" /> : `#${i + 1}`}
                    </span>
                    <span className="flex-1 text-sm" style={{ color: 'hsl(var(--text))' }}>
                      {p.isCurrentUser ? `${p.name} (You)` : p.name}
                    </span>
                    <span className="stat-number text-xs" style={{ color: 'hsl(var(--accent))' }}>{p.xp} XP</span>
                  </div>
                ))}
                {userRank && userRank > 5 && (
                  <div className="mt-2 pt-2" style={{ borderTop: '1px dashed hsl(var(--border))' }}>
                    <div className="flex items-center gap-3 py-2 px-2 rounded-lg" style={{ background: 'hsl(var(--accent-soft))' }}>
                      <span className="w-5 text-center stat-number text-xs" style={{ color: 'hsl(var(--muted))' }}>#{userRank}</span>
                      <span className="flex-1 text-sm" style={{ color: 'hsl(var(--text))' }}>{user.name || 'You'} (You)</span>
                      <span className="stat-number text-xs" style={{ color: 'hsl(var(--accent))' }}>{user.xp} XP</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
