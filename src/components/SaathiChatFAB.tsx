import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

const quickChips = [
  'Explain this topic',
  "I'm feeling overwhelmed",
  'What should I study today?',
  "I don't understand this concept",
];

const SaathiChatFAB = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: "Hey! I'm Saathi, your study companion. What can I help you with today? 🌿" },
  ]);
  const [input, setInput] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I understand. Let me think about that for a moment... 🌿\n\nBased on your recent study patterns, I'd suggest focusing on your stronger areas today to build confidence.",
        },
      ]);
    }, 1200);
  };

  // Magnetic effect
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || open) return;
    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      btn.style.transition = 'transform 0.1s ease';
    };
    const onLeave = () => {
      btn.style.transform = 'translate(0,0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    };
    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      btn.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, [open]);

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={btnRef}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-display z-50 btn-3d"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            स
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 w-[calc(100%-2rem)] max-w-[380px] rounded-2xl border border-border overflow-hidden z-50 flex flex-col"
            style={{ background: 'hsl(var(--surface))', height: '500px', boxShadow: 'var(--shadow-lg)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="font-display font-semibold" style={{ color: 'hsl(var(--text))' }}>Ask Saathi</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: 'hsl(var(--muted))' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                    style={{
                      background: m.role === 'user' ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface2))',
                      color: 'hsl(var(--text))',
                      fontFamily: m.role === 'assistant' ? 'var(--font-fraunces)' : 'var(--font-body)',
                    }}
                  >
                    {m.role === 'assistant' && <span className="text-xs mr-1 opacity-60">🌿</span>}
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {quickChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border transition-colors hover:border-accent"
                  style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text-secondary))' }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Saathi anything..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-border outline-none transition-colors"
                style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}
              />
              <button onClick={() => handleSend()} className="btn-3d w-10 h-10 rounded-xl flex items-center justify-center !p-0">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SaathiChatFAB;
