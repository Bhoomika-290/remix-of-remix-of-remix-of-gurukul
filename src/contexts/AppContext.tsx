import { createContext, useContext, useState, ReactNode } from 'react';

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
  xp: 340,
  streak: 7,
  heroLevel: 2,
  heroTitle: 'Scholar',
  burnoutScore: 32,
  readinessScore: 72,
  onboardingComplete: false,
  isLoggedIn: false,
};

interface AppContextType {
  user: UserProfile;
  setUser: (u: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
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

  const logout = () => {
    localStorage.removeItem('saathi-user');
    setUser(defaultUser);
  };

  return (
    <AppContext.Provider value={{ user, setUser: updateUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};
