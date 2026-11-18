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
  HeartPulse,
  AlertTriangle,
  Info,
  Users,
  Compass,
} from 'lucide-react';
import {
  fetchProducts,
  submitSurvey,
  type Product,
  type SelectionItem
} from '@/lib/firestoreService';
import { SEASONAL_CATALOGUE, type Season, type SeasonalProduce } from '@/data/seasonalProduce';

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
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  digipin: string;
  family_members: string;
  delivery_preference: string;
  notes: string;
};

const EMPTY: CustomerInfo = {
  customer_name: '',
  mobile: '',
  address_line: '',
  city: 'AHMEDABAD',
  state: 'GUJARAT',
  country: 'INDIA',
  postal_code: '',
  digipin: '',
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
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

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
    const list = selectedSeason === 'all'
      ? products
      : products.filter((p) => {
          const match = SEASONAL_CATALOGUE.find(
            (sp) => sp.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) ||
                    p.name.toLowerCase().includes(sp.name.toLowerCase().split(' ')[0])
          );
          return match ? match.season === selectedSeason : selectedSeason === 'all_year';
        });

    return {
      vegetable: list.filter((p) => p.category === 'vegetable'),
      fruit: list.filter((p) => p.category === 'fruit'),
      milk: list.filter((p) => p.category === 'milk'),
    };
  }, [products, selectedSeason]);

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

  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');

  const updateInfo = (field: keyof CustomerInfo, value: string) => {
    // Requirements: All Customer profile details capture strictly in CAPITAL LETTERS
    const sanitized = field === 'delivery_preference' || field === 'notes' ? value : value.toUpperCase();
    setInfo((f) => ({ ...f, [field]: sanitized }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!info.customer_name.trim()) e.customer_name = 'Please enter your full name (CAPITAL LETTERS).';
    if (!info.mobile.trim()) e.mobile = 'Please enter your 10-digit mobile number.';
    else if (!/^[6-9]\d{9}$/.test(info.mobile.trim().replace(/\D/g, ''))) {
      e.mobile = 'Mobile number strictly 10 digits (India).';
    }
    if (!info.address_line.trim()) e.address_line = 'Please enter your street address / apartment.';
    if (!info.postal_code.trim()) e.postal_code = 'Enter 6-digit PIN code.';
    const fam = Number(info.family_members);
    if (!info.family_members || isNaN(fam) || fam < 1) e.family_members = 'Enter at least 1 family member.';
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

    const fullStructuredAddress = `${info.address_line.trim()}, ${info.city.trim()}, ${info.state.trim()}, ${info.country.trim()} - PIN: ${info.postal_code.trim()}${info.digipin.trim() ? ` [DIGIPIN: ${info.digipin.trim()}]` : ''}`;

    setSubmitting(true);
    setStatus('idle');
    try {
      await submitSurvey({
        customer_name: info.customer_name.trim(),
        mobile: info.mobile.trim(),
        address: fullStructuredAddress,
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2e1f] via-[#123d29] to-[#071d13] text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute left-1/3 -bottom-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" aria-hidden />
        <div className="container-page py-12 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-md">
            JVLSD-FD Fresh Daily · through SHAKWALA
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
            Introducing Fresh Veg, Fruits &amp; Milk — Daily Direct Delivery
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-emerald-50/95 font-medium">
            By Jagatpati Vigneshwara LSD (JVLSD). Tell us your household's fresh requirements
            and we'll plan procurement around your needs — reducing waste and keeping
            everything genuinely fresh.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-medium text-white shadow-soft backdrop-blur-sm">
              <CalendarClock className="h-4 w-4 text-gold-300" /> Plan one day ahead
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-medium text-white shadow-soft backdrop-blur-sm">
              <Truck className="h-4 w-4 text-gold-300" /> Doorstep delivery
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-medium text-white shadow-soft backdrop-blur-sm">
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
                title="Your Information & Family Profile"
                desc="Structured address & DIGIPIN capture (saved in capital letters as required for business billing and route planning)."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name (Capital Letters)" required error={errors.customer_name}>
                    <input
                      className="input-field font-medium uppercase tracking-wide"
                      value={info.customer_name}
                      onChange={(e) => updateInfo('customer_name', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.customer_name}
                      autoComplete="name"
                      placeholder="E.G. RAMESH PATEL"
                    />
                  </Field>
                  <Field label="Mobile Number (10 Digits India)" required error={errors.mobile}>
                    <input
                      type="tel"
                      className="input-field"
                      value={info.mobile}
                      onChange={(e) => updateInfo('mobile', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.mobile}
                      autoComplete="tel"
                      placeholder="98250 12345"
                      maxLength={14}
                    />
                  </Field>

                  <Field label="Street / House / Society Address" required error={errors.address_line} className="sm:col-span-2">
                    <input
                      type="text"
                      className="input-field uppercase tracking-wide"
                      value={info.address_line}
                      onChange={(e) => updateInfo('address_line', e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.address_line}
                      placeholder="B-402, SHIVAM RESIDENCY, SATELLITE ROAD"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-4">
                    <Field label="City" required>
                      <input
                        type="text"
                        className="input-field uppercase tracking-wide"
                        value={info.city}
                        onChange={(e) => updateInfo('city', e.target.value)}
                      />
                    </Field>
                    <Field label="State" required>
                      <input
                        type="text"
                        className="input-field uppercase tracking-wide"
                        value={info.state}
                        onChange={(e) => updateInfo('state', e.target.value)}
                      />
                    </Field>
                    <Field label="Country" required>
                      <input
                        type="text"
                        className="input-field uppercase tracking-wide"
                        value={info.country}
                        onChange={(e) => updateInfo('country', e.target.value)}
                      />
                    </Field>
                    <Field label="Postal PIN Code" required error={errors.postal_code}>
                      <input
                        type="text"
                        maxLength={6}
                        className="input-field uppercase tracking-wide font-mono"
                        value={info.postal_code}
                        onChange={(e) => updateInfo('postal_code', e.target.value)}
                        placeholder="380015"
                      />
                    </Field>
                  </div>

                  <Field label="DIGIPIN / Postal Geo-Code (Default Capture)" className="sm:col-span-2">
                    <div className="relative">
                      <input
                        type="text"
                        className="input-field uppercase tracking-wide font-mono"
                        value={info.digipin}
                        onChange={(e) => updateInfo('digipin', e.target.value)}
                        placeholder="E.G. 380-015-GJ-04"
                      />
                      <span className="mt-1 block text-[11px] text-ink-500">
                        Postal DIGIPIN ensures doorstep delivery accuracy without inaccurate third-party map pins.
                      </span>
                    </div>
                  </Field>

                  <Field label="Number of Family Members" required error={errors.family_members}>
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
                  <Field label="Delivery Preference">
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

              {/* Seasonal Produces & Health Guidance Selection */}
              <div className="mt-10 rounded-3xl border border-gold-400/30 bg-gradient-to-r from-emerald-950 via-[#0e3321] to-[#071f14] p-5 text-white shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
                      <HeartPulse className="h-3.5 w-3.5" /> Seasonal Health &amp; Botanical Guidance
                    </span>
                    <h2 className="mt-2 font-display text-lg sm:text-xl font-bold">
                      Ayurvedic &amp; Seasonal Schedule Breakdown
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-emerald-100/80">
                      Filter produce curated specifically for climate adaptation, nutritional balance, and dietary medical advisories.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: 'all_year', label: 'બારેમાસ (12 Months)' },
                      { id: 'winter', label: 'શિયાળો (Winter)' },
                      { id: 'summer', label: 'ઉનાળો (Summer)' },
                      { id: 'monsoon', label: 'ચોમાસું (Monsoon)' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSeason(s.id as Season | 'all')}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                          selectedSeason === s.id
                            ? 'bg-gold-500 text-ink-950 shadow-soft'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                onPreview={setPreviewProduct}
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
                onPreview={setPreviewProduct}
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
                onPreview={setPreviewProduct}
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

          {/* Survey Product Image Preview Lightbox Modal */}
          {previewProduct && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md animate-fade-in"
              onClick={() => setPreviewProduct(null)}
            >
              <div
                className="relative max-w-lg w-full overflow-hidden rounded-3xl bg-white shadow-2xl animate-scale-in border border-ink-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink-800 shadow-lift backdrop-blur-md transition-all hover:bg-white hover:scale-110"
                  aria-label="Close preview"
                >
                  ✕
                </button>
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-ink-100">
                  {previewProduct.image_url ? (
                    <img
                      src={previewProduct.image_url}
                      alt={previewProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-300">
                      <Leaf className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent p-4 text-white">
                    <span className="rounded-full bg-brand-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      {previewProduct.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-bold text-ink-950">
                    {previewProduct.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-ink-600">
                    Standard unit: <span className="font-semibold text-ink-900">{previewProduct.unit}</span>
                  </p>
                  <div className="mt-6 flex justify-end pt-4 border-t border-ink-100">
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(null)}
                      className="btn-primary px-6 py-2 text-sm"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
  onPreview,
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
  onPreview?: (p: Product) => void;
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

      <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const qty = selections[p.id]?.quantity || '';
          const freq = selections[p.id]?.frequency ?? 'weekly';
          const active = Number(qty) > 0;
          // Find matching seasonal produce metadata if available
          const seasonalMatch = SEASONAL_CATALOGUE.find(
            (sp) => sp.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) ||
                    p.name.toLowerCase().includes(sp.name.toLowerCase().split(' ')[0])
          );

          return (
            <div
              key={p.id}
              className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 ${
                active
                  ? 'border-brand-400 shadow-soft ring-1 ring-brand-300'
                  : 'border-ink-100 hover:border-brand-200'
              }`}
            >
              <div>
                <div
                  className="relative h-44 sm:h-48 w-full overflow-hidden bg-ink-100 cursor-pointer group"
                  onClick={() => onPreview && onPreview(p)}
                  title="Click to view full preview"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        active ? 'scale-105' : ''
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
                  <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-sm">
                    🔍 View Preview
                  </span>
                  {active && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                  {seasonalMatch?.seasonLabel && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-emerald-950/85 px-2.5 py-1 text-[10px] font-bold text-gold-300 backdrop-blur-sm border border-gold-400/20 shadow-sm">
                      {seasonalMatch.seasonLabel}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-bold text-ink-900">{p.name}</h3>
                      {seasonalMatch?.vernacularName && (
                        <p className="text-[11px] font-medium text-brand-700">{seasonalMatch.vernacularName}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-ink-500">per {p.unit}</span>
                  </div>

                  {/* Clinical & Health Nutritional Advisories */}
                  {seasonalMatch?.medicalAdvisory && (
                    <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-[10px] sm:text-[11px] leading-tight text-amber-900 border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <span>{seasonalMatch.medicalAdvisory}</span>
                    </div>
                  )}
                  {seasonalMatch?.nutritionalNotes && !seasonalMatch?.medicalAdvisory && (
                    <p className="mt-2 text-[11px] leading-tight text-ink-500 line-clamp-2">
                      "{seasonalMatch.nutritionalNotes}"
                    </p>
                  )}
                </div>
              </div>
                      "{seasonalMatch.nutritionalNotes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                {/* Quantity stepper */}
                <div className="flex items-center gap-2">
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
