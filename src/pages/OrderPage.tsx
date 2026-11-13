import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingBasket,
  Leaf,
  Apple,
  Milk,
  Minus,
  Plus,
  Truck,
  CalendarClock,
  Sun,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Tag,
  MapPin,
  Lock,
} from 'lucide-react';
import { supabase, type Product, type OrderMode, type OrderItem } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type Cart = Record<string, number>; // productId -> quantity

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<OrderMode>('next_day');
  const [cart, setCart] = useState<Cart>({});
  const [step, setStep] = useState<'browse' | 'checkout' | 'done'>('browse');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id,name,category,image_url,unit,available_today,display_order')
          .order('display_order', { ascending: true });
        if (!active) return;
        if (error) throw error;
        setProducts((data ?? []) as Product[]);
      } catch (e) {
        console.error(e);
        setLoadError('We could not load the product catalogue. Please refresh the page.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // When switching to same-day, drop unavailable items from the cart.
  useEffect(() => {
    if (mode !== 'same_day') return;
    setCart((c) => {
      const next: Cart = {};
      let changed = false;
      for (const [id, qty] of Object.entries(c)) {
        const p = products.find((x) => x.id === id);
        if (p && p.available_today) {
          next[id] = qty;
        } else {
          changed = true;
        }
      }
      return changed ? next : c;
    });
  }, [mode, products]);

  const grouped = useMemo(
    () => ({
      vegetable: products.filter((p) => p.category === 'vegetable'),
      fruit: products.filter((p) => p.category === 'fruit'),
      milk: products.filter((p) => p.category === 'milk'),
    }),
    [products]
  );

  const productById = useMemo(() => {
    const m: Record<string, Product> = {};
    products.forEach((p) => (m[p.id] = p));
    return m;
  }, [products]);

  const cartItems: OrderItem[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({
          id,
          name: productById[id]?.name ?? 'Item',
          unit: productById[id]?.unit ?? 'unit',
          quantity: qty,
        })),
    [cart, productById]
  );

  const itemCount = cartItems.length;
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  const isSelectable = (p: Product) => mode === 'next_day' || p.available_today;

  const setQty = (id: string, qty: number) => {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.round(qty * 100) / 100;
      return next;
    });
  };
  const stepQty = (id: string, delta: number, unit: string) => {
    const step = unit === 'litre' ? 0.5 : unit === 'dozen' ? 1 : 0.5;
    const current = cart[id] ?? 0;
    setQty(id, current + delta * step);
  };

  if (step === 'done') {
    return <OrderConfirmed onReset={() => { setCart({}); setStep('browse'); }} mode={mode} />;
  }

  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" aria-hidden />
        <div className="container-page py-10 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
            <ShoppingBasket className="h-3.5 w-3.5" /> JVLSD-FD Fresh Daily · Order
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Order fresh vegetables, fruits &amp; milk.
          </h1>
          <p className="mt-3 max-w-2xl text-brand-100">
            Choose your mode, pick your products, and check out. Pre-orders help us plan
            procurement and reduce waste.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div>
            {loadError && (
              <div className="rounded-2xl bg-red-50 p-5 text-red-700">{loadError}</div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-20 text-ink-500">
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                <span className="ml-3">Loading products…</span>
              </div>
            )}

            {!loading && !loadError && (
              <>
                {step === 'browse' && (
                  <>
                    {/* Mode toggle */}
                    <ModeToggle mode={mode} onChange={setMode} />

                    {/* Offer banner */}
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-gold-50 p-4 text-gold-900">
                      <Tag className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                      <p className="text-sm">
                        <span className="font-semibold">Introductory offer:</span> 20% off your
                        first Fresh Daily order. Final promotional rules will be confirmed
                        before going live.
                      </p>
                    </div>

                    {/* Products */}
                    <div className="mt-8 space-y-10">
                      <CategoryGroup
                        icon={Leaf}
                        title="Vegetables"
                        products={grouped.vegetable}
                        mode={mode}
                        cart={cart}
                        onStep={stepQty}
                        onSet={setQty}
                        isSelectable={isSelectable}
                      />
                      <CategoryGroup
                        icon={Apple}
                        title="Fruits"
                        products={grouped.fruit}
                        mode={mode}
                        cart={cart}
                        onStep={stepQty}
                        onSet={setQty}
                        isSelectable={isSelectable}
                      />
                      <CategoryGroup
                        icon={Milk}
                        title="Milk"
                        products={grouped.milk}
                        mode={mode}
                        cart={cart}
                        onStep={stepQty}
                        onSet={setQty}
                        isSelectable={isSelectable}
                      />
                    </div>
                  </>
                )}

                {step === 'checkout' && (
                  <Checkout
                    mode={mode}
                    cartItems={cartItems}
                    onBack={() => setStep('browse')}
                    onPlaced={() => setStep('done')}
                  />
                )}
              </>
            )}
          </div>

          {/* Cart summary */}
          <aside className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <ShoppingBasket className="h-5 w-5 text-brand-600" /> Your basket
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
                    mode === 'next_day'
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-gold-100 text-gold-800'
                  }`}
                >
                  {mode === 'next_day' ? <CalendarClock className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                  {mode === 'next_day' ? 'Next-day pre-order' : 'Same-day order'}
                </span>
                <span className="text-ink-500">
                  · {itemCount} item{itemCount === 1 ? '' : 's'}
                </span>
              </div>

              {itemCount === 0 ? (
                <p className="mt-5 text-sm text-ink-500">
                  Pick products from the catalogue to add them here.
                </p>
              ) : (
                <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                  {cartItems.map((it) => (
                    <li key={it.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900">{it.name}</p>
                        <p className="text-xs text-ink-500">
                          {it.quantity} {it.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => setQty(it.id, 0)}
                        className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${it.name}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 border-t border-ink-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">Total items</span>
                  <span className="font-bold text-ink-900">{itemCount}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-ink-600">Total quantity</span>
                  <span className="font-bold text-ink-900">{totalQty}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                  <Sun className="h-4 w-4 text-gold-600" />
                  Expected delivery:{' '}
                  <span className="font-semibold">
                    {fmtDate(mode === 'next_day' ? tomorrowISO() : todayISO())}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep('checkout')}
                disabled={itemCount === 0}
                className="btn-primary mt-5 w-full py-3"
              >
                Proceed to checkout <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
                <Lock className="h-3 w-3" /> Payment is handled at delivery / per agreed scope.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: OrderMode; onChange: (m: OrderMode) => void }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <p className="text-sm font-semibold text-ink-800">Choose your ordering mode</p>
      <div
        className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-ink-100 p-1"
        role="radiogroup"
        aria-label="Ordering mode"
      >
        <ModeButton
          active={mode === 'next_day'}
          onClick={() => onChange('next_day')}
          icon={CalendarClock}
          title="Next-day pre-order"
          sub="Tomorrow morning · all products selectable"
        />
        <ModeButton
          active={mode === 'same_day'}
          onClick={() => onChange('same_day')}
          icon={Truck}
          title="Same-day order"
          sub="Today · within 3 km, available items only"
        />
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-all ${
        active ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600 hover:text-ink-800'
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 ${active ? 'text-brand-600' : 'text-ink-400'}`} />
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">{sub}</span>
      </span>
    </button>
  );
}

function CategoryGroup({
  icon: Icon,
  title,
  products,
  mode,
  cart,
  onStep,
  onSet,
  isSelectable,
}: {
  icon: React.ElementType;
  title: string;
  products: Product[];
  mode: OrderMode;
  cart: Cart;
  onStep: (id: string, delta: number, unit: string) => void;
  onSet: (id: string, qty: number) => void;
  isSelectable: (p: Product) => boolean;
}) {
  if (products.length === 0) return null;
  return (
    <div>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-950">
        <Icon className="h-5 w-5 text-brand-600" /> {title}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const selectable = isSelectable(p);
          const qty = cart[p.id] ?? 0;
          return (
            <div
              key={p.id}
              className={`group overflow-hidden rounded-2xl border bg-white transition-all ${
                selectable
                  ? qty > 0
                    ? 'border-brand-400 shadow-card'
                    : 'border-ink-100 hover:border-brand-200'
                  : 'border-ink-100 opacity-60'
              }`}
              aria-disabled={!selectable}
            >
              <div className="relative h-32 w-full overflow-hidden bg-ink-50">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                      selectable ? 'group-hover:scale-105' : 'grayscale'
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-300">
                    <Icon className="h-8 w-8" />
                  </div>
                )}
                {!selectable && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/40">
                    <span className="rounded-full bg-ink-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Not available today
                    </span>
                  </span>
                )}
                {qty > 0 && selectable && (
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

                {selectable ? (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-ink-200 bg-white">
                      <button
                        type="button"
                        onClick={() => onStep(p.id, -1, p.unit)}
                        className="flex h-9 w-9 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-l-lg"
                        aria-label={`Decrease ${p.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        inputMode="decimal"
                        className="h-9 w-14 border-x border-ink-200 text-center text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        value={qty || ''}
                        placeholder="0"
                        onChange={(e) => onSet(p.id, Number(e.target.value) || 0)}
                        aria-label={`${p.name} quantity in ${p.unit}`}
                      />
                      <button
                        type="button"
                        onClick={() => onStep(p.id, 1, p.unit)}
                        className="flex h-9 w-9 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-r-lg"
                        aria-label={`Increase ${p.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-ink-500">{p.unit}</span>
                  </div>
                ) : (
                  mode === 'same_day' ? (
                    <p className="mt-3 text-xs text-ink-500">
                      Switch to <span className="font-semibold text-brand-700">next-day pre-order</span> to select.
                    </p>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Checkout({
  mode,
  cartItems,
  onBack,
  onPlaced,
}: {
  mode: OrderMode;
  cartItems: OrderItem[];
  onBack: () => void;
  onPlaced: () => void;
}) {
  const [info, setInfo] = useState({
    customer_name: '',
    mobile: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();

  const deliveryDate = mode === 'next_day' ? tomorrowISO() : todayISO();

  const update = (k: keyof typeof info, v: string) => {
    setInfo((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!info.customer_name.trim()) e.customer_name = 'Please enter your name.';
    if (!info.mobile.trim()) e.mobile = 'Please enter your mobile number.';
    else if (!/^[+\d][\d\s-]{7,15}$/.test(info.mobile.trim())) e.mobile = 'Please enter a valid mobile number.';
    if (!info.address.trim()) e.address = 'Please enter your delivery address.';
    return e;
  };

  const placeOrder = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.from('orders').insert({
        customer_name: info.customer_name.trim(),
        mobile: info.mobile.trim(),
        address: info.address.trim(),
        mode,
        items: cartItems,
        expected_delivery: deliveryDate,
        notes: info.notes.trim() || null,
        user_id: user?.id ?? null,
      });
      if (error) throw error;
      onPlaced();
    } catch (err) {
      console.error(err);
      setSubmitError('We could not place your order just now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={placeOrder} noValidate>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </button>

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-950 sm:text-3xl">Checkout</h1>

      <div className="mt-5 rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
          <ShoppingBasket className="h-4 w-4 text-brand-600" /> Order summary
        </h2>
        <ul className="mt-4 divide-y divide-ink-100">
          {cartItems.map((it) => (
            <li key={it.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-semibold text-ink-900">{it.name}</span>
              <span className="text-ink-600">{it.quantity} {it.unit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Ordering mode</p>
            <p className="mt-1 font-display font-bold text-ink-900">
              {mode === 'next_day' ? 'Next-day pre-order' : 'Same-day order'}
            </p>
          </div>
          <div className="rounded-xl bg-gold-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-700">
              <Sun className="h-3.5 w-3.5" /> Expected delivery
            </p>
            <p className="mt-1 font-display font-bold text-ink-900">{fmtDate(deliveryDate)}</p>
            <p className="text-xs text-ink-500">
              {mode === 'next_day' ? 'Tomorrow morning' : 'Today, within 3 km'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink-900">Delivery details</h2>
        {submitError && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
          </div>
        )}
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="co-name">Full name <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-name"
              className="input-field"
              value={info.customer_name}
              onChange={(e) => update('customer_name', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.customer_name}
              autoComplete="name"
            />
            {errors.customer_name && <p className="field-error" role="alert">{errors.customer_name}</p>}
          </div>
          <div>
            <label className="label" htmlFor="co-mobile">Mobile number <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-mobile"
              type="tel"
              className="input-field"
              value={info.mobile}
              onChange={(e) => update('mobile', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.mobile}
              autoComplete="tel"
              placeholder="+91 90000 00000"
            />
            {errors.mobile && <p className="field-error" role="alert">{errors.mobile}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="co-address">Delivery address <span className="text-red-600" aria-hidden>*</span></label>
            <textarea
              id="co-address"
              rows={2}
              className="input-field resize-y"
              value={info.address}
              onChange={(e) => update('address', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.address}
              placeholder="House / flat, street, landmark, city, PIN"
            />
            {errors.address && <p className="field-error" role="alert">{errors.address}</p>}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
              <MapPin className="h-3.5 w-3.5" /> Same-day delivery is available within 3 km.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="co-notes">Order notes <span className="text-ink-400 font-normal">(optional)</span></label>
            <textarea
              id="co-notes"
              rows={2}
              className="input-field resize-y"
              value={info.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Any instructions for our delivery team"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-ink-500">
          By placing this order you agree to be contacted for delivery coordination.
        </p>
        <button type="submit" className="btn-primary px-6 py-3" disabled={submitting}>
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</>
          ) : (
            <>Confirm order <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </form>
  );
}

function OrderConfirmed({ onReset, mode }: { onReset: () => void; mode: OrderMode }) {
  return (
    <div className="pt-[calc(var(--header-h)+4rem)]">
      <div className="container-page">
        <div className="mx-auto max-w-xl rounded-3xl border border-brand-200 bg-white p-8 text-center shadow-lift animate-scale-in sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-950 sm:text-3xl">Order placed!</h1>
          <p className="mt-3 text-ink-600">
            Thank you. Your{' '}
            <strong className="font-semibold text-ink-900">
              {mode === 'next_day' ? 'next-day pre-order' : 'same-day order'}
            </strong>{' '}
            has been received. Our team will confirm availability and coordinate your delivery.
          </p>
          <div className="mt-6 rounded-2xl bg-brand-50 p-4 text-left">
            <p className="flex items-center gap-2 text-sm text-brand-800">
              <Sun className="h-4 w-4 text-gold-600" />
              Expected delivery:{' '}
              <span className="font-semibold">
                {fmtDate(mode === 'next_day' ? tomorrowISO() : todayISO())}
              </span>
            </p>
          </div>
          <button onClick={onReset} className="btn-primary mt-8 px-6 py-3">
            Place another order
          </button>
        </div>
      </div>
    </div>
  );
}
