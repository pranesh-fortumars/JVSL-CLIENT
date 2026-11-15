import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { navigate, PATHS } from '@/lib/router';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const { user, profile, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin' || profile.role === 'superadmin') {
        navigate(PATHS.admin);
      } else {
        navigate(PATHS.account);
      }
    }
  }, [loading, user, profile]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    }

    setSubmitting(true);
    if (mode === 'signin') {
      const result = await signIn(trimmedEmail, password);
      if (result.error) setError(result.error);
    } else {
      const result = await signUp({ fullName: fullName.trim(), email: trimmedEmail, password });
      if (result.error) {
        setError(result.error);
      } else if (!result.hasSession) {
        setNotice('Your account is ready. Please sign in with your new password.');
        setMode('signin');
        setPassword('');
      }
    }
    setSubmitting(false);
  };

  return (
    <section className="relative overflow-hidden bg-brand-50/50 pb-20 pt-[calc(var(--header-h)+3rem)] sm:pb-28">
      <div className="container-page">
        <div className="mx-auto max-w-md">
          <p className="eyebrow">Your JVLSD account</p>
          <h1 className="section-title mt-3">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-3 text-ink-600">
            {mode === 'signin'
              ? 'Sign in to view your orders and manage your Fresh Daily deliveries.'
              : 'Create an account to track your Fresh Daily orders in one place.'}
          </p>

          <div className="card mt-8 p-6 sm:p-8">
            <div
              role="group"
              aria-label="Choose sign in or create account"
              className="grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1"
            >
              {(['signin', 'signup'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchMode(value)}
                  aria-pressed={mode === value}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    mode === value
                      ? 'bg-white text-brand-800 shadow-soft'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {value === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            {notice && (
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800" role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
              </p>
            )}

            <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
              {mode === 'signup' && (
                <div>
                  <label htmlFor="login-name" className="label">Full name</label>
                  <input
                    id="login-name"
                    type="text"
                    className="input-field"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="label">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-invalid={!!error}
                />
              </div>

              <div>
                <label htmlFor="login-password" className="label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  aria-invalid={!!error}
                  aria-describedby={mode === 'signup' ? 'login-password-hint' : undefined}
                />
                {mode === 'signup' && (
                  <p id="login-password-hint" className="mt-1.5 text-xs text-ink-500">
                    At least 8 characters.
                  </p>
                )}
              </div>

              {error && (
                <p className="field-error flex items-center gap-1.5" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Please wait…</>
                ) : mode === 'signin' ? (
                  <><LogIn className="h-4 w-4" /> Sign in</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Create account</>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-ink-500">
            Staff member?{' '}
            <button
              type="button"
              onClick={() => navigate(PATHS.adminLogin)}
              className="font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
              Go to admin sign in
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
