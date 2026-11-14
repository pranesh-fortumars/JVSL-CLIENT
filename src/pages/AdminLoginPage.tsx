import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { navigate, PATHS } from '@/lib/router';

export function AdminLoginPage() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('manager@jvlsd.in');
  const [password, setPassword] = useState('manager@jvlsd.in');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const signedInWithoutAccess = !loading && !!user && !isAdmin;

  useEffect(() => {
    if (!loading && isAdmin) navigate(PATHS.admin);
  }, [loading, isAdmin]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    let result = await signIn(trimmedEmail, password);
    // If account doesn't exist yet, auto-provision and sign in seamlessly
    if (result.error && (result.error.includes('incorrect') || result.error.includes('No account') || result.error.includes('failed'))) {
      const up = await signUp({
        fullName: 'JVLSD Operations Manager',
        email: trimmedEmail,
        password: password,
      });
      if (up.error && !up.hasSession) {
        // If already registered with different password, show the original error
        setError(result.error);
      } else {
        result = { error: null };
      }
    } else if (result.error) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-ink-950 px-5 py-16">
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-700/30 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gold-600/20 blur-3xl" aria-hidden />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-lift backdrop-blur-xl sm:p-10">
        <button
          onClick={() => navigate(PATHS.home)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-200 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to website
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-300">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Admin sign in</h1>
            <p className="text-sm text-brand-200">JVLSD staff only</p>
          </div>
        </div>

        {loading && (
          <div className="mt-8 flex items-center gap-2 text-brand-200">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
          </div>
        )}

        {signedInWithoutAccess && (
          <div className="mt-8 space-y-5">
            <p className="flex items-start gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-100" role="alert">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              This account does not have admin access.
            </p>
            <button
              onClick={() => { void signOut(); }}
              className="btn-outline w-full border-white/20 py-3 text-white hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        )}

        {!loading && !user && (
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-brand-100">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoFocus
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-brand-200/60 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                autoComplete="email"
                aria-invalid={!!error}
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-brand-100">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-brand-200/60 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
                aria-invalid={!!error}
              />
              {error && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-300" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </p>
              )}
            </div>
            <button type="submit" className="btn-gold w-full py-3" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign in to dashboard'}
            </button>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-brand-200">
              <span className="font-semibold text-gold-300">Staff Access:</span> Accounts with an <code className="rounded bg-black/20 px-1 py-0.5 text-white">admin@jvlsd...</code> email address are automatically granted Admin rights. You can create an admin or customer account on the <button type="button" onClick={() => navigate(PATHS.login)} className="underline text-gold-300 hover:text-white">Sign In / Register</button> page.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
