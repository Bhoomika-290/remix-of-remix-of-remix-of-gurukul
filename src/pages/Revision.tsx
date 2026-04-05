import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Sparkles, ArrowLeft, RotateCcw, Star, Loader2, Plus, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  rating: number;
  nextReview: number;
  reviewCount: number;
  interval: number;
}

interface Deck {
  id: string;
  name: string;
  subject: string;
  cards: Flashcard[];
  lastStudied: number;
}

const Revision = () => {
  const { user } = useApp();
  const [decks, setDecks] = useState<Deck[]>(() => {
    return JSON.parse(localStorage.getItem('gurukul-flashcards') || '[]');
  });
  const [activeDeck, setActiveDeck] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('');
  const [aiCount, setAiCount] = useState(10);
  const [addingCard, setAddingCard] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const saveDecks = (d: Deck[]) => { setDecks(d); localStorage.setItem('gurukul-flashcards', JSON.stringify(d)); };

  const deck = useMemo(() => decks.find(d => d.id === activeDeck), [decks, activeDeck]);

  const dueCards = useMemo(() => {
    if (!deck) return [];
    const now = Date.now();
    return deck.cards.filter(c => c.nextReview <= now || c.rating === 0);
  }, [deck]);

  const createDeck = () => {
    if (!newDeckName.trim()) return;
    const d: Deck = { id: Date.now().toString(), name: newDeckName.trim(), subject: newDeckSubject.trim() || 'General', cards: [], lastStudied: 0 };
    saveDecks([...decks, d]);
    setNewDeckName(''); setNewDeckSubject(''); setCreating(false);
    toast.success('Deck created!');
  };

  const deleteDeck = (id: string) => { saveDecks(decks.filter(d => d.id !== id)); if (activeDeck === id) setActiveDeck(null); };

  const addCard = () => {
    if (!newFront.trim() || !newBack.trim() || !deck) return;
    const card: Flashcard = { id: Date.now().toString(), front: newFront.trim(), back: newBack.trim(), rating: 0, nextReview: 0, reviewCount: 0, interval: 0 };
    const updated = decks.map(d => d.id === deck.id ? { ...d, cards: [...d.cards, card] } : d);
    saveDecks(updated);
    setNewFront(''); setNewBack(''); setAddingCard(false);
    toast.success('Card added!');
  };

  const generateAICards = useCallback(async () => {
    if (!aiSubject.trim() || !aiTopic.trim()) { toast.error('Enter subject and topic'); return; }
    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning', {
        body: { subject: aiSubject, subtopic: aiTopic, mode: 'flashcards', numQuestions: aiCount },
      });
      if (error) throw error;
      const result = data?.result;
      if (Array.isArray(result) && result.length > 0) {
        const cards: Flashcard[] = result.map((item: any, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          front: item.front || item.question || `Concept ${i + 1}`,
          back: item.back || item.answer || 'Review your notes for this concept.',
          rating: 0, nextReview: 0, reviewCount: 0, interval: 0,
        }));
        const d: Deck = { id: Date.now().toString(), name: `${aiSubject} — ${aiTopic}`, subject: aiSubject, cards, lastStudied: 0 };
        saveDecks([...decks, d]);
        setAiTopic(''); setAiSubject('');
        toast.success(`Created deck with ${cards.length} flashcards!`);
      } else { toast.error('Could not generate flashcards. Try a different topic.'); }
    } catch (err: any) { toast.error(err.message || 'Failed to generate'); }
    finally { setAiGenerating(false); }
  }, [aiSubject, aiTopic, aiCount, decks]);

  const rateCard = (rating: 1 | 2 | 3 | 4) => {
    if (!deck) return;
    const card = dueCards[currentCard];
    if (!card) return;
    const intervals = { 1: 1, 2: 10, 3: 1440, 4: 5760 };
    const nextReview = Date.now() + intervals[rating] * 60000;
    const updated = decks.map(d => d.id === deck.id ? {
      ...d, lastStudied: Date.now(),
      cards: d.cards.map(c => c.id === card.id ? { ...c, rating, nextReview, reviewCount: c.reviewCount + 1, interval: intervals[rating] / 1440 } : c),
    } : d);
    saveDecks(updated);
    setFlipped(false);
    if (currentCard < dueCards.length - 1) setCurrentCard(prev => prev + 1);
    else { setStudyMode(false); setCurrentCard(0); toast.success('Session complete! 🌿'); }
  };

  // Study mode
  if (studyMode && deck && dueCards.length > 0) {
    const card = dueCards[currentCard];
    if (!card) { setStudyMode(false); return null; }
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6"
        style={{ background: 'linear-gradient(180deg, hsl(220 25% 10%), hsl(240 20% 14%))' }}>
        <button onClick={() => { setStudyMode(false); setCurrentCard(0); setFlipped(false); }}
          className="absolute top-6 left-6 text-white/60 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft size={18} /> Back</button>

        <div className="w-full max-w-md mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>{currentCard + 1} / {dueCards.length}</span>
            <span>{deck.name}</span>
          </div>
          <div className="flex gap-0.5">
            {dueCards.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < currentCard ? 'rgba(255,255,255,0.4)' : i === currentCard ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        </div>

        <div onClick={() => setFlipped(!flipped)} className="w-full max-w-md cursor-pointer" style={{ perspective: '1000px' }}>
          <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, type: 'spring' }}
            className="relative w-full min-h-[250px] rounded-2xl" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 flex items-center justify-center p-8 rounded-2xl"
              style={{ backfaceVisibility: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-center">
                <p className="text-xs text-white/30 mb-4">QUESTION</p>
                <p className="font-display text-lg text-white leading-relaxed">{card.front}</p>
                <p className="text-xs text-white/30 mt-6">Tap to flip</p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-8 rounded-2xl"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(100,200,180,0.08)', border: '1px solid rgba(100,200,180,0.15)' }}>
              <div className="text-center">
                <p className="text-xs text-white/30 mb-4">ANSWER</p>
                <p className="font-display text-lg text-white leading-relaxed">{card.back}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {flipped && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mt-6">
            {[
              { r: 1 as const, label: 'Again', color: 'rgba(255,80,80,0.2)', time: '1 min' },
              { r: 2 as const, label: 'Hard', color: 'rgba(255,180,60,0.2)', time: '10 min' },
              { r: 3 as const, label: 'Good', color: 'rgba(80,200,120,0.2)', time: '1 day' },
              { r: 4 as const, label: 'Easy', color: 'rgba(100,150,255,0.2)', time: '4 days' },
            ].map(b => (
              <button key={b.r} onClick={() => rateCard(b.r)}
                className="px-4 py-3 rounded-xl text-center transition-all hover:scale-105"
                style={{ background: b.color, border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-sm font-medium text-white">{b.label}</p>
                <p className="text-[10px] text-white/40">{b.time}</p>
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Deck detail
  if (activeDeck && deck) {
    const mastered = deck.cards.filter(c => c.rating >= 3).length;
    const learning = deck.cards.filter(c => c.rating > 0 && c.rating < 3).length;
    const newCards = deck.cards.filter(c => c.rating === 0).length;
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <button onClick={() => setActiveDeck(null)} className="flex items-center gap-1 text-xs" style={{ color: 'hsl(var(--muted))' }}><ArrowLeft size={14} /> All Decks</button>
        <div className="card-base">
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: 'hsl(var(--text))' }}>{deck.name}</h2>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted))' }}>{deck.subject} · {deck.cards.length} cards</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-xl" style={{ background: 'hsl(var(--success) / 0.1)' }}>
              <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>{mastered}</p><p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Mastered</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'hsl(var(--warning) / 0.1)' }}>
              <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--warning))' }}>{learning}</p><p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Learning</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'hsl(var(--accent-soft))' }}>
              <p className="stat-number text-lg font-bold" style={{ color: 'hsl(var(--accent))' }}>{newCards}</p><p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>New</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStudyMode(true); setCurrentCard(0); setFlipped(false); }}
              disabled={dueCards.length === 0}
              className="btn-3d flex-1 py-3 text-sm font-semibold disabled:opacity-40">
              Study ({dueCards.length} due)
            </button>
            <button onClick={() => setAddingCard(true)} className="btn-3d-ghost py-3 px-4 text-sm"><Plus size={16} /></button>
          </div>
        </div>

        {addingCard && (
          <div className="card-base space-y-3">
            <h3 className="font-display text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>Add Card</h3>
            <input value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="Question / Front"
              className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
            <textarea value={newBack} onChange={e => setNewBack(e.target.value)} placeholder="Answer / Back" rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none resize-none" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
            <div className="flex gap-2">
              <button onClick={addCard} className="btn-3d text-xs px-4 py-2">Add</button>
              <button onClick={() => { setAddingCard(false); setNewFront(''); setNewBack(''); }} className="btn-3d-ghost text-xs px-4 py-2">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {deck.cards.map((c, i) => (
            <div key={c.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'hsl(var(--surface2))' }}>
              <span className="w-6 text-center text-xs" style={{ color: 'hsl(var(--muted))' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--text))' }}>{c.front}</p>
                <p className="text-xs truncate" style={{ color: 'hsl(var(--muted))' }}>{c.back}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                background: c.rating >= 3 ? 'hsl(var(--success) / 0.15)' : c.rating > 0 ? 'hsl(var(--warning) / 0.15)' : 'hsl(var(--accent-soft))',
                color: c.rating >= 3 ? 'hsl(var(--success))' : c.rating > 0 ? 'hsl(var(--warning))' : 'hsl(var(--accent))',
              }}>{c.rating >= 3 ? 'Mastered' : c.rating > 0 ? 'Learning' : 'New'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Hub view
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const totalDue = decks.reduce((acc, d) => acc + d.cards.filter(c => c.nextReview <= Date.now() || c.rating === 0).length, 0);
  const totalMastered = decks.reduce((acc, d) => acc + d.cards.filter(c => c.rating >= 3).length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
          <BookOpen size={24} style={{ color: 'hsl(var(--accent))' }} /> Revision Hub
        </h2>
        <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted))' }}>Flashcards with spaced repetition for long-term memory.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card-base text-center py-3">
          <p className="stat-number text-xl font-bold" style={{ color: 'hsl(var(--accent))' }}>{totalDue}</p>
          <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Due Today</p>
        </div>
        <div className="card-base text-center py-3">
          <p className="stat-number text-xl font-bold" style={{ color: 'hsl(var(--success))' }}>{totalMastered}</p>
          <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Mastered</p>
        </div>
        <div className="card-base text-center py-3">
          <p className="stat-number text-xl font-bold" style={{ color: 'hsl(var(--text))' }}>{totalCards}</p>
          <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>Total Cards</p>
        </div>
      </div>

      {/* AI Generate */}
      <div className="card-base">
        <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'hsl(var(--text))' }}>
          <Sparkles size={16} style={{ color: 'hsl(var(--accent))' }} /> AI-Generated Flashcards
        </h3>
        <div className="flex gap-2 mb-3">
          <input value={aiSubject} onChange={e => setAiSubject(e.target.value)} placeholder="Subject" className="flex-1 px-3 py-2 rounded-lg border border-border text-xs outline-none" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
          <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Topic" className="flex-1 px-3 py-2 rounded-lg border border-border text-xs outline-none" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
        </div>
        <div className="flex gap-2 mb-3">
          <span className="text-xs self-center" style={{ color: 'hsl(var(--muted))' }}>Cards:</span>
          {[5, 10, 15, 20].map(n => (
            <button key={n} onClick={() => setAiCount(n)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all"
              style={{
                background: aiCount === n ? 'hsl(var(--accent-soft))' : 'transparent',
                borderColor: aiCount === n ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                color: aiCount === n ? 'hsl(var(--accent))' : 'hsl(var(--muted))',
              }}>{n}</button>
          ))}
        </div>
        <button onClick={generateAICards} disabled={aiGenerating || !aiSubject.trim() || !aiTopic.trim()} className="btn-3d text-xs px-4 py-2 w-full flex items-center justify-center gap-2 disabled:opacity-40">
          {aiGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating flashcards...</> : <><Sparkles size={14} /> Generate {aiCount} flashcards</>}
        </button>
      </div>

      {/* My Decks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold" style={{ color: 'hsl(var(--text))' }}>My Decks</h3>
          <button onClick={() => setCreating(true)} className="btn-3d-ghost text-xs px-3 py-1.5 flex items-center gap-1"><Plus size={14} /> New Deck</button>
        </div>

        {creating && (
          <div className="card-base mb-3 space-y-2">
            <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="Deck name" className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
            <input value={newDeckSubject} onChange={e => setNewDeckSubject(e.target.value)} placeholder="Subject" className="w-full px-3 py-2 rounded-lg border border-border text-xs outline-none" style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }} />
            <div className="flex gap-2">
              <button onClick={createDeck} className="btn-3d text-xs px-4 py-2">Create</button>
              <button onClick={() => setCreating(false)} className="btn-3d-ghost text-xs px-4 py-2">Cancel</button>
            </div>
          </div>
        )}

        {decks.length === 0 ? (
          <div className="card-base text-center py-8">
            <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'hsl(var(--muted))' }} />
            <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>No decks yet. Create one or generate with AI!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {decks.map(d => {
              const due = d.cards.filter(c => c.nextReview <= Date.now() || c.rating === 0).length;
              const mastered = d.cards.filter(c => c.rating >= 3).length;
              const pct = d.cards.length > 0 ? Math.round((mastered / d.cards.length) * 100) : 0;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="card-base hover:border-accent transition-all cursor-pointer group" onClick={() => setActiveDeck(d.id)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--text))' }}>{d.name}</p>
                      <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{d.subject} · {d.cards.length} cards</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteDeck(d.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1" style={{ color: 'hsl(var(--danger))' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span style={{ color: 'hsl(var(--accent))' }}>{due} due</span>
                    <span style={{ color: 'hsl(var(--success))' }}>{pct}% mastered</span>
                  </div>
                  <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'hsl(var(--surface2))' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'hsl(var(--success))' }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Revision;
