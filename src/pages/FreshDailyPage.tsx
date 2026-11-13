import { useEffect, useMemo, useState } from 'react';
import {
  Leaf,
  Apple,
  Milk,
  CheckCircle2,
  AlertCircle,
  Send,
  Minus,
  Plus,
  Truck,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import {
  fetchProducts,
  submitSurvey,
  type Product,
  type SelectionItem
} from '@/lib/firestoreService';

type Freq = SelectionItem['frequency'];
const FREQS: { value: Freq; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one-time', label: 'One-time' },
];

type CustomerInfo = {
  customer_name: string;
  mobile: string;
  address: string;
  family_members: string;
  delivery_preference: string;
  notes: string;
};

const EMPTY: CustomerInfo = {
  customer_name: '',
  mobile: '',
  address: '',
  family_members: '1',
  delivery_preference: 'Morning (7–9 AM)',
  notes: '',
};

export function FreshDailyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [info, setInfo] = useState<CustomerInfo>(EMPTY);
  const [selections, setSelections] = useState<Record<string, { quantity: string; frequency: Freq }>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchProducts();
        if (!active) return;
        setProducts(data);
      } catch (e) {
        console.error(e);
        setLoadError('We could not load the product list. Please refresh the page.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    return {
      vegetable: products.filter((p) => p.category === 'vegetable'),
      fruit: products.filter((p) => p.category === 'fruit'),
      milk: products.filter((p) => p.category === 'milk'),
    };
  }, [products]);

  const selectedCount = Object.values(selections).filter((s) => Number(s.quantity) > 0).length;

  const setQty = (id: string, qty: string) => {
    setSelections((s) => ({
      ...s,
      [id]: { quantity: qty, frequency: s[id]?.frequency ?? 'weekly' },
    }));
  };
  const setFreq = (id: string, frequency: Freq) => {
    setSelections((s) => ({
      ...s,
      [id]: { quantity: s[id]?.quantity ?? '', frequency },
    }));
  };
  const stepQty = (id: string, delta: number) => {
    const current = Number(selections[id]?.quantity || 0);
    const next = Math.max(0, Math.round((current + delta) * 100) / 100);
    setQty(id, next === 0 ? '' : String(next));
  };

  const updateInfo = (field: keyof CustomerInfo, value: string) => {
    setInfo((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!info.customer_name.trim()) e.customer_name = 'Please enter your name.';
    if (!info.mobile.trim()) e.mobile = 'Please enter your mobile number.';
    else if (!/^[+\d][\d\s-]{7,15}$/.test(info.mobile.trim())) e.mobile = 'Please enter a valid mobile number.';
    if (!info.address.trim()) e.address = 'Please enter your delivery address.';
    const fam = Number(info.family_members);
    if (!info.family_members || isNaN(fam) || fam < 1) e.family_members = 'Enter at least 1.';
    if (selectedCount === 0) e.selections = 'Select at least one product with a quantity.';
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const firstErr = document.querySelector('[aria-invalid="true"], [data-error="true"]');
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const items: SelectionItem[] = products
      .filter((p) => Number(selections[p.id]?.quantity || 0) > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        quantity: Number(selections[p.id].quantity),
        frequency: selections[p.id].frequency,
      }));

    setSubmitting(true);
    setStatus('idle');
    try {
      await submitSurvey({
        customer_name: info.customer_name.trim(),
        mobile: info.mobile.trim(),
        address: info.address.trim(),
        family_members: Number(info.family_members),
        delivery_preference: info.delivery_preference,
        selections: items,
        notes: info.notes.trim() || undefined,
      });
      setStatus('success');
      setInfo(EMPTY);
      setSelections({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      {/* Header / branding */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" aria-hidden />
        <div className="container-page py-12 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
            JVLSD-FD Fresh Daily · through SHAKWALA
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Introducing Fresh Veg, Fruits &amp; Milk — Daily Direct Delivery
          </h1>
          <p className="mt-4 max-w-2xl text-brand-100">
            By Jagatpati Vigneshwara LSD (JVLSD). Tell us your household's fresh requirements
            and we'll plan procurement around your needs — reducing waste and keeping
            everything genuinely fresh.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white">
              <CalendarClock className="h-4 w-4 text-gold-300" /> Plan one day ahead
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white">
              <Truck className="h-4 w-4 text-gold-300" /> Doorstep delivery
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white">
              <Leaf className="h-4 w-4 text-gold-300" /> Less waste, fairer prices
            </span>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-page">
          {status === 'success' && (
            <div role="status" className="mb-8 flex items-start gap-3 rounded-2xl bg-brand-50 p-5 text-brand-800 animate-fade-up">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
              <div>
                <p className="font-semibold">Thank you — your Fresh Daily survey has been submitted.</p>
                <p className="mt-1 text-sm text-brand-700">
                  Our team will review your household preferences and reach out to set up your
                  delivery. You can take the survey again any time if your needs change.
                </p>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div role="alert" className="mb-8 flex items-start gap-3 rounded-2xl bg-red-50 p-5 text-red-700">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0" />
              <p className="text-sm">
                We could not submit your survey just now. Please try again in a moment.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-24 text-ink-500">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              <span className="ml-3">Loading fresh products…</span>
            </div>
          )}

          {loadError && (
            <div className="rounded-2xl bg-red-50 p-6 text-red-700">{loadError}</div>
          )}

          {!loading && !loadError && (
            <form onSubmit={onSubmit} noValidate>
              {/* Customer information */}
              <Section
                step="1"
                title="Your information"
                desc="So we know where to deliver and how to plan for your household."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" required error={errors.customer_name}>
                    <input
                      className="input-field"
                      value={info.customer_name}
                      onChange={(e) => updateInfo('customer_name', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.customer_name}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Mobile number" required error={errors.mobile}>
                    <input
                      type="tel"
                      className="input-field"
                      value={info.mobile}
                      onChange={(e) => updateInfo('mobile', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.mobile}
                      autoComplete="tel"
                      placeholder="+91 90000 00000"
                    />
                  </Field>
                  <Field label="Delivery address" required error={errors.address} className="sm:col-span-2">
                    <textarea
                      rows={2}
                      className="input-field resize-y"
                      value={info.address}
                      onChange={(e) => updateInfo('address', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.address}
                      placeholder="House / flat, street, landmark, city, PIN"
                    />
                  </Field>
                  <Field label="Number of family members" required error={errors.family_members}>
                    <input
                      type="number"
                      min={1}
                      className="input-field"
                      value={info.family_members}
                      onChange={(e) => updateInfo('family_members', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.family_members}
                    />
                  </Field>
                  <Field label="Delivery preference">
                    <select
                      className="input-field"
                      value={info.delivery_preference}
                      onChange={(e) => updateInfo('delivery_preference', e.target.value)}
                    >
                      <option>Morning (7–9 AM)</option>
                      <option>Morning (9–11 AM)</option>
                      <option>Evening (5–7 PM)</option>
                      <option>Any time</option>
                    </select>
                  </Field>
                </div>
              </Section>

              {/* Vegetables */}
              <ProductSection
                step="2"
                icon={Leaf}
                title="Vegetable preferences"
                desc="Select the vegetables you'd like, with quantity and how often you need them."
                products={grouped.vegetable}
                selections={selections}
                onQty={setQty}
                onFreq={setFreq}
                onStep={stepQty}
              />

              {/* Fruits */}
              <ProductSection
                step="3"
                icon={Apple}
                title="Fruit preferences"
                desc="Pick the fruits your household enjoys, with quantity and frequency."
                products={grouped.fruit}
                selections={selections}
                onQty={setQty}
                onFreq={setFreq}
                onStep={stepQty}
              />

              {/* Milk */}
              <ProductSection
                step="4"
                icon={Milk}
                title="Milk requirements"
                desc="Tell us your daily milk requirement and preferred type."
                products={grouped.milk}
                selections={selections}
                onQty={setQty}
                onFreq={setFreq}
                onStep={stepQty}
              />

              {/* Notes + submit */}
              <Section
                step="5"
                title="Anything else?"
                desc="Optional notes about preferences, packaging, or delivery instructions."
              >
                <Field label="Notes" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    className="input-field resize-y"
                    value={info.notes}
                    onChange={(e) => updateInfo('notes', e.target.value)}
                    placeholder="e.g. Please pack spinach separately. Prefer unripe bananas."
                  />
                </Field>
              </Section>

              {errors.selections && (
                <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">
                  {errors.selections}
                </p>
              )}

              <div className="sticky bottom-4 z-10 mt-6">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white/95 p-4 shadow-lift backdrop-blur">
                  <p className="text-sm text-ink-600">
                    <span className="font-bold text-ink-900">{selectedCount}</span> product{selectedCount === 1 ? '' : 's'} selected
                  </p>
                  <button type="submit" className="btn-primary px-6 py-3" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                    ) : (
                      <><Send className="h-4 w-4" /> Submit survey</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Section({
  step,
  title,
  desc,
  children,
}: {
  step: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 font-display text-sm font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950 sm:text-2xl">{title}</h2>
          {desc && <p className="mt-1 text-sm text-ink-600">{desc}</p>}
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label">
        {label} {required && <span className="text-red-600" aria-hidden>*</span>}
      </label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

function ProductSection({
  step,
  icon: Icon,
  title,
  desc,
  products,
  selections,
  onQty,
  onFreq,
  onStep,
}: {
  step: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  products: Product[];
  selections: Record<string, { quantity: string; frequency: Freq }>;
  onQty: (id: string, qty: string) => void;
  onFreq: (id: string, freq: Freq) => void;
  onStep: (id: string, delta: number) => void;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 font-display text-sm font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-950 sm:text-2xl">
            <Icon className="h-5 w-5 text-brand-600" /> {title}
          </h2>
          <p className="mt-1 text-sm text-ink-600">{desc}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const qty = selections[p.id]?.quantity || '';
          const freq = selections[p.id]?.frequency ?? 'weekly';
          const active = Number(qty) > 0;
          return (
            <div
              key={p.id}
              className={`overflow-hidden rounded-2xl border bg-white transition-all ${
                active
                  ? 'border-brand-400 shadow-card'
                  : 'border-ink-100 hover:border-brand-200'
              }`}
            >
              <div className="relative h-32 w-full overflow-hidden bg-ink-50">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                      active ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-300">
                    <Icon className="h-8 w-8" />
                  </div>
                )}
                {active && (
                  <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-sm font-bold text-ink-900">{p.name}</h3>
                  <span className="text-[11px] font-medium text-ink-500">per {p.unit}</span>
                </div>

                {/* Quantity stepper */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-ink-200 bg-white">
                    <button
                      type="button"
                      onClick={() => onStep(p.id, -0.5)}
                      className="flex h-9 w-9 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-l-lg"
                      aria-label={`Decrease ${p.name} quantity`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      inputMode="decimal"
                      className="h-9 w-14 border-x border-ink-200 text-center text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      value={qty}
                      placeholder="0"
                      onChange={(e) => onQty(p.id, e.target.value)}
                      aria-label={`${p.name} quantity in ${p.unit}`}
                    />
                    <button
                      type="button"
                      onClick={() => onStep(p.id, 0.5)}
                      className="flex h-9 w-9 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-r-lg"
                      aria-label={`Increase ${p.name} quantity`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-ink-500">{p.unit}</span>
                </div>

                {/* Frequency */}
                <div className="mt-3">
                  <span className="sr-only" id={`freq-${p.id}`}>Frequency for {p.name}</span>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={`freq-${p.id}`}>
                    {FREQS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        role="radio"
                        aria-checked={freq === f.value}
                        onClick={() => onFreq(p.id, f.value)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          freq === f.value
                            ? 'bg-brand-600 text-white'
                            : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
