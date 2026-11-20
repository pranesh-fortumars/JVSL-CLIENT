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
import type { Profile, UserAddress } from './firestoreService';

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
  countryCode?: string;
  landline?: string;
  cityStdCode?: string;
  preferredLanguage?: 'en' | 'gu' | 'hi';
  initialAddress?: UserAddress;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; hasSession: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInMock: (mockProfile: Profile) => void;
  signOut: () => Promise<void>;
  updateCustomerProfile: (data: Partial<Profile>) => Promise<void>;
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

// Reserved staff email identifiers (used for initial configuration reference)
export const SUPER_ADMIN_EMAILS = [
  'owner@jvlsd.in',
  'superadmin@jvlsd.in',
  'super@jvlsd.in',
  'director@jvlsd.in',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const ADMIN_EMAILS = [
  'manager@jvlsd.in',
  'admin@jvlsd.in',
  'jvlsd@gmail.com',
];

export function isStaffAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return isSuperAdminEmail(e) || ADMIN_EMAILS.includes(e);
}

async function getOrInitProfile(user: User): Promise<Profile> {
  const ref = doc(db, 'profiles', user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const existing = snap.data() as Omit<Profile, 'id'>;
    return { id: user.uid, ...existing };
  }
  
  // New sign-ups are strictly 'customer' by default. Staff promotion must occur via verified admin delegation.
  const newProfile: Profile = {
    id: user.uid,
    email: user.email || '',
    full_name: user.displayName || null,
    role: 'customer',
  };
  await setDoc(ref, newProfile, { merge: true });
  return newProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const MOCK_SESSION_KEY = 'jvlsd_mock_auth_session';

  useEffect(() => {
    // Check if there is an active mock testing session
    try {
      const savedMock = localStorage.getItem(MOCK_SESSION_KEY);
      if (savedMock) {
        const mockProf: Profile = JSON.parse(savedMock);
        setProfile(mockProf);
        setUser({
          uid: mockProf.id,
          email: mockProf.email,
          displayName: mockProf.full_name || 'Testing User',
        } as any);
        setLoading(false);
        return;
      }
    } catch (e) {}

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
            role: 'customer',
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInMock: AuthContextValue['signInMock'] = (mockProfile: Profile) => {
    try {
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockProfile));
      localStorage.setItem('jvlsd_mock_data_mode', 'true');
    } catch (e) {}
    setProfile(mockProfile);
    setUser({
      uid: mockProfile.id,
      email: mockProfile.email,
      displayName: mockProfile.full_name || 'Testing User',
    } as any);
    setLoading(false);
  };

  const signUp: AuthContextValue['signUp'] = async (input) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, input.email, input.password);
      if (input.fullName) {
        await updateProfile(res.user, { displayName: input.fullName });
      }
      const initialAddresses = input.initialAddress ? [input.initialAddress] : [];
      const newProf: Profile = {
        id: res.user.uid,
        email: input.email,
        full_name: input.fullName,
        role: 'customer',
        mobile: input.mobile,
        country_code: input.countryCode || '+91',
        landline: input.landline,
        city_std_code: input.cityStdCode,
        preferred_language: input.preferredLanguage || 'en',
        addresses: initialAddresses,
      };
      await setDoc(doc(db, 'profiles', res.user.uid), newProf, { merge: true });
      setProfile(newProf);
      return { error: null, hasSession: true };
    } catch (err: any) {
      return { error: friendlyAuthError(err.code || err.message), hasSession: false };
    }
  };

  const updateCustomerProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'profiles', user.uid), data, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      console.warn('updateCustomerProfile notice:', err);
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
    try {
      localStorage.removeItem(MOCK_SESSION_KEY);
    } catch (e) {}
    setUser(null);
    setProfile(null);
    await fbSignOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signInMock, signOut, updateCustomerProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
