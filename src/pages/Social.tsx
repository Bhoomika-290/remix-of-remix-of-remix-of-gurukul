import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Timer, Users, ArrowLeft } from 'lucide-react';

const Social = () => {
  const { user } = useApp();
  const [joinedRoom, setJoinedRoom] = useState<number | null>(null);
  const [cheeredRooms, setCheeredRooms] = useState<number[]>([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [stuckTopics, setStuckTopics] = useState<Record<number, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Generate more rooms — 2 per subject
  const rooms = subs.flatMap((sub, si) => {
    const topics = roomTopics[sub] || ['General Study'];
    return topics.slice(0, 3).map((topic, ti) => {
      const id = si * 10 + ti;
      return {
        id,
        topic: `${sub} — ${topic}`,
        subject: sub,
        users: 2 + Math.floor(Math.random() * 8),
        stuckCount: stuckTopics[id] || Math.floor(Math.random() * 20),
      };
    });
  });

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pomodoroActive]);

  const handleJoin = (id: number) => {
    setJoinedRoom(id);
    setPomodoroTime(25 * 60);
    setPomodoroActive(true);
    const room = rooms.find(r => r.id === id);
    toast.success(`Joined ${room?.topic || 'room'}! Focus timer started.`);
  };

  const handleCheer = (id: number) => {
    if (cheeredRooms.includes(id)) return;
    setCheeredRooms(prev => [...prev, id]);
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
    const room = rooms.find(r => r.id === joinedRoom) || rooms[0];
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

          <div className="flex justify-center gap-2 mb-8">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ring-2"
              style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary-foreground))', boxShadow: '0 0 0 2px hsl(var(--accent))' }}>
              {user.name?.[0] || 'Y'}
            </div>
            {Array.from({ length: Math.min(room.users, 6) }).map((_, j) => (
              <div key={j} className="w-11 h-11 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                {String.fromCharCode(65 + j)}
              </div>
            ))}
          </div>

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
                  {pomodoroActive ? 'Focusing...' : pomodoroTime === 0 ? 'Done!' : 'Paused'}
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
            <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>Silent co-working mode. Everyone is focused. No chat needed — just presence.</p>
          </div>

          {room.stuckCount > 0 && (
            <div className="mt-4 p-3 rounded-xl flex items-center justify-between" style={{ background: 'hsl(var(--warning) / 0.08)' }}>
              <span className="text-xs" style={{ color: 'hsl(var(--warning))' }}>{room.stuckCount} students stuck on concepts</span>
              <button onClick={() => { setStuckTopics(prev => ({ ...prev, [room.id]: (prev[room.id] || room.stuckCount) + 1 })); toast("Marked as stuck — you're not alone!"); }}
                className="text-xs font-medium px-3 py-1 rounded-lg" style={{ background: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}>
                I'm stuck too
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Group rooms by subject
  const groupedRooms = subs.map(sub => ({
    subject: sub,
    rooms: rooms.filter(r => r.subject === sub),
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--text))' }}>Study Together</h2>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>
          Silent co-working rooms based on your subjects. Join to start a 25-min focus session.
        </p>

        {groupedRooms.map((group, gi) => (
          <div key={gi} className="mb-6">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--accent))' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--accent))' }} />
              {group.subject}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.rooms.map((room) => (
                <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="card-base">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs font-semibold truncate" style={{ color: 'hsl(var(--text))' }}>{room.topic.split(' — ')[1]}</span>
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'hsl(var(--accent))' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-breathe" style={{ background: 'hsl(var(--success))' }} />
                      {room.users}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: Math.min(room.users, 4) }).map((_, j) => (
                      <div key={j} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px]"
                        style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                        {String.fromCharCode(65 + j)}
                      </div>
                    ))}
                    {room.users > 4 && <span className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>+{room.users - 4}</span>}
                  </div>

                  {room.stuckCount > 0 && (
                    <p className="text-[10px] mb-2" style={{ color: 'hsl(var(--warning))' }}>{room.stuckCount} stuck</p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleJoin(room.id)} className="btn-3d text-[10px] px-3 py-1.5">
                      <Timer size={10} className="inline mr-1" /> Join
                    </button>
                    <button onClick={() => handleCheer(room.id)}
                      className={`btn-3d-ghost text-[10px] px-2 py-1.5 ${cheeredRooms.includes(room.id) ? 'opacity-50' : ''}`}
                      disabled={cheeredRooms.includes(room.id)}>
                      {cheeredRooms.includes(room.id) ? '✓' : '🤍'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
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
