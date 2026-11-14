import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Profile } from './firestoreService';

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
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account exists with this email.',
  'auth/wrong-password': 'Password is incorrect.',
  'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
};

function friendlyAuthError(codeOrMessage: string) {
  return AUTH_MESSAGES[codeOrMessage] ?? 'Authentication failed. Please verify your credentials and try again.';
}

async function getOrInitProfile(user: User): Promise<Profile> {
  const ref = doc(db, 'profiles', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: user.uid, ...(snap.data() as Omit<Profile, 'id'>) };
  }
  
  const role: Profile['role'] =
    user.email?.includes('jvlsd') || user.email?.toLowerCase() === 'jvlsd@gmail.com'
      ? 'admin'
      : 'customer';
  const newProfile: Profile = {
    id: user.uid,
    email: user.email || '',
    full_name: user.displayName || null,
    role,
  };
  await setDoc(ref, newProfile, { merge: true });
  return newProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const p = await getOrInitProfile(nextUser);
          setProfile(p);
        } catch (err) {
          console.warn('Could not retrieve profile from firestore:', err);
          setProfile({
            id: nextUser.uid,
            email: nextUser.email || '',
            full_name: nextUser.displayName || null,
            role: nextUser.email?.includes('admin@jvlsd') ? 'admin' : 'customer',
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp: AuthContextValue['signUp'] = async ({ fullName, email, password }) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateProfile(res.user, { displayName: fullName });
      }
      const newProf: Profile = {
        id: res.user.uid,
        email,
        full_name: fullName,
        role: email.includes('jvlsd') || email.toLowerCase() === 'jvlsd@gmail.com' ? 'admin' : 'customer',
      };
      await setDoc(doc(db, 'profiles', res.user.uid), newProf, { merge: true });
      setProfile(newProf);
      return { error: null, hasSession: true };
    } catch (err: any) {
      return { error: friendlyAuthError(err.code || err.message), hasSession: false };
    }
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err: any) {
      return { error: friendlyAuthError(err.code || err.message) };
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
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
