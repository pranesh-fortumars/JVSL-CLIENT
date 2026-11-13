import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';

type SignUpInput = { fullName: string; email: string; password: string };

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; hasSession: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email or password is incorrect.',
  'User already registered': 'An account with this email already exists. Please sign in instead.',
  'Email not confirmed': 'This account is not active yet. Please contact JVLSD.',
};

function friendlyAuthError(message: string) {
  return AUTH_MESSAGES[message] ?? 'Something went wrong. Please try again.';
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applySession = async (session: Session | null) => {
      const nextUser = session?.user ?? null;
      if (active) setUser(nextUser);
      if (!nextUser) {
        if (active) setProfile(null);
        return;
      }
      try {
        const nextProfile = await fetchProfile(nextUser.id);
        if (active) setProfile(nextProfile);
      } catch {
        if (active) setProfile(null);
      }
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session)).finally(() => {
      if (active) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        await applySession(session);
        if (active) setLoading(false);
      })();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue['signUp'] = async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: friendlyAuthError(error.message), hasSession: false };
    return { error: null, hasSession: data.session !== null };
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? friendlyAuthError(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
