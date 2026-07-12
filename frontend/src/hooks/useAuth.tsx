import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/services/supabase';
import type { AuthError } from '@supabase/supabase-js';

interface LocalUser {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | { message: string } | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | { message: string } | null }>;
  signOut: () => Promise<void>;
  guestLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isOnline: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  guestLogin: () => {},
});

const LOCAL_AUTH_KEY = 'predictiq-local-user';

function getLocalUser(): LocalUser | null {
  const raw = localStorage.getItem(LOCAL_AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setLocalUser(user: LocalUser) {
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
}

function clearLocalUser() {
  localStorage.removeItem(LOCAL_AUTH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const local = getLocalUser();
    if (local) {
      setUser(local);
      setIsOnline(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const u: LocalUser = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at || '',
          };
          setUser(u);
          setLocalUser(u);
          setIsOnline(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setIsOnline(false);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: LocalUser = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || '',
        };
        setUser(u);
        setLocalUser(u);
      } else {
        setUser(null);
        clearLocalUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      if (data.user) {
        const u: LocalUser = {
          id: data.user.id,
          email: data.user.email || email,
          created_at: data.user.created_at || '',
        };
        setUser(u);
        setLocalUser(u);
      }
      return { error: null };
    } catch {
      return { error: { message: 'Cannot reach Supabase. Use "Continue as Guest" below.' } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch {
      return { error: { message: 'Cannot reach Supabase. Use "Continue as Guest" below.' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    clearLocalUser();
  };

  const guestLogin = () => {
    const u: LocalUser = {
      id: 'guest-' + Date.now(),
      email: 'guest@predictiq.local',
      created_at: new Date().toISOString(),
    };
    setUser(u);
    setLocalUser(u);
    setIsOnline(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isOnline, signIn, signUp, signOut, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
