import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wind, Sprout, Layers, Type } from 'lucide-react';
import BreathBubbles from '@/components/games/BreathBubbles';
import MemoryGarden from '@/components/games/MemoryGarden';
import ZenTiles from '@/components/games/ZenTiles';
import WordWeave from '@/components/games/WordWeave';

const games = [
  { id: 'breath', icon: <Wind size={28} />, title: 'Breath Bubbles', desc: 'Pop bubbles in sync with your breath. Calming, no score.', time: '2-3 min' },
  { id: 'memory', icon: <Sprout size={28} />, title: 'Memory Garden', desc: 'Match concepts to their meanings. Learn while relaxing.', time: '3-5 min' },
  { id: 'zen', icon: <Layers size={28} />, title: 'Zen Tiles', desc: 'Slide tiles into place. No timer, no pressure.', time: '2-5 min' },
  { id: 'word', icon: <Type size={28} />, title: 'Word Weave', desc: 'Find words from scattered letters. Gentle and fun.', time: '3-5 min' },
];

const postGameMessages: Record<string, string> = {
  breath: 'Your breathing regulated. Cortisol drops after controlled breathing. You\'re ready to learn.',
  memory: 'You just reinforced concepts while relaxing. Your brain was learning even at rest.',
  zen: 'Puzzle solving activates the same prefrontal cortex you use for studying — gently warmed up now.',
  word: 'Language processing is active. Good state for reading-heavy topics like theory.',
};

const Games = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showPostMessage, setShowPostMessage] = useState<string | null>(null);

  const handleGameEnd = (gameId: string) => {
    setActiveGame(null);
    setShowPostMessage(gameId);
    setTimeout(() => setShowPostMessage(null), 5000);
  };

  if (activeGame) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => handleGameEnd(activeGame)} className="flex items-center gap-1 text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>
          <ArrowLeft size={16} /> Back to games
        </button>
        {activeGame === 'breath' && <BreathBubbles onEnd={() => handleGameEnd('breath')} />}
        {activeGame === 'memory' && <MemoryGarden onEnd={() => handleGameEnd('memory')} />}
        {activeGame === 'zen' && <ZenTiles onEnd={() => handleGameEnd('zen')} />}
        {activeGame === 'word' && <WordWeave onEnd={() => handleGameEnd('word')} />}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'hsl(var(--text))' }}>🌿 Mind Break Games</h2>
      <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted))' }}>
        Sometimes rest means gentle play. No pressure, no scores.
      </p>

      <AnimatePresence>
        {showPostMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card-base mb-6 text-center">
            <p className="font-display text-sm italic" style={{ color: 'hsl(var(--text))' }}>
              {postGameMessages[showPostMessage]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 gap-4">
        {games.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveGame(g.id)}
            className="card-base text-left group cursor-pointer hover:border-accent transition-all"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <span className="mb-2 block" style={{ color: 'hsl(var(--accent))' }}>{g.icon}</span>
            <h3 className="font-display text-base font-semibold mb-1" style={{ color: 'hsl(var(--text))' }}>{g.title}</h3>
            <p className="text-xs mb-2" style={{ color: 'hsl(var(--text-secondary))' }}>{g.desc}</p>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--muted))' }}>
              {g.time}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Games;
