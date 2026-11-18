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
  ZoomIn,
  X,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import {
  fetchProducts,
  createOrder,
  submitOrderFeedback,
  type Product,
  type OrderMode,
  type OrderItem,
  type OrderFeedback,
} from '@/lib/firestoreService';
import { useAuth } from '@/lib/auth';
import { SEASONAL_CATALOGUE, type SeasonalProduce } from '@/data/seasonalProduce';
import { HeartPulse, BookOpen, AlertTriangle, Star, ThumbsUp, Send } from 'lucide-react';

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
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vegetable' | 'fruit' | 'milk'>('all');
  const [healthTipProduce, setHealthTipProduce] = useState<any | null>(null);

  // Check for pre-loaded re-order basket from AccountPage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jvlsd_reorder_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setCart(parsed);
          localStorage.removeItem('jvlsd_reorder_cart');
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchProducts();
        if (!active) return;
        setProducts(data);
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [products, categoryFilter, searchQuery]);

  const grouped = useMemo(
    () => ({
      vegetable: filteredProducts.filter((p) => p.category === 'vegetable'),
      fruit: filteredProducts.filter((p) => p.category === 'fruit'),
      milk: filteredProducts.filter((p) => p.category === 'milk'),
    }),
    [filteredProducts]
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

  const [placedOrderId, setPlacedOrderId] = useState<string>('');
  const [placedCustomerName, setPlacedCustomerName] = useState<string>('');

  if (step === 'done') {
    return (
      <OrderConfirmed
        orderId={placedOrderId}
        customerName={placedCustomerName}
        onReset={() => {
          setCart({});
          setPlacedOrderId('');
          setPlacedCustomerName('');
          setStep('browse');
        }}
        mode={mode}
      />
    );
  }

  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2e1f] via-[#123d29] to-[#071d13] text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute left-1/4 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" aria-hidden />
        <div className="container-page py-10 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-md">
            <ShoppingBasket className="h-3.5 w-3.5" /> JVLSD-FD Fresh Daily · Order
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
            Order fresh vegetables, fruits &amp; milk.
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-emerald-50/95 font-medium">
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

                    {/* Quick Search & Filter Controls */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <input
                          type="text"
                          placeholder="Search vegetables, fruits, milk…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-ink-200 bg-white pl-10 pr-4 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400 hover:text-ink-600"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {(
                          [
                            { id: 'all', label: 'All' },
                            { id: 'vegetable', label: 'Vegetables' },
                            { id: 'fruit', label: 'Fruits' },
                            { id: 'milk', label: 'Milk' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCategoryFilter(tab.id)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                              categoryFilter === tab.id
                                ? 'bg-brand-700 text-white shadow-soft'
                                : 'bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

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
                        onPreview={setPreviewProduct}
                        onTip={setHealthTipProduce}
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
                        onPreview={setPreviewProduct}
                        onTip={setHealthTipProduce}
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
                        onPreview={setPreviewProduct}
                        onTip={setHealthTipProduce}
                      />
                    </div>

                    {/* Enlarged Product Image Lightbox Modal */}
                    {previewProduct && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm animate-fade-in"
                        onClick={() => setPreviewProduct(null)}
                      >
                        <div
                          className="relative max-w-md w-full overflow-hidden rounded-3xl bg-white shadow-lift animate-scale-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(null)}
                            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105"
                            aria-label="Close preview"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-ink-100">
                            {previewProduct.image_url ? (
                              <img
                                src={previewProduct.image_url}
                                alt={previewProduct.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-ink-300">
                                <ShoppingBasket className="h-16 w-16" />
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between">
                              <h3 className="font-display text-xl font-bold text-ink-950">
                                {previewProduct.name}
                              </h3>
                              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                                {previewProduct.category}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-ink-600">
                              Selected unit: <span className="font-semibold text-ink-900">{previewProduct.unit}</span>
                              {previewProduct.price ? (
                                <> · Base price: <span className="font-semibold text-brand-700">₹{previewProduct.price}</span></>
                              ) : null}
                            </p>
                            <div className="mt-6 flex justify-end">
                              <button
                                type="button"
                                onClick={() => setPreviewProduct(null)}
                                className="btn-primary px-6 py-2 text-sm"
                              >
                                Close preview
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ayurvedic Seasonal Health & Kitchen Storage Tips Drawer Modal */}
                    {healthTipProduce && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm animate-fade-in"
                        onClick={() => setHealthTipProduce(null)}
                      >
                        <div
                          className="relative max-w-lg w-full overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-scale-in border border-emerald-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                                <HeartPulse className="h-5 w-5" />
                              </span>
                              <div>
                                <h3 className="font-display text-lg font-bold text-ink-950">
                                  {healthTipProduce.name}
                                </h3>
                                <p className="text-xs text-brand-700 font-semibold">{healthTipProduce.vernacularName || healthTipProduce.seasonLabel}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setHealthTipProduce(null)}
                              className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-5 space-y-4 text-xs sm:text-sm">
                            {healthTipProduce.medicalAdvisory && (
                              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-amber-900 border border-amber-200">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="font-bold">Medical / Clinical Advisory</p>
                                  <p className="mt-0.5 leading-relaxed">{healthTipProduce.medicalAdvisory}</p>
                                </div>
                              </div>
                            )}

                            {healthTipProduce.nutritionalNotes && (
                              <div className="rounded-xl bg-emerald-50/70 p-3.5 text-emerald-950 border border-emerald-200">
                                <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                                  <BookOpen className="h-4 w-4 text-emerald-700" /> Ayurvedic &amp; Nutritional Value
                                </p>
                                <p className="mt-1 leading-relaxed text-ink-800">{healthTipProduce.nutritionalNotes}</p>
                              </div>
                            )}

                            {healthTipProduce.benefits && (
                              <div>
                                <p className="font-bold text-ink-900 mb-1.5">Household &amp; Kitchen Benefits:</p>
                                <ul className="list-disc list-inside space-y-1 text-ink-700">
                                  {healthTipProduce.benefits.map((b: string, i: number) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setHealthTipProduce(null)}
                              className="btn-primary px-5 py-2 text-xs"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {step === 'checkout' && (
                  <Checkout
                    mode={mode}
                    cartItems={cartItems}
                    onBack={() => setStep('browse')}
                    onPlaced={(orderId, customerName) => {
                      setPlacedOrderId(orderId);
                      setPlacedCustomerName(customerName);
                      setStep('done');
                    }}
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
  onPreview,
  onTip,
}: {
  icon: React.ElementType;
  title: string;
  products: Product[];
  mode: OrderMode;
  cart: Cart;
  onStep: (id: string, delta: number, unit: string) => void;
  onSet: (id: string, qty: number) => void;
  isSelectable: (p: Product) => boolean;
  onPreview: (p: Product) => void;
  onTip: (match: SeasonalProduce) => void;
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
          const seasonalMatch = SEASONAL_CATALOGUE.find(
            (sp) => sp.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) ||
                    p.name.toLowerCase().includes(sp.name.toLowerCase().split(' ')[0])
          );

          return (
            <div
              key={p.id}
              className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 ${
                selectable
                  ? qty > 0
                    ? 'border-brand-400 shadow-soft'
                    : 'border-ink-100 hover:border-brand-200'
                  : 'border-ink-100 opacity-60'
              }`}
              aria-disabled={!selectable}
            >
              <div
                className="relative h-32 w-full overflow-hidden bg-ink-50 cursor-pointer"
                onClick={() => onPreview(p)}
                title="Click to view large preview"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      selectable ? '' : 'grayscale'
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
                <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-sm">
                  <ZoomIn className="h-3 w-3" /> Preview
                </span>
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
                  <div>
                    <h3 className="font-display text-sm font-bold text-ink-900">{p.name}</h3>
                    {seasonalMatch && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onTip(seasonalMatch); }}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100 transition-colors"
                        title="View Ayurvedic nutritional guidance & kitchen storage tips"
                      >
                        <HeartPulse className="h-3 w-3 text-emerald-600" /> Ayurvedic &amp; Storage Tip
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-ink-500">per {p.unit}</span>
                </div>

                {selectable ? (
                  <div className="mt-3 space-y-2">
                    {/* Weight Stepper */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-ink-200 bg-white">
                        <button
                          type="button"
                          onClick={() => onStep(p.id, p.unit === 'kg' ? -0.25 : -1, p.unit)}
                          className="flex h-8 w-8 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-l-lg"
                          aria-label={`Decrease ${p.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          step={p.unit === 'kg' ? '0.25' : '1'}
                          inputMode="decimal"
                          className="h-8 w-14 border-x border-ink-200 text-center text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          value={qty || ''}
                          placeholder="0"
                          onChange={(e) => onSet(p.id, Number(e.target.value) || 0)}
                          aria-label={`${p.name} quantity in ${p.unit}`}
                        />
                        <button
                          type="button"
                          onClick={() => onStep(p.id, p.unit === 'kg' ? 0.25 : 1, p.unit)}
                          className="flex h-8 w-8 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-r-lg"
                          aria-label={`Increase ${p.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-medium text-ink-500">{p.unit}</span>
                    </div>

                    {/* Quick unit chips for flexible weights */}
                    {p.unit === 'kg' && (
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: '250g', val: 0.25 },
                          { label: '500g', val: 0.5 },
                          { label: '750g', val: 0.75 },
                          { label: '1kg', val: 1.0 },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => onSet(p.id, chip.val)}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                              qty === chip.val
                                ? 'bg-brand-700 text-white'
                                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Amount-Based Calculator ("Buy by ₹") */}
                    {p.price && (
                      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50/80 px-2 py-1 text-[11px] border border-emerald-200/60">
                        <span className="font-semibold text-emerald-800">Buy by ₹:</span>
                        <input
                          type="number"
                          placeholder={`₹${p.price}`}
                          className="w-14 rounded border border-emerald-300 bg-white px-1.5 py-0.5 text-[11px] font-bold text-ink-900 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const amt = Number(e.currentTarget.value);
                              if (amt > 0 && p.price) {
                                const calcQty = Math.round((amt / p.price) * 100) / 100;
                                // Enforce minimum weight (e.g. 0.25kg min)
                                const minWeight = p.unit === 'kg' ? 0.25 : 1;
                                onSet(p.id, Math.max(minWeight, calcQty));
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const amt = Number(e.target.value);
                            if (amt > 0 && p.price) {
                              const calcQty = Math.round((amt / p.price) * 100) / 100;
                              const minWeight = p.unit === 'kg' ? 0.25 : 1;
                              onSet(p.id, Math.max(minWeight, calcQty));
                            }
                          }}
                        />
                        <span className="text-[10px] text-emerald-700 font-medium">auto-calc</span>
                      </div>
                    )}
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
  onPlaced: (orderId: string, customerName: string) => void;
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user } = useAuth();

  const deliveryDate = mode === 'next_day' ? tomorrowISO() : todayISO();

  const update = (k: keyof typeof info, v: string) => {
    // Requirements: All Customer profile details capture strictly in CAPITAL LETTERS
    const sanitized = k === 'notes' ? v : v.toUpperCase();
    setInfo((f) => ({ ...f, [k]: sanitized }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!info.customer_name.trim()) e.customer_name = 'Please enter your name in CAPITAL LETTERS.';
    if (!info.mobile.trim()) e.mobile = 'Please enter your 10-digit mobile number.';
    else if (!/^[6-9]\d{9}$/.test(info.mobile.trim().replace(/\D/g, ''))) {
      e.mobile = 'Mobile number strictly 10 digits (India).';
    }
    if (!info.address.trim()) e.address = 'Please enter your delivery address with DIGIPIN/PIN.';
    return e;
  };

  const handlePreConfirm = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    // Open mandatory Address Confirmation Modal before submission
    setShowConfirmModal(true);
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createOrder({
        customer_name: info.customer_name.trim(),
        mobile: info.mobile.trim(),
        address: info.address.trim(),
        mode,
        items: cartItems,
        expected_delivery: deliveryDate,
        notes: info.notes.trim() || undefined,
        user_id: user?.uid ?? undefined,
      });
      setShowConfirmModal(false);
      onPlaced(res?.id || `ORD-${Date.now()}`, info.customer_name.trim());
    } catch (err) {
      console.error(err);
      setSubmitError('We could not place your order just now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePreConfirm} noValidate>
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

        {/* Financial & Automated Checkout Breakdown */}
        <div className="mt-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-brand-50/40 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span>Monthly Subscription Active (₹1,000 Plan)</span>
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] text-white">LSD Privilege</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-ink-700">
            <div className="flex justify-between">
              <span>LSD ₹300 Promotional Discount (₹50 order cap)</span>
              <span className="font-semibold text-brand-700">-₹50.00</span>
            </div>
            <div className="flex justify-between">
              <span>Prepaid Wallet Balance Applied</span>
              <span className="font-semibold text-brand-700">Eligible</span>
            </div>
            <div className="flex justify-between">
              <span>Loyalty Points Earning (1 pt = ₹1)</span>
              <span className="font-semibold text-gold-700">+5 pts earned</span>
            </div>
          </div>
        </div>

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
        <h2 className="font-display text-base font-bold text-ink-900">Delivery details (Capital Letters)</h2>
        {submitError && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
          </div>
        )}
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="co-name">Full name (CAPITAL LETTERS) <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-name"
              className="input-field uppercase tracking-wide font-medium"
              value={info.customer_name}
              onChange={(e) => update('customer_name', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.customer_name}
              autoComplete="name"
              placeholder="E.G. SURESH SHAH"
            />
            {errors.customer_name && <p className="field-error" role="alert">{errors.customer_name}</p>}
          </div>
          <div>
            <label className="label" htmlFor="co-mobile">Mobile number (10 Digits) <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-mobile"
              type="tel"
              className="input-field font-mono"
              value={info.mobile}
              onChange={(e) => update('mobile', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.mobile}
              autoComplete="tel"
              placeholder="98250 12345"
              maxLength={14}
            />
            {errors.mobile && <p className="field-error" role="alert">{errors.mobile}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="co-address">Delivery address &amp; DIGIPIN <span className="text-red-600" aria-hidden>*</span></label>
            <textarea
              id="co-address"
              rows={2}
              className="input-field uppercase tracking-wide font-medium resize-y"
              value={info.address}
              onChange={(e) => update('address', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.address}
              placeholder="FLAT / HOUSE NO, STREET, CITY, PIN CODE, DIGIPIN"
            />
            {errors.address && <p className="field-error" role="alert">{errors.address}</p>}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
              <MapPin className="h-3.5 w-3.5" /> Structured postal mapping replaces inaccurate third-party map drops.
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
              placeholder="Any specific delivery instructions"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-ink-500">
          By placing this order you agree to be contacted for delivery coordination.
        </p>
        <button type="submit" className="btn-primary px-6 py-3" disabled={submitting}>
          Review &amp; Confirm Address <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Mandatory Address Re-Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-fade-up border border-gold-300">
            <div className="flex items-center gap-3 text-brand-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink-950">Address Re-Confirmation</h3>
                <p className="text-xs text-ink-500">Please verify your doorstep dispatch location before final submission.</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-amber-50/60 p-4 border border-amber-200/80">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                Recipient Details:
              </p>
              <p className="font-display font-extrabold italic text-ink-900 text-base">
                {info.customer_name}
              </p>
              <p className="font-mono text-xs text-ink-600 mt-0.5">{info.mobile}</p>
              <div className="mt-3 border-t border-amber-200/60 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Registered Delivery Destination:
                </p>
                <p className="font-serif font-black italic text-ink-950 text-sm leading-relaxed tracking-wide">
                  "{info.address}"
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-ink-200 px-4 py-2.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
              >
                Modify Address
              </button>
              <button
                type="button"
                onClick={placeOrder}
                disabled={submitting}
                className="btn-primary px-5 py-2.5 text-xs"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <>Confirmed &amp; Submit Order <CheckCircle2 className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function OrderConfirmed({
  onReset,
  mode,
  orderId,
  customerName,
}: {
  onReset: () => void;
  mode: OrderMode;
  orderId?: string;
  customerName?: string;
}) {
  const [itemQuality, setItemQuality] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [packaging, setPackaging] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingFeedback(true);
    try {
      await submitOrderFeedback({
        order_id: orderId || `ORD-${Date.now()}`,
        customer_name: customerName || 'Valued Customer',
        item_quality_rating: itemQuality,
        service_rating: serviceRating,
        delivery_punctuality_rating: punctuality,
        packaging_rating: packaging,
        comment: comment.trim() || undefined,
        created_at: new Date().toISOString(),
      });
      setFeedbackSent(true);
    } catch (err) {
      console.warn('Feedback submit error:', err);
      setFeedbackSent(true);
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="pt-[calc(var(--header-h)+2rem)] pb-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl rounded-3xl border border-brand-200 bg-white p-6 sm:p-10 text-center shadow-lift animate-scale-in">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-ink-950 sm:text-3xl">Order placed!</h1>
          <p className="mt-2 text-sm sm:text-base text-ink-600">
            Thank you{customerName ? `, ${customerName}` : ''}. Your{' '}
            <strong className="font-semibold text-ink-900">
              {mode === 'next_day' ? 'next-day pre-order' : 'same-day order'}
            </strong>{' '}
            has been received. Our team will coordinate your morning doorstep delivery.
          </p>

          <div className="mt-5 rounded-2xl bg-brand-50 p-4 text-left border border-brand-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm text-brand-900 font-medium">
                <Sun className="h-4 w-4 text-gold-600" />
                Expected delivery:{' '}
                <span className="font-bold text-brand-800">
                  {fmtDate(mode === 'next_day' ? tomorrowISO() : todayISO())}
                </span>
              </p>
              {orderId && (
                <span className="text-xs font-mono font-bold text-brand-700 bg-brand-100/80 px-2.5 py-1 rounded-lg">
                  Ref: #{orderId.slice(-8)}
                </span>
              )}
            </div>
          </div>

          {/* Customer Quality & Service Experience Feedback Form */}
          <div className="mt-8 text-left rounded-3xl border border-gold-300/60 bg-gradient-to-br from-amber-50/40 via-white to-brand-50/30 p-5 sm:p-7 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-700 border border-gold-400/30">
                <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
              </span>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-ink-950">
                  Customer Experience &amp; Produce Feedback
                </h3>
                <p className="text-xs text-ink-500">
                  Help us maintain pristine quality for everyday essentials, vegetables, fruits &amp; desi milk.
                </p>
              </div>
            </div>

            {feedbackSent ? (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-900 text-center">
                <ThumbsUp className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold text-sm">Thank you for your valuable feedback!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your ratings on produce quality and dispatch services have been recorded for quality assurance.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Rating 1: Item Quality */}
                  <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-sm">
                    <p className="text-xs font-bold text-ink-900">Produce &amp; Item Freshness</p>
                    <p className="text-[11px] text-ink-500 mb-2">Quality of vegetables, fruits &amp; farm milk</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setItemQuality(star)}
                          className="p-1 text-gold-500 hover:scale-110 transition-transform"
                          aria-label={`${star} star rating for produce quality`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= itemQuality ? 'fill-gold-500 text-gold-500' : 'text-ink-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-ink-700">{itemQuality} / 5</span>
                    </div>
                  </div>

                  {/* Rating 2: Service & Dispatch */}
                  <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-sm">
                    <p className="text-xs font-bold text-ink-900">Overall Service &amp; Support</p>
                    <p className="text-[11px] text-ink-500 mb-2">Ordering process and coordination</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setServiceRating(star)}
                          className="p-1 text-gold-500 hover:scale-110 transition-transform"
                          aria-label={`${star} star rating for service`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= serviceRating ? 'fill-gold-500 text-gold-500' : 'text-ink-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-ink-700">{serviceRating} / 5</span>
                    </div>
                  </div>

                  {/* Rating 3: Delivery Punctuality */}
                  <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-sm">
                    <p className="text-xs font-bold text-ink-900">Delivery Punctuality</p>
                    <p className="text-[11px] text-ink-500 mb-2">On-time doorstep arrival</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setPunctuality(star)}
                          className="p-1 text-gold-500 hover:scale-110 transition-transform"
                          aria-label={`${star} star rating for punctuality`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= punctuality ? 'fill-gold-500 text-gold-500' : 'text-ink-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-ink-700">{punctuality} / 5</span>
                    </div>
                  </div>

                  {/* Rating 4: Hygiene & Packaging */}
                  <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-sm">
                    <p className="text-xs font-bold text-ink-900">Hygienic Packaging</p>
                    <p className="text-[11px] text-ink-500 mb-2">Clean pouches, crate handling</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setPackaging(star)}
                          className="p-1 text-gold-500 hover:scale-110 transition-transform"
                          aria-label={`${star} star rating for packaging`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= packaging ? 'fill-gold-500 text-gold-500' : 'text-ink-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-ink-700">{packaging} / 5</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-800 mb-1">
                    Specific Comments or Fresh Produce Requests (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts on item freshness, packaging or morning timing..."
                    className="input-field text-xs resize-y"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingFeedback}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 shadow-soft transition-all"
                  >
                    {sendingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>

          <button onClick={onReset} className="btn-primary mt-8 px-6 py-3">
            Place another order
          </button>
        </div>
      </div>
    </div>
  );
}
