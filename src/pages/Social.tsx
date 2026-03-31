import { motion } from 'framer-motion';

const rooms = [
  { topic: 'Physics — Thermodynamics', users: 4, timer: '18:42' },
  { topic: 'Chemistry — Organic', users: 2, timer: '32:10' },
  { topic: 'Mathematics — Calculus', users: 6, timer: '12:55' },
];

const Social = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--text))' }}>Study Together</h2>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>Silent co-working. No chat needed. Just presence.</p>

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
                {Array.from({ length: room.users }).map((_, j) => (
                  <div key={j} className="w-7 h-7 rounded-full" style={{ background: 'hsl(var(--accent-soft))' }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn-3d text-xs px-4 py-2">Join room</button>
                <button className="btn-3d-ghost text-xs px-3 py-2">Send cheer 🤍</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* I'm stuck too */}
      <div className="card-base text-center">
        <span className="text-2xl mb-2 block">🤝</span>
        <h3 className="font-display text-lg font-semibold mb-1" style={{ color: 'hsl(var(--text))' }}>
          "I'm stuck too"
        </h3>
        <p className="text-sm mb-3" style={{ color: 'hsl(var(--text-secondary))' }}>
          23 students got this concept wrong today
        </p>
        <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>
          8 students are stuck on Thermodynamics right now. You're not alone.
        </p>
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
              <p className="text-xs" style={{ color: 'hsl(var(--muted))' }}>JEE · Physics + Math</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
            You and Arjun both completed 3 sessions this week 🔥
          </p>
          <p className="text-xs mt-2" style={{ color: 'hsl(var(--muted))' }}>
            Weekly summary every Monday · Metric: sessions completed
          </p>
        </div>
      </div>
    </div>
  );
};

export default Social;
