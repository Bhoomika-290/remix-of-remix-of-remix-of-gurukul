import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Timer, Users, Heart, ArrowLeft } from 'lucide-react';

const Social = () => {
  const { user } = useApp();
  const [joinedRoom, setJoinedRoom] = useState<number | null>(null);
  const [cheeredRooms, setCheeredRooms] = useState<number[]>([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [stuckTopics, setStuckTopics] = useState<Record<number, number>>({ 0: 23, 1: 15, 2: 8 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate rooms based on user's subjects
  const subs = user.subjects.length > 0 ? user.subjects : ['Physics', 'Chemistry', 'Mathematics'];
  const roomTopics: Record<string, string[]> = {
    Physics: ['Thermodynamics', 'Mechanics', 'Optics'],
    Chemistry: ['Organic Chemistry', 'Inorganic', 'Physical Chemistry'],
    Mathematics: ['Calculus', 'Algebra', 'Coordinate Geometry'],
    Biology: ['Genetics', 'Ecology', 'Cell Biology'],
    'Computer Science': ['Data Structures', 'Algorithms', 'OOP'],
    English: ['Literature', 'Grammar', 'Essay Writing'],
    History: ['Indian History', 'World History', 'Modern History'],
    Economics: ['Microeconomics', 'Macroeconomics', 'Statistics'],
    Geography: ['Physical Geography', 'Human Geography', 'Climatology'],
  };

  const rooms = subs.slice(0, 3).map((sub, i) => {
    const topics = roomTopics[sub] || ['General Study'];
    return {
      topic: `${sub} — ${topics[i % topics.length]}`,
      users: 2 + Math.floor(Math.random() * 6),
      stuckCount: stuckTopics[i] || 0,
    };
  });

  // Proper timer with useEffect
  useEffect(() => {
    if (pomodoroActive && pomodoroTime > 0) {
      timerRef.current = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            setPomodoroActive(false);
            toast.success('Focus session complete! Take a break 🎉');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomodoroActive]);

  const handleJoin = (i: number) => {
    setJoinedRoom(i);
    setPomodoroTime(25 * 60);
    setPomodoroActive(true);
    toast.success(`Joined ${rooms[i].topic} room! Focus timer started.`);
  };

  const handleCheer = (i: number) => {
    if (cheeredRooms.includes(i)) return;
    setCheeredRooms(prev => [...prev, i]);
    toast.success('Cheer sent! 🤍');
  };

  const handleLeave = () => {
    setJoinedRoom(null);
    setPomodoroActive(false);
    setPomodoroTime(25 * 60);
    toast('Left the study room');
  };

  // In a room
  if (joinedRoom !== null) {
    const room = rooms[joinedRoom];
    const mins = Math.floor(pomodoroTime / 60);
    const secs = pomodoroTime % 60;
    const progress = ((25 * 60 - pomodoroTime) / (25 * 60)) * 100;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base">
          <button onClick={handleLeave} className="flex items-center gap-1 text-xs mb-4" style={{ color: 'hsl(var(--muted))' }}>
            <ArrowLeft size={14} /> Back to rooms
          </button>

          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold mb-1" style={{ color: 'hsl(var(--text))' }}>{room.topic}</h2>
            <p className="text-sm flex items-center justify-center gap-1" style={{ color: 'hsl(var(--muted))' }}>
              <Users size={14} /> {room.users + 1} students studying together
            </p>
          </div>

          {/* Avatars */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ring-2"
              style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary-foreground))', ringColor: 'hsl(var(--accent))' }}>
              {user.name?.[0] || 'Y'}
            </div>
            {Array.from({ length: Math.min(room.users, 6) }).map((_, j) => (
              <div key={j} className="w-11 h-11 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                {String.fromCharCode(65 + j)}
              </div>
            ))}
          </div>

          {/* Focus Timer — big and animated */}
          <div className="text-center mb-6">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--surface2))" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={264} strokeDashoffset={264 - (progress / 100) * 264}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="stat-number text-4xl font-bold" style={{ color: 'hsl(var(--text))' }}>
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </p>
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted))' }}>
                  {pomodoroActive ? '📚 Focusing...' : pomodoroTime === 0 ? '🎉 Done!' : '⏸ Paused'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {pomodoroActive ? (
                <button onClick={() => setPomodoroActive(false)} className="btn-3d-ghost text-sm px-6 py-2.5">Pause</button>
              ) : pomodoroTime > 0 ? (
                <button onClick={() => setPomodoroActive(true)} className="btn-3d text-sm px-6 py-2.5">
                  <Timer size={14} className="inline mr-1" /> Resume
                </button>
              ) : (
                <button onClick={() => { setPomodoroTime(25 * 60); setPomodoroActive(true); }}
                  className="btn-3d text-sm px-6 py-2.5">Start new session</button>
              )}
              <button onClick={() => toast.success('Cheer sent to everyone! 🤍')} className="btn-3d text-sm px-6 py-2.5">
                Send cheer 🤍
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl text-center" style={{ background: 'hsl(var(--surface2))' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
              Silent co-working mode. Everyone is focused. No chat needed — just presence. 🌿
            </p>
          </div>

          {/* Stuck indicator */}
          {room.stuckCount > 0 && (
            <div className="mt-4 p-3 rounded-xl flex items-center justify-between" style={{ background: 'hsl(var(--warning) / 0.08)' }}>
              <span className="text-xs" style={{ color: 'hsl(var(--warning))' }}>🤝 {room.stuckCount} students stuck on concepts in this topic</span>
              <button onClick={() => { setStuckTopics(prev => ({ ...prev, [joinedRoom]: (prev[joinedRoom] || 0) + 1 })); toast('Marked as stuck — you\'re not alone!'); }}
                className="text-xs font-medium px-3 py-1 rounded-lg" style={{ background: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}>
                I'm stuck too
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--text))' }}>Study Together</h2>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>
          Silent co-working rooms based on your subjects. Join to start a 25-min focus session.
        </p>

        <div className="space-y-3">
          {rooms.map((room, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }} className="card-base">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-breathe" style={{ background: 'hsl(var(--success))' }} />
                  <span className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{room.topic}</span>
                </div>
                <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}>
                  <Users size={12} /> {room.users} online
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {Array.from({ length: Math.min(room.users, 5) }).map((_, j) => (
                  <div key={j} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                    {String.fromCharCode(65 + j)}
                  </div>
                ))}
                {room.users > 5 && <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>+{room.users - 5}</span>}
              </div>

              {room.stuckCount > 0 && (
                <p className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'hsl(var(--warning))' }}>
                  🤝 {room.stuckCount} students stuck on concepts
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleJoin(i)} className="btn-3d text-xs px-4 py-2">
                  <Timer size={12} className="inline mr-1" /> Join room
                </button>
                <button onClick={() => handleCheer(i)}
                  className={`btn-3d-ghost text-xs px-3 py-2 ${cheeredRooms.includes(i) ? 'opacity-50' : ''}`}
                  disabled={cheeredRooms.includes(i)}>
                  {cheeredRooms.includes(i) ? 'Cheered ✓' : 'Send cheer 🤍'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Accountability */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-3" style={{ color: 'hsl(var(--text))' }}>Accountability Pair</h3>
        <div className="card-base">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold"
              style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>A</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>Arjun K.</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>{user.examType || 'JEE'} · {subs.slice(0, 2).join(' + ')}</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>You and Arjun both completed 3 sessions this week 🔥</p>
        </div>
      </div>
    </div>
  );
};

export default Social;
