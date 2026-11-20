import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Globe2,
  Phone,
  Home,
  Check,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth, type SignUpInput } from '@/lib/auth';
import { navigate, PATHS } from '@/lib/router';
import type { UserAddress } from '@/lib/firestoreService';
import { MOCK_PROFILES, setMockModeActive } from '@/lib/mockData';

type Mode = 'signin' | 'signup';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
] as const;

const COUNTRY_CODES = [
  { code: '+91', country: 'India (IN)' },
  { code: '+1', country: 'USA / Canada' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
];

export function LoginPage() {
  const { user, profile, loading, signIn, signUp, signInMock } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');

  // Sign In States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up Multi-step Registration States (P3 Requirements)
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Personal & Vernacular, 2: Address & DIGIPIN, 3: Review & Confirm
  const [fullName, setFullName] = useState('');
  const [preferredLang, setPreferredLang] = useState<'en' | 'gu' | 'hi'>('en');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('');
  const [cityStdCode, setCityStdCode] = useState('');
  const [landline, setLandline] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Address Fields
  const [addressLabel, setAddressLabel] = useState('Primary Household');
  const [houseFlat, setHouseFlat] = useState('');
  const [buildingSociety, setBuildingSociety] = useState('');
  const [landmark, setLandmark] = useState('');
  const [areaRoad, setAreaRoad] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('380009');
  const [digipin, setDigipin] = useState('');

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
    setStep(1);
  };

  // Step 1 Validation
  const canAdvanceStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full customer name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (!mobile.trim() || mobile.trim().length < 10) return 'Please enter a valid 10-digit mobile number.';
    if (regPassword.length < 8) return 'Password must be at least 8 characters.';
    return null;
  };

  // Step 2 Validation
  const canAdvanceStep2 = () => {
    if (!houseFlat.trim()) return 'Please enter flat/house number.';
    if (!buildingSociety.trim()) return 'Please enter building or society name.';
    if (!areaRoad.trim()) return 'Please enter area or road details.';
    if (!city.trim()) return 'Please enter city.';
    if (!pincode.trim() || pincode.trim().length < 6) return 'Please enter a valid 6-digit PIN code.';
    return null;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      const err = canAdvanceStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = canAdvanceStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    }
  };

  const submitSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(trimmedEmail, password);
    if (result.error) setError(result.error);
    setSubmitting(false);
  };

  const submitRegistration = async () => {
    setError(null);
    setSubmitting(true);

    const initialAddress: UserAddress = {
      id: 'addr_' + Date.now(),
      label: addressLabel.trim() || 'Primary Household',
      house_flat: houseFlat.trim(),
      building_society: buildingSociety.trim(),
      landmark: landmark.trim() || undefined,
      area_road: areaRoad.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      pincode: pincode.trim(),
      digipin: digipin.trim() || undefined,
      is_primary: true,
    };

    const registrationPayload: SignUpInput = {
      fullName: fullName.trim().toUpperCase(), // Uppercase customer display rule
      email: email.trim(),
      password: regPassword,
      mobile: mobile.trim(),
      countryCode,
      landline: landline.trim() || undefined,
      cityStdCode: cityStdCode.trim() || undefined,
      preferredLanguage: preferredLang,
      initialAddress,
    };

    const result = await signUp(registrationPayload);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else if (!result.hasSession) {
      setNotice('Your JVLSD customer account is registered. Please sign in with your password.');
      setMode('signin');
      setStep(1);
      setPassword('');
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-brand-50/50 pb-20 pt-[calc(var(--header-h)+3rem)] sm:pb-28">
      <div className="container-page">
        <div className={`mx-auto transition-all duration-300 ${mode === 'signup' ? 'max-w-2xl' : 'max-w-md'}`}>
          <p className="eyebrow">JVLSD Customer Portal</p>
          <h1 className="section-title mt-3">
            {mode === 'signin' ? 'Welcome Back' : 'Customer Registration'}
          </h1>
          <p className="mt-3 text-ink-600">
            {mode === 'signin'
              ? 'Sign in to access your orders, household deliveries, and family hub.'
              : 'Register your household to unlock daily fresh farm deliveries and shared family ordering.'}
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
                  {value === 'signin' ? 'Sign In' : 'New Customer Registration'}
                </button>
              ))}
            </div>

            {notice && (
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800" role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
              </p>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={submitSignIn} className="mt-6 space-y-5" noValidate>
                <div>
                  <label htmlFor="login-email" className="label">Registered Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="name@example.com"
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
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <p className="field-error flex items-center gap-1.5" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </p>
                )}

                <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                  ) : (
                    <><LogIn className="h-4 w-4" /> Sign In</>
                  )}
                </button>
              </form>
            )}

            {/* MULTI-STEP SIGN UP FLOW (P3 SPECIFICATION) */}
            {mode === 'signup' && (
              <div className="mt-6">
                {/* Progress Indicators */}
                <div className="mb-6 flex items-center justify-between border-b border-ink-100 pb-4">
                  {[
                    { num: 1, title: 'Personal & Contact' },
                    { num: 2, title: 'Household Address' },
                    { num: 3, title: 'Profile Preview & Confirm' },
                  ].map((s) => (
                    <div key={s.num} className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          step === s.num
                            ? 'bg-brand-700 text-white shadow-soft'
                            : step > s.num
                            ? 'bg-emerald-600 text-white'
                            : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                      </span>
                      <span className={`hidden sm:inline text-xs font-semibold ${step === s.num ? 'text-ink-950 font-bold' : 'text-ink-500'}`}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Step 1: Personal & Vernacular */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="label">
                        Full Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="input-field uppercase tracking-wide font-medium"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value.toUpperCase())}
                        placeholder="ENTER FULL NAME (E.G. HARSHIL DAVE)"
                      />
                      <p className="mt-1 text-[11px] text-ink-500">Automatically formatted to uppercase for official invoices.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">Preferred Language</label>
                        <select
                          className="input-field"
                          value={preferredLang}
                          onChange={(e) => setPreferredLang(e.target.value as any)}
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>{l.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="input-field"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="harshil@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[130px_1fr]">
                      <div>
                        <label className="label">Country Code</label>
                        <select
                          className="input-field"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          className="input-field"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">Area / STD Code (Optional)</label>
                        <input
                          type="text"
                          className="input-field"
                          value={cityStdCode}
                          onChange={(e) => setCityStdCode(e.target.value)}
                          placeholder="e.g. 079 (Ahmedabad)"
                        />
                      </div>
                      <div>
                        <label className="label">Landline Number (Optional)</label>
                        <input
                          type="tel"
                          className="input-field"
                          value={landline}
                          onChange={(e) => setLandline(e.target.value)}
                          placeholder="e.g. 2630XXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        Account Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Household Address & DIGIPIN */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="label">Address Label</label>
                      <input
                        type="text"
                        className="input-field"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        placeholder="e.g. Primary Residence / Parents House"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">
                          Flat / House / Block No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={houseFlat}
                          onChange={(e) => setHouseFlat(e.target.value)}
                          placeholder="e.g. A-301"
                        />
                      </div>
                      <div>
                        <label className="label">
                          Building / Society Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={buildingSociety}
                          onChange={(e) => setBuildingSociety(e.target.value)}
                          placeholder="e.g. Goyal Intercity"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">Landmark</label>
                        <input
                          type="text"
                          className="input-field"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Drive-In Cinema"
                        />
                      </div>
                      <div>
                        <label className="label">
                          Road / Area Details <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={areaRoad}
                          onChange={(e) => setAreaRoad(e.target.value)}
                          placeholder="e.g. Drive-In Road, Thaltej"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="label">City <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="input-field"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">State <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="input-field"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">PIN Code <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className="input-field"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                          placeholder="380009"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">DIGIPIN (National Digital Address Pin)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={digipin}
                        onChange={(e) => setDigipin(e.target.value.toUpperCase())}
                        placeholder="e.g. GJ-380-DRV-301 (Optional)"
                      />
                      <p className="mt-1 text-[11px] text-ink-500">Government of India 10-character alphanumeric digital pin if known.</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Complete Profile Preview & Explicit Confirmation */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4 text-xs sm:text-sm">
                      <p className="font-bold text-ink-900 border-b border-ink-200/80 pb-2 flex items-center justify-between">
                        <span>Personal Details Preview</span>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs font-semibold text-brand-700 underline"
                        >
                          Edit
                        </button>
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-ink-700">
                        <div><span className="font-semibold text-ink-500">Name:</span> {fullName}</div>
                        <div><span className="font-semibold text-ink-500">Email:</span> {email}</div>
                        <div><span className="font-semibold text-ink-500">Mobile:</span> {countryCode} {mobile}</div>
                        <div><span className="font-semibold text-ink-500">Language:</span> {LANGUAGES.find((l) => l.code === preferredLang)?.label}</div>
                        {landline && <div><span className="font-semibold text-ink-500">Landline:</span> {cityStdCode ? `(${cityStdCode}) ` : ''}{landline}</div>}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-4 text-xs sm:text-sm">
                      <p className="font-bold text-ink-900 border-b border-ink-200/80 pb-2 flex items-center justify-between">
                        <span>Primary Household Address</span>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-xs font-semibold text-brand-700 underline"
                        >
                          Edit
                        </button>
                      </p>
                      <p className="mt-2 text-ink-800 leading-relaxed">
                        <strong>{addressLabel}:</strong> {houseFlat}, {buildingSociety}, {landmark ? landmark + ', ' : ''}{areaRoad}, {city}, {state} – {pincode}, {country}.
                      </p>
                      {digipin && (
                        <p className="mt-1 text-xs font-mono font-bold text-brand-800">
                          DIGIPIN: {digipin}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                      <p className="font-bold">Confirmation Checklist</p>
                      <p className="mt-1">
                        By clicking "Complete Registration", your account will be activated under Jagatpati Vigneshwara LSD LLP with full access to Morning Deliveries, Family Group ordering, and the Loyalty Ledger.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="field-error mt-4 flex items-center gap-1.5" role="alert">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </p>
                )}

                {/* Step Navigation Controls */}
                <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-ink-100">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => { setError(null); setStep((prev) => (prev - 1) as any); }}
                      className="btn-outline px-4 py-2 text-xs sm:text-sm flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  ) : <div />}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-primary px-6 py-2.5 text-xs sm:text-sm flex items-center gap-1.5"
                    >
                      Next Step <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitRegistration}
                      disabled={submitting}
                      className="btn-primary px-6 py-2.5 text-xs sm:text-sm flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Registering Profile…</>
                      ) : (
                        <><UserPlus className="h-4 w-4" /> Complete Registration</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-ink-500">
            Staff or Administrator?{' '}
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