import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  name: string;
  email: string;
  examType: string;
  subjects: string[];
  studyTime: string;
  mood: string;
  xp: number;
  streak: number;
  heroLevel: number;
  heroTitle: string;
  burnoutScore: number;
  readinessScore: number;
  onboardingComplete: boolean;
  isLoggedIn: boolean;
}

const defaultUser: UserProfile = {
  name: '',
  email: '',
  examType: '',
  subjects: [],
  studyTime: '',
  mood: '',
  xp: 0,
  streak: 0,
  heroLevel: 1,
  heroTitle: 'Beginner',
  burnoutScore: 0,
  readinessScore: 50,
  onboardingComplete: false,
  isLoggedIn: false,
};

interface AppContextType {
  user: UserProfile;
  setUser: (u: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  syncProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('saathi-user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const updateUser = (u: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setUser(prev => {
      const next = typeof u === 'function' ? u(prev) : u;
      localStorage.setItem('saathi-user', JSON.stringify(next));
      return next;
    });
  };

  const login = (name: string, email: string) => {
    updateUser(prev => ({ ...prev, name, email, isLoggedIn: true }));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('saathi-user');
    setUser(defaultUser);
  };

  // Sync profile to database
  const syncProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from('profiles').update({
      name: user.name,
      exam_type: user.examType,
      subjects: user.subjects,
      study_time: user.studyTime,
      mood: user.mood,
      xp: user.xp,
      streak: user.streak,
      hero_level: user.heroLevel,
      hero_title: user.heroTitle,
      burnout_score: user.burnoutScore,
      readiness_score: user.readinessScore,
      onboarding_complete: user.onboardingComplete,
      updated_at: new Date().toISOString(),
    }).eq('id', session.user.id);
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          updateUser(prev => ({
            ...prev,
            name: profile.name || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            examType: profile.exam_type || '',
            subjects: profile.subjects || [],
            studyTime: profile.study_time || '',
            mood: profile.mood || '',
            xp: profile.xp || 0,
            streak: profile.streak || 0,
            heroLevel: profile.hero_level || 1,
            heroTitle: profile.hero_title || 'Beginner',
            burnoutScore: profile.burnout_score || 0,
            readinessScore: profile.readiness_score || 50,
            onboardingComplete: profile.onboarding_complete || false,
            isLoggedIn: true,
          }));
        } else {
          updateUser(prev => ({
            ...prev,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            isLoggedIn: true,
          }));
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('saathi-user');
        setUser(defaultUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync profile when key fields change
  useEffect(() => {
    if (user.isLoggedIn && user.onboardingComplete) {
      const timeout = setTimeout(() => syncProfile(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [user.xp, user.streak, user.onboardingComplete, user.examType, user.subjects.length]);

  return (
    <AppContext.Provider value={{ user, setUser: updateUser, login, logout, syncProfile }}>
      {children}
    </AppContext.Provider>
  );
};
