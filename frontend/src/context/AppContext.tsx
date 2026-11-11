import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Profile } from '../types';

type AppContextValue = {
  city: string;
  setCity: (nextCity: string) => void;
  profile: Profile | null;
  setProfile: (nextProfile: Profile | null) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const CITY_OPTIONS = ['Bengaluru', 'Delhi', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

export function AppProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<string>(() => localStorage.getItem('cinebook-city') ?? 'Bengaluru');
  const [profile, setProfileState] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('cinebook-profile');
    return saved ? (JSON.parse(saved) as Profile) : null;
  });

  useEffect(() => {
    localStorage.setItem('cinebook-city', city);
  }, [city]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('cinebook-profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('cinebook-profile');
    }
  }, [profile]);

  const setCity = (nextCity: string) => setCityState(nextCity);
  const setProfile = (nextProfile: Profile | null) => setProfileState(nextProfile);
  const logout = () => setProfileState(null);

  const value = useMemo(
    () => ({ city, setCity, profile, setProfile, logout }),
    [city, profile],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
}
