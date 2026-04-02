import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const Social = () => {
  const { user } = useApp();
  const [joinedRoom, setJoinedRoom] = useState<number | null>(null);
  const [cheeredRooms, setCheeredRooms] = useState<number[]>([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [stuckTopics, setStuckTopics] = useState<Record<number, number>>({ 0: 23, 1: 15, 2: 8 });

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
      timer: `${10 + Math.floor(Math.random() * 30)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      stuckCount: stuckTopics[i] || 0,
    };
  });

  const handleJoin = (i: number) => {
    setJoinedRoom(i);
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

  // Simple timer
  useState(() => {
    const t = setInterval(() => {
      if (pomodoroActive && pomodoroTime > 0) {
        setPomodoroTime(prev => prev - 1);
      }
    }, 1000);
    return () => clearInterval(t);
  });

  // In a room
  if (joinedRoom !== null) {
    const room = rooms[joinedRoom];
    const mins = Math.floor(pomodoroTime / 60);
    const secs = pomodoroTime % 60;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base text-center">
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>{room.topic}</h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>{room.users + 1} students studying together</p>

          {/* Avatars */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary-foreground))' }}>
              {user.name?.[0] || 'Y'}
            </div>
            {Array.from({ length: room.users }).map((_, j) => (
              <div key={j} className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                {String.fromCharCode(65 + j)}
              </div>
            ))}
          </div>

          {/* Focus Timer */}
          <div className="mb-6">
            <p className="text-xs mb-2" style={{ color: 'hsl(var(--muted))' }}>Focus Timer</p>
            <p className="stat-number text-4xl font-bold" style={{ color: 'hsl(var(--accent))' }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
          </div>

          <div className="p-3 rounded-xl mb-4" style={{ background: 'hsl(var(--surface2))' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
              Silent co-working mode. Everyone is focused. No chat needed — just presence. 🌿
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={handleLeave} className="btn-3d-ghost text-sm px-6 py-2.5">Leave room</button>
            <button onClick={() => toast.success('Cheer sent to everyone! 🤍')} className="btn-3d text-sm px-6 py-2.5">Send cheer 🤍</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--text))' }}>Study Together</h2>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>
          Silent co-working rooms based on your subjects. No chat needed. Just presence.
        </p>

        <div className="space-y-3">
          {rooms.map((room, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }} className="card-base">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--success))' }} />
                  <span className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{room.topic}</span>
                </div>
                <span className="stat-number text-sm" style={{ color: 'hsl(var(--accent))' }}>{room.timer}</span>
              </div>
              <p className="text-xs mb-3" style={{ color: 'hsl(var(--muted))' }}>
                {room.users} students studying now
              </p>
              <div className="flex items-center gap-2 mb-3">
                {Array.from({ length: Math.min(room.users, 5) }).map((_, j) => (
                  <div key={j} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                    {String.fromCharCode(65 + j)}
                  </div>
                ))}
                {room.users > 5 && <span className="text-xs" style={{ color: 'hsl(var(--muted))' }}>+{room.users - 5}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleJoin(i)} className="btn-3d text-xs px-4 py-2">Join room</button>
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

      {/* I'm stuck too */}
      <div className="card-base text-center">
        <span className="text-2xl mb-2 block">🤝</span>
        <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'hsl(var(--text))' }}>"I'm stuck too"</h3>
        <p className="text-sm mb-3" style={{ color: 'hsl(var(--text-secondary))' }}>
          {Object.values(stuckTopics).reduce((a, b) => a + b, 0)} students got stuck on concepts today
        </p>
        <div className="space-y-2 text-left">
          {rooms.map((room, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'hsl(var(--surface2))' }}>
              <span className="text-xs" style={{ color: 'hsl(var(--text))' }}>{room.topic}</span>
              <span className="text-xs font-medium" style={{ color: 'hsl(var(--warning))' }}>{room.stuckCount} stuck</span>
            </div>
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
          <p className="text-xs mt-2" style={{ color: 'hsl(var(--muted))' }}>Weekly summary every Monday · Metric: sessions completed</p>
        </div>
      </div>
    </div>
  );
};

export default Social;
