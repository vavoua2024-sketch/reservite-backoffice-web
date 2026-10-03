'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadSession, loginStaff, logoutStaff, SessionUser } from './api';

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadSession()?.user ?? null);
    setLoading(false);
    const onLogout = () => setUser(null);
    window.addEventListener('reservite:logout', onLogout);
    return () => window.removeEventListener('reservite:logout', onLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await loginStaff(email, password));
  }, []);
  const logout = useCallback(async () => {
    await logoutStaff();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth doit être utilisé dans <AuthProvider>.');
  return v;
}
