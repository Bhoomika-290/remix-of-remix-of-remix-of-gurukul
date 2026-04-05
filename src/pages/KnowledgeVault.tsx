import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, FileText, Video, ClipboardList, ChevronRight, Home, Download, Eye, Play, Filter, ArrowLeft, Loader2, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

type Level = 'subjects' | 'topics' | 'sub_topics' | 'materials';

interface Stream { id: string; name: string; icon: string; description: string; }
interface Subject { id: string; name: string; stream_id: string; icon: string; description: string; }
interface Topic { id: string; name: string; subject_id: string; description: string; }
interface SubTopic { id: string; name: string; topic_id: string; description: string; }
interface Material { id: string; title: string; type: string; url: string; sub_topic_id: string; year: number | null; file_size: string | null; duration: string | null; }

const typeIcons: Record<string, any> = { pdf: FileText, video: Video, pyq: ClipboardList };
const typeLabels: Record<string, string> = { pdf: 'PDF Notes', video: 'Video Lectures', pyq: 'PYQs' };
const typeEmoji: Record<string, string> = { pdf: '📄', video: '🎥', pyq: '📝' };

const KnowledgeVault = () => {
  const { user } = useApp();
  const [level, setLevel] = useState<Level>('subjects');
  const [streams, setStreams] = useState<Stream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<SubTopic | null>(null);
  const [activeTab, setActiveTab] = useState<'pdf' | 'video' | 'pyq'>('pdf');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Material[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExplore, setShowExplore] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  // Map user examType to stream
  const userStreamName = useMemo(() => {
    const map: Record<string, string> = {
      jee: 'Science PCM', neet: 'Science PCB', boards: 'Science PCM',
      engineering: 'Engineering', other: 'Science PCM',
    };
    return map[user.examType] || 'Science PCM';
  }, [user.examType]);

  // Load streams + subjects
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: st }, { data: subs }] = await Promise.all([
        supabase.from('streams').select('*').order('name'),
        supabase.from('subjects').select('*').order('name'),
      ]);
      setStreams((st as Stream[]) || []);
      const allSubs = (subs as Subject[]) || [];
      setSubjects(allSubs);
      // Auto-select user's stream
      const userStream = (st as Stream[])?.find(s => s.name === userStreamName);
      if (userStream) setSelectedStreamId(userStream.id);
      setLoading(false);
    };
    load();
  }, [userStreamName]);

  const filteredSubjects = useMemo(() => {
    if (!selectedStreamId) return subjects;
    return subjects.filter(s => s.stream_id === selectedStreamId);
  }, [subjects, selectedStreamId]);

  const loadTopics = async (subjectId: string) => {
    setLoading(true);
    const { data } = await supabase.from('topics').select('*').eq('subject_id', subjectId).order('name');
    setTopics((data as Topic[]) || []);
    setLoading(false);
  };

  const loadSubTopics = async (topicId: string) => {
    setLoading(true);
    const { data } = await supabase.from('sub_topics').select('*').eq('topic_id', topicId).order('name');
    setSubTopics((data as SubTopic[]) || []);
    setLoading(false);
  };

  const loadMaterials = async (subTopicId: string) => {
    setLoading(true);
    const { data } = await supabase.from('materials').select('*').eq('sub_topic_id', subTopicId).order('created_at', { ascending: false });
    setMaterials((data as Material[]) || []);
    setLoading(false);
  };

  // Search
  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase.from('materials').select('*').ilike('title', `%${q}%`).limit(20);
    setSearchResults((data as Material[]) || []);
    setSearching(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]);

  const navigateTo = (newLevel: Level, item?: any) => {
    if (newLevel === 'subjects') {
      setLevel('subjects'); setSelectedSubject(null); setSelectedTopic(null); setSelectedSubTopic(null);
    } else if (newLevel === 'topics' && item) {
      setSelectedSubject(item); setLevel('topics'); setSelectedTopic(null); setSelectedSubTopic(null);
      loadTopics(item.id);
    } else if (newLevel === 'sub_topics' && item) {
      setSelectedTopic(item); setLevel('sub_topics'); setSelectedSubTopic(null);
      loadSubTopics(item.id);
    } else if (newLevel === 'materials' && item) {
      setSelectedSubTopic(item); setLevel('materials'); setActiveTab('pdf');
      loadMaterials(item.id);
    }
  };

  const breadcrumbs = [
    { label: 'Knowledge Vault', level: 'subjects' as Level },
    ...(selectedSubject ? [{ label: selectedSubject.name, level: 'topics' as Level }] : []),
    ...(selectedTopic ? [{ label: selectedTopic.name, level: 'sub_topics' as Level }] : []),
    ...(selectedSubTopic ? [{ label: selectedSubTopic.name, level: 'materials' as Level }] : []),
  ];

  const filteredMaterials = useMemo(() => {
    let m = materials.filter(mat => mat.type === activeTab);
    if (yearFilter && activeTab === 'pyq') m = m.filter(mat => mat.year === yearFilter);
    return m;
  }, [materials, activeTab, yearFilter]);

  const availableYears = useMemo(() => {
    const years = materials.filter(m => m.type === 'pyq' && m.year).map(m => m.year!);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [materials]);

  if (loading && level === 'subjects' && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin" size={24} style={{ color: 'hsl(var(--accent))' }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        {breadcrumbs.map((bc, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} style={{ color: 'hsl(var(--muted))' }} />}
            <button
              onClick={() => {
                if (bc.level === 'subjects') navigateTo('subjects');
                else if (bc.level === 'topics' && selectedSubject) navigateTo('topics', selectedSubject);
                else if (bc.level === 'sub_topics' && selectedTopic) navigateTo('sub_topics', selectedTopic);
              }}
              className="font-medium hover:underline"
              style={{ color: i === breadcrumbs.length - 1 ? 'hsl(var(--text))' : 'hsl(var(--accent))' }}
            >
              {i === 0 && <Home size={12} className="inline mr-1" />}
              {bc.label}
            </button>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted))' }} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search notes, videos, PYQs across all topics..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2"
          style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--text))' }}
        />
        {/* Search results dropdown */}
        {searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-50 max-h-60 overflow-y-auto"
            style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
            {searching ? (
              <div className="p-4 text-center text-sm" style={{ color: 'hsl(var(--muted))' }}>Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'hsl(var(--muted))' }}>No results found</div>
            ) : searchResults.map(m => (
              <button key={m.id} onClick={() => setSearchQuery('')}
                className="w-full text-left p-3 flex items-center gap-3 hover:bg-accent/5 transition-colors border-b last:border-b-0"
                style={{ borderColor: 'hsl(var(--border))' }}>
                <span>{typeEmoji[m.type]}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'hsl(var(--text))' }}>{m.title}</p>
                  <p className="text-[10px]" style={{ color: 'hsl(var(--muted))' }}>{typeLabels[m.type]} {m.file_size && `· ${m.file_size}`}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stream pills (at subject level) */}
      {level === 'subjects' && (
        <div className="flex flex-wrap gap-2">
          {streams.map(s => (
            <button key={s.id} onClick={() => setSelectedStreamId(s.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                background: selectedStreamId === s.id ? 'hsl(var(--accent-soft))' : 'hsl(var(--surface))',
                borderColor: selectedStreamId === s.id ? 'hsl(var(--accent))' : 'hsl(var(--border))',
                color: selectedStreamId === s.id ? 'hsl(var(--accent))' : 'hsl(var(--text))',
              }}>
              {s.icon} {s.name}
            </button>
          ))}
          <button onClick={() => setShowExplore(!showExplore)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--accent))' }}>
            <Globe size={12} /> Explore All
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ======= SUBJECTS GRID ======= */}
        {level === 'subjects' && (
          <motion.div key="subjects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSubjects.map((sub, i) => (
                <motion.button key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => navigateTo('topics', sub)}
                  className="card-base text-left hover:border-accent transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'hsl(var(--accent-soft))' }}>
                      {sub.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--text))' }}>{sub.name}</p>
                      <p className="text-[10px] truncate" style={{ color: 'hsl(var(--muted))' }}>{sub.description}</p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'hsl(var(--accent))' }} />
                  </div>
                </motion.button>
              ))}
            </div>
            {filteredSubjects.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'hsl(var(--muted))' }} />
                <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>No subjects found for this stream</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ======= TOPICS LIST ======= */}
        {level === 'topics' && (
          <motion.div key="topics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={20} style={{ color: 'hsl(var(--accent))' }} /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topics.map((t, i) => (
                  <motion.button key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => navigateTo('sub_topics', t)}
                    className="card-base text-left hover:border-accent transition-all group">
                    <p className="text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{t.name}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>{t.description}</p>
                    <ChevronRight size={14} className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'hsl(var(--accent))' }} />
                  </motion.button>
                ))}
              </div>
            )}
            {!loading && topics.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>No topics available yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ======= SUB-TOPICS LIST ======= */}
        {level === 'sub_topics' && (
          <motion.div key="subtopics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={20} style={{ color: 'hsl(var(--accent))' }} /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subTopics.map((st, i) => (
                  <motion.button key={st.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => navigateTo('materials', st)}
                    className="card-base text-left hover:border-accent transition-all group">
                    <p className="text-sm font-semibold" style={{ color: 'hsl(var(--text))' }}>{st.name}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--muted))' }}>{st.description}</p>
                    <div className="flex gap-2 mt-2">
                      {['📄', '🎥', '📝'].map((e, j) => (
                        <span key={j} className="text-xs">{e}</span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ======= MATERIALS VIEW ======= */}
        {level === 'materials' && (
          <motion.div key="materials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--surface2))' }}>
              {(['pdf', 'video', 'pyq'] as const).map(tab => {
                const Icon = typeIcons[tab];
                return (
                  <button key={tab} onClick={() => { setActiveTab(tab); setYearFilter(null); }}
                    className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: activeTab === tab ? 'hsl(var(--surface))' : 'transparent',
                      color: activeTab === tab ? 'hsl(var(--text))' : 'hsl(var(--muted))',
                      boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                    }}>
                    <Icon size={14} />
                    {typeLabels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Year filter for PYQs */}
            {activeTab === 'pyq' && availableYears.length > 0 && (
              <div className="flex gap-2 items-center">
                <Filter size={12} style={{ color: 'hsl(var(--muted))' }} />
                <div className="flex gap-1">
                  <button onClick={() => setYearFilter(null)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: !yearFilter ? 'hsl(var(--accent-soft))' : 'transparent', color: !yearFilter ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>
                    All
                  </button>
                  {availableYears.map(y => (
                    <button key={y} onClick={() => setYearFilter(y)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: yearFilter === y ? 'hsl(var(--accent-soft))' : 'transparent', color: yearFilter === y ? 'hsl(var(--accent))' : 'hsl(var(--muted))' }}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material cards */}
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={20} style={{ color: 'hsl(var(--accent))' }} /></div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12 card-base">
                <div className="text-3xl mb-2">{typeEmoji[activeTab]}</div>
                <p className="text-sm" style={{ color: 'hsl(var(--muted))' }}>No {typeLabels[activeTab].toLowerCase()} available for this topic yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredMaterials.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="card-base flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: m.type === 'pdf' ? 'hsl(var(--danger) / 0.1)' : m.type === 'video' ? 'hsl(var(--accent-soft))' : 'hsl(var(--warning) / 0.1)' }}>
                      {m.type === 'pdf' ? <FileText size={18} style={{ color: 'hsl(var(--danger))' }} /> :
                       m.type === 'video' ? <Play size={18} style={{ color: 'hsl(var(--accent))' }} /> :
                       <ClipboardList size={18} style={{ color: 'hsl(var(--warning))' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--text))' }}>{m.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: 'hsl(var(--muted))' }}>
                        {m.file_size && <span>{m.file_size}</span>}
                        {m.duration && <span>⏱ {m.duration}</span>}
                        {m.year && <span className="px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>{m.year}</span>}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {m.type === 'video' ? (
                          <a href={m.url} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-medium px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                            style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}>
                            <Play size={10} /> Watch
                          </a>
                        ) : (
                          <>
                            <button className="text-[10px] font-medium px-3 py-1 rounded-lg flex items-center gap-1"
                              style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--accent))' }}
                              onClick={() => toast.info('PDF viewer coming soon!')}>
                              <Eye size={10} /> View
                            </button>
                            <button className="text-[10px] font-medium px-3 py-1 rounded-lg flex items-center gap-1"
                              style={{ background: 'hsl(var(--surface2))', color: 'hsl(var(--text))' }}
                              onClick={() => toast.info('Download coming soon!')}>
                              <Download size={10} /> Download
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeVault;
