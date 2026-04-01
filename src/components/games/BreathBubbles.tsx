import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bubble {
  id: number;
  x: number;
  size: number;
  speed: number;
}

const BreathBubbles = ({ onEnd }: { onEnd: () => void }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [elapsed, setElapsed] = useState(0);

  // Spawn bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => [
        ...prev.slice(-12),
        { id: Date.now(), x: 10 + Math.random() * 80, size: 30 + Math.random() * 30, speed: 4 + Math.random() * 4 },
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Breathing phase toggle
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => p === 'inhale' ? 'exhale' : 'inhale');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const popBubble = useCallback((id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setPopped(p => p + 1);
  }, []);

  return (
    <div className="card-base text-center relative overflow-hidden" style={{ minHeight: '420px' }}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-lg font-semibold" style={{ color: 'hsl(var(--text))' }}>🫧 Breath Bubbles</span>
        <span className="stat-number text-xs" style={{ color: 'hsl(var(--muted))' }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
      </div>

      {/* Breathing guide */}
      <motion.div
        animate={{ scale: phase === 'inhale' ? 1.2 : 0.9, opacity: phase === 'inhale' ? 1 : 0.6 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'hsl(var(--accent) / 0.2)' }}
      >
        <span className="font-display text-xs" style={{ color: 'hsl(var(--accent))' }}>
          {phase === 'inhale' ? 'Breathe in' : 'Breathe out'}
        </span>
      </motion.div>

      {/* Bubble area */}
      <div className="relative h-56 rounded-xl overflow-hidden" style={{ background: 'hsl(var(--surface2))' }}>
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.div
              key={b.id}
              initial={{ y: 250, x: `${b.x}%`, opacity: 0.6, scale: 0.5 }}
              animate={{ y: -60, opacity: [0.6, 0.9, 0.6], scale: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: b.speed, ease: 'linear' }}
              onClick={() => popBubble(b.id)}
              onAnimationComplete={() => setBubbles(prev => prev.filter(bb => bb.id !== b.id))}
              className="absolute cursor-pointer rounded-full"
              style={{
                width: b.size, height: b.size, left: `${b.x}%`,
                background: 'radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.4), hsl(var(--accent) / 0.15))',
                boxShadow: 'inset 0 -2px 6px hsl(var(--accent) / 0.1), inset 0 2px 4px rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <p className="text-xs mt-3" style={{ color: 'hsl(var(--muted))' }}>Tap bubbles in rhythm · {popped} popped</p>
      {elapsed >= 120 && (
        <button onClick={onEnd} className="btn-3d text-sm mt-4 px-6 py-2">Done — back to studying 🌿</button>
      )}
    </div>
  );
};

export default BreathBubbles;
