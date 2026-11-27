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
  UserCheck,
  Save,
  RotateCcw,
  LogIn,
} from 'lucide-react';
import {
  fetchProducts,
  createOrder,
  submitOrderFeedback,
  fetchUserFinancials,
  fetchOrders,
  fetchFamilyGroup,
  fetchSystemDiscountConfig,
  sendSmsWhatsAppAlert,
  fetchCustomerLienProfile,
  type CustomerLienProfile,
  type Product,
  type OrderMode,
  type OrderItem,
  type OrderFeedback,
  type FamilyGroup,
  type CutVegPreference,
  type SystemDiscountConfig,
} from '@/lib/firestoreService';
import { useAuth } from '@/lib/auth';
import { SEASONAL_CATALOGUE, type SeasonalProduce } from '@/data/seasonalProduce';
import { RECIPE_PREP_KITS, type RecipePrepKit } from '@/data/recipePacks';
import { HeartPulse, BookOpen, AlertTriangle, Star, ThumbsUp, Send, ChefHat, Scissors, AlertOctagon, Award, ShieldCheck } from 'lucide-react';
import { MilkbasketCategoryExplorer } from '@/components/MilkbasketCategoryExplorer';
import { JvlsdAuthenticitySeal } from '@/components/Logo';
import { COMPANY_CONFIG } from '@/data/companyConfig';

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
  const [seasonFilter, setSeasonFilter] = useState<'all' | 'all_year' | 'winter' | 'monsoon' | 'summer'>('all');
  const [healthTipProduce, setHealthTipProduce] = useState<any | null>(null);

  // Cut Vegetables & Recipe Prep Customization State (Master Directive Section 12)
  const [cutVegConfigs, setCutVegConfigs] = useState<Record<string, CutVegPreference>>({});
  const [cutConfigModalProduct, setCutConfigModalProduct] = useState<Product | null>(null);
  const [cutErrorNotice, setCutErrorNotice] = useState<string | null>(null);

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

      // P5: Seasonal Filter Mapping (Báremās, Shiyāḷo, Chomāsu, Unāḷo)
      let matchSeason = true;
      if (seasonFilter !== 'all') {
        const seasonalMatch = SEASONAL_CATALOGUE.find(
          (sp) => sp.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) ||
                  p.name.toLowerCase().includes(sp.name.toLowerCase().split(' ')[0])
        );
        matchSeason = seasonalMatch ? seasonalMatch.season === seasonFilter : seasonFilter === 'all_year';
      }

      return matchCat && matchSearch && matchSeason;
    });
  }, [products, categoryFilter, searchQuery, seasonFilter]);

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
          price: productById[id]?.price,
          quantity: qty,
          cut_preference: cutVegConfigs[id],
        })),
    [cart, productById, cutVegConfigs]
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
          <div className="mt-4 max-w-3xl space-y-2">
            <p className="text-base sm:text-lg leading-relaxed text-emerald-50/95 font-medium">
              Pick your kitchen produce fresh from farmers. Planned pre-orders eliminate warehouse hoarding, guarantee peak nutritional harvest, and prevent food wastage.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm font-semibold text-gold-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 px-3 py-1 border border-gold-400/40">
                📅 Next-Day Pre-Order: Delivered 8:00–9:00 AM only · Free cancellation up to 10:00 PM tonight
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 border border-emerald-400/40 text-emerald-200">
                ⚡ Same-Day Emergency Dispatch: Strictly within 3 km of Navrangpura Hub, with extra delivery charges ₹125 for value below ₹500 &amp; above that ₹75 in 10 km radius as per DIGIPIN
              </span>
            </div>
          </div>
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

                    {/* P5: Gujarati Seasonal Filters Bar & Awareness Guidance */}
                    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/70">
                        <div>
                          <p className="text-xs font-bold text-forest-950 flex items-center gap-1.5">
                            <Leaf className="h-3.5 w-3.5 text-brand-700" /> Seasonal Produce Awareness &amp; Calendar Guidance
                          </p>
                          <p className="text-[11px] text-ink-600 mt-0.5">
                            Core essentials are available <strong>365 days</strong>. Use this calendar guide to discover seasonal fruits &amp; vegetables at their natural harvest peak.
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-800 text-white px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                          ❄️ NO FROZEN VEGETABLES SOLD
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-ink-800 text-[11px]">Select Season:</span>
                        {[
                          { id: 'all', label: '365 Days Available (All Items)' },
                          { id: 'all_year', label: 'બારેમાસ (Perennial)' },
                          { id: 'winter', label: 'શિયાળો (Winter / Oct–Feb)' },
                          { id: 'monsoon', label: 'ચોમાસુ (Monsoon / Jun–Sep)' },
                          { id: 'summer', label: 'ઉનાળો (Summer / Mar–May)' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSeasonFilter(s.id as any)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                              seasonFilter === s.id
                                ? 'bg-emerald-800 text-gold-300 font-bold shadow-soft'
                                : 'bg-white text-emerald-950 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {s.label}
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

                    {/* Milkbasket Style Visual Category Explorer */}
                    <div className="mt-6">
                      <MilkbasketCategoryExplorer
                        onSelectCategory={(clusterId, subId) => {
                          if (subId) {
                            setSearchQuery(subId.replace(/-/g, ' '));
                          } else if (clusterId === 'dairy-morning') {
                            setCategoryFilter('milk');
                          } else if (clusterId === 'farm-veggies') {
                            setCategoryFilter('vegetable');
                          } else if (clusterId === 'seasonal-fruits') {
                            setCategoryFilter('fruit');
                          } else {
                            setCategoryFilter('all');
                          }
                        }}
                      />
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
                        onOpenCutConfig={(prod) => {
                          setCutErrorNotice(null);
                          setCutConfigModalProduct(prod);
                        }}
                        cutVegConfig={cutVegConfigs}
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
                            <X className="h-5 w-5" />
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
                                <ShoppingBasket className="h-16 w-16" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent p-4 text-white">
                              <span className="rounded-full bg-brand-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                {previewProduct.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-display text-2xl font-bold text-ink-950">
                                  {previewProduct.name}
                                </h3>
                                <p className="mt-1 text-xs sm:text-sm text-ink-600">
                                  Standard unit: <span className="font-semibold text-ink-900">{previewProduct.unit}</span>
                                  {previewProduct.price ? (
                                    <> · Base pricing: <span className="font-bold text-brand-700">₹{previewProduct.price} / {previewProduct.unit}</span></>
                                  ) : null}
                                </p>
                              </div>
                            </div>

                            {/* Quick Add To Cart from Preview Modal */}
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-ink-600">In your basket:</span>
                                <span className="font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg text-sm">
                                  {cart[previewProduct.id] ?? 0} {previewProduct.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => stepQty(previewProduct.id, -1, previewProduct.unit)}
                                  disabled={(cart[previewProduct.id] ?? 0) <= 0}
                                  className="h-9 w-9 rounded-xl border border-ink-200 bg-ink-50 text-ink-700 font-bold hover:bg-ink-100 disabled:opacity-40"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() => stepQty(previewProduct.id, 1, previewProduct.unit)}
                                  className="h-9 px-4 rounded-xl bg-brand-700 text-white font-bold hover:bg-brand-800 shadow-soft text-xs sm:text-sm flex items-center gap-1.5"
                                >
                                  <Plus className="h-4 w-4" /> Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPreviewProduct(null)}
                                  className="btn-outline px-4 py-2 text-xs sm:text-sm"
                                >
                                  Close
                                </button>
                              </div>
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

                    {/* Master Requirement Section 12: Cut Vegetable Preferences & Recipe Pack Modal */}
                    {cutConfigModalProduct && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/75 p-4 backdrop-blur-sm animate-fade-in"
                        onClick={() => {
                          setCutConfigModalProduct(null);
                          setCutErrorNotice(null);
                        }}
                      >
                        <div
                          className="relative max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-scale-in border border-amber-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
                                <Scissors className="h-6 w-6" />
                              </span>
                              <div>
                                <h3 className="font-display text-lg font-bold text-ink-950">
                                  Cut &amp; Preparation Preference
                                </h3>
                                <p className="text-xs text-brand-700 font-semibold">{cutConfigModalProduct.name}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCutConfigModalProduct(null);
                                setCutErrorNotice(null);
                              }}
                              className="rounded-full p-2 text-ink-400 hover:bg-ink-100 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Section 12.6 Onion & Potato Advance Delivery Rule Enforcement Banner */}
                          {['onion', 'potato', 'aloo', 'pyaaz', 'batata'].some((k) =>
                            cutConfigModalProduct.name.toLowerCase().includes(k)
                          ) && (
                            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-900">
                              <AlertOctagon className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                              <div className="text-xs leading-relaxed">
                                <span className="font-bold">Freshness Advisory:</span> Due to natural oxidization, colour changes, and aroma release, cut onion and potato items are strictly prepared for <strong>same-day immediate dispatch</strong>. Scheduled advance next-day delivery of pre-cut onion/potato is restricted.
                              </div>
                            </div>
                          )}

                          {cutErrorNotice && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                              <AlertCircle className="h-4 w-4 shrink-0" /> {cutErrorNotice}
                            </div>
                          )}

                          <div className="mt-6 space-y-6 text-sm">
                            {/* 12.1 Preparation Preference Type */}
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-2">
                                1. Select Preparation Style
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[
                                  { id: 'individual', title: 'Individual Cut', desc: 'Separately packed vegetable' },
                                  { id: 'mixed_box', title: 'Mixed Box', desc: 'Assorted in one kitchen box' },
                                  { id: 'recipe', title: 'Recipe Prep Pack', desc: 'Pre-cut for a specific dish' },
                                ].map((opt) => {
                                  const current = cutVegConfigs[cutConfigModalProduct.id]?.preparation_type || 'individual';
                                  const isSel = current === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => {
                                        setCutErrorNotice(null);
                                        setCutVegConfigs((prev) => ({
                                          ...prev,
                                          [cutConfigModalProduct.id]: {
                                            ...(prev[cutConfigModalProduct.id] || {}),
                                            preparation_type: opt.id as any,
                                          },
                                        }));
                                      }}
                                      className={`p-3 text-left rounded-2xl border transition-all ${
                                        isSel
                                          ? 'border-brand-600 bg-brand-50/60 text-brand-900 ring-2 ring-brand-300'
                                          : 'border-ink-200 bg-white hover:bg-ink-50 text-ink-800'
                                      }`}
                                    >
                                      <p className="font-bold text-xs">{opt.title}</p>
                                      <p className="text-[11px] text-ink-500 mt-0.5">{opt.desc}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 12.2 Recipe Selection (When Recipe chosen) */}
                            {cutVegConfigs[cutConfigModalProduct.id]?.preparation_type === 'recipe' && (
                              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                                  <ChefHat className="h-4 w-4" /> Select Recipe Kit
                                </label>
                                <select
                                  value={cutVegConfigs[cutConfigModalProduct.id]?.recipe_name || RECIPE_PREP_KITS[0].name}
                                  onChange={(e) => {
                                    setCutErrorNotice(null);
                                    const kit = RECIPE_PREP_KITS.find((k) => k.name === e.target.value);
                                    if (mode === 'next_day' && kit?.hasOnionOrPotato) {
                                      setCutErrorNotice(
                                        `"${kit.name}" contains onion/potato and cannot be scheduled for next-day pre-order. Please select Same-Day mode or choose an unoxidized recipe kit.`
                                      );
                                    }
                                    setCutVegConfigs((prev) => ({
                                      ...prev,
                                      [cutConfigModalProduct.id]: {
                                        ...(prev[cutConfigModalProduct.id] || {}),
                                        preparation_type: 'recipe',
                                        recipe_name: e.target.value,
                                      },
                                    }));
                                  }}
                                  className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                  {RECIPE_PREP_KITS.map((k) => (
                                    <option key={k.id} value={k.name}>
                                      {k.name} ({k.vernacularName || k.description})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* 12.3 Cut Size Options */}
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-2">
                                2. Cut Size Preference
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { id: 'fine', label: 'Fine Chopped' },
                                  { id: 'thin', label: 'Thin Slices / Batons' },
                                  { id: 'small_dice', label: 'Small Dice' },
                                  { id: 'medium_dice', label: 'Medium Dice' },
                                  { id: 'large_dice', label: 'Large Chunks' },
                                ].map((cs) => {
                                  const current = cutVegConfigs[cutConfigModalProduct.id]?.cut_size || 'medium_dice';
                                  const isSel = current === cs.id;
                                  return (
                                    <button
                                      key={cs.id}
                                      type="button"
                                      onClick={() => {
                                        setCutVegConfigs((prev) => ({
                                          ...prev,
                                          [cutConfigModalProduct.id]: {
                                            ...(prev[cutConfigModalProduct.id] || { preparation_type: 'individual' }),
                                            cut_size: cs.id as any,
                                          },
                                        }));
                                      }}
                                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                                        isSel
                                          ? 'border-brand-700 bg-brand-700 text-white shadow-soft'
                                          : 'border-ink-200 bg-ink-50 text-ink-700 hover:bg-ink-100'
                                      }`}
                                    >
                                      {cs.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 12.4 Pack Size & Box Style */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-2">
                                  3. Pack Size
                                </label>
                                <div className="flex gap-2">
                                  {['200g', '250g', '500g'].map((ps) => {
                                    const current = cutVegConfigs[cutConfigModalProduct.id]?.pack_size || '250g';
                                    const isSel = current === ps;
                                    return (
                                      <button
                                        key={ps}
                                        type="button"
                                        onClick={() => {
                                          setCutVegConfigs((prev) => ({
                                            ...prev,
                                            [cutConfigModalProduct.id]: {
                                              ...(prev[cutConfigModalProduct.id] || { preparation_type: 'individual' }),
                                              pack_size: ps as any,
                                            },
                                          }));
                                        }}
                                        className={`flex-1 rounded-xl py-2 text-xs font-bold border transition-all ${
                                          isSel
                                            ? 'border-brand-700 bg-brand-700 text-white shadow-soft'
                                            : 'border-ink-200 bg-ink-50 text-ink-700 hover:bg-ink-100'
                                        }`}
                                      >
                                        {ps}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-2">
                                  4. Box Style
                                </label>
                                <div className="flex gap-2">
                                  {[
                                    { id: 'individual_pack', label: 'Single Pack' },
                                    { id: 'assorted_separated_box', label: 'Separated Box' },
                                  ].map((bx) => {
                                    const current = cutVegConfigs[cutConfigModalProduct.id]?.box_style || 'individual_pack';
                                    const isSel = current === bx.id;
                                    return (
                                      <button
                                        key={bx.id}
                                        type="button"
                                        onClick={() => {
                                          setCutVegConfigs((prev) => ({
                                            ...prev,
                                            [cutConfigModalProduct.id]: {
                                              ...(prev[cutConfigModalProduct.id] || { preparation_type: 'individual' }),
                                              box_style: bx.id as any,
                                            },
                                          }));
                                        }}
                                        className={`flex-1 rounded-xl py-2 px-1 text-center text-xs font-bold border transition-all ${
                                          isSel
                                            ? 'border-brand-700 bg-brand-700 text-white shadow-soft'
                                            : 'border-ink-200 bg-ink-50 text-ink-700 hover:bg-ink-100'
                                        }`}
                                      >
                                        {bx.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-5">
                            <button
                              type="button"
                              onClick={() => {
                                setCutVegConfigs((prev) => {
                                  const n = { ...prev };
                                  delete n[cutConfigModalProduct.id];
                                  return n;
                                });
                                setCutConfigModalProduct(null);
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold underline"
                            >
                              Reset to standard whole
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const isRawOnionPotato = ['onion', 'potato', 'aloo', 'pyaaz', 'batata'].some((k) =>
                                  cutConfigModalProduct.name.toLowerCase().includes(k)
                                );
                                if (mode === 'next_day' && isRawOnionPotato) {
                                  setCutErrorNotice(
                                    'Pre-cut Onion and Potato products cannot be ordered for next-day delivery due to colour-change and odour rules. Please switch to Same-Day order mode.'
                                  );
                                  return;
                                }

                                // If user hadn't customized yet, populate default
                                if (!cutVegConfigs[cutConfigModalProduct.id]) {
                                  setCutVegConfigs((prev) => ({
                                    ...prev,
                                    [cutConfigModalProduct.id]: {
                                      preparation_type: 'individual',
                                      cut_size: 'medium_dice',
                                      pack_size: '250g',
                                      box_style: 'individual_pack',
                                    },
                                  }));
                                }

                                // Auto-increment item count in cart if 0
                                if ((cart[cutConfigModalProduct.id] ?? 0) === 0) {
                                  setQty(cutConfigModalProduct.id, 1);
                                }

                                setCutConfigModalProduct(null);
                                setCutErrorNotice(null);
                              }}
                              className="btn-primary px-6 py-2.5 text-xs font-bold"
                            >
                              Save Cut Preference
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
                    <li key={it.id} className="flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900">{it.name}</p>
                        <p className="text-xs text-ink-500">
                          {it.quantity} {it.unit}
                        </p>
                        {it.cut_preference && (
                          <div className="mt-0.5 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {it.cut_preference.preparation_type === 'recipe'
                              ? `Recipe: ${it.cut_preference.recipe_name}`
                              : `Cut: ${it.cut_preference.cut_size?.replace('_', ' ')} (${it.cut_preference.pack_size || '250g'})`}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setQty(it.id, 0)}
                        className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 shrink-0"
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
          sub="Tomorrow 8:00–9:00 AM only · all items selectable"
        />
        <ModeButton
          active={mode === 'same_day'}
          onClick={() => onChange('same_day')}
          icon={Truck}
          title="Same-day order"
          sub="Same-Day Emergency Dispatch: Strictly within 3 km of Navrangpura Hub, with extra delivery charges ₹125 for value below ₹500 & above that ₹75 in 10 km radius as per DIGIPIN"
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
  onOpenCutConfig,
  cutVegConfig,
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
  onOpenCutConfig?: (p: Product) => void;
  cutVegConfig?: Record<string, CutVegPreference>;
}) {
  if (products.length === 0) return null;
  return (
    <div>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-950">
        <Icon className="h-5 w-5 text-brand-600" /> {title}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                    ? 'border-brand-400 shadow-soft ring-1 ring-brand-300'
                    : 'border-ink-100 hover:border-brand-200'
                  : 'border-ink-100 opacity-60'
              }`}
              aria-disabled={!selectable}
            >
              <div
                className="relative h-44 sm:h-48 w-full overflow-hidden bg-ink-100 cursor-pointer"
                onClick={() => onPreview(p)}
                title="Click to view large preview"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
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
                <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-semibold text-white transition-all duration-200 group-hover:scale-105 backdrop-blur-md shadow-md">
                  <ZoomIn className="h-3.5 w-3.5 text-gold-300" /> View Preview
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
                    {p.category === 'vegetable' && onOpenCutConfig && (
                      <div className="mt-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenCutConfig(p)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all border ${
                            cutVegConfig?.[p.id]
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-ink-50 text-ink-700 border-ink-200 hover:bg-ink-100'
                          }`}
                        >
                          <Scissors className="h-3 w-3 text-amber-700" />
                          {cutVegConfig?.[p.id] ? (
                            <span>Cut: {cutVegConfig[p.id].preparation_type === 'recipe' ? cutVegConfig[p.id].recipe_name : cutVegConfig[p.id].cut_size?.replace('_', ' ') || 'Custom'}</span>
                          ) : (
                            <span>Cut &amp; Prep Preference</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-base font-black text-brand-800">
                      ₹{p.price}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-500">per {p.unit}</span>
                  </div>
                </div>

                {selectable ? (
                  <div className="mt-3 space-y-2">
                    {/* Weight Stepper */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-ink-200 bg-white shadow-xs">
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
                          className="h-8 w-14 border-x border-ink-200 text-center text-xs font-bold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
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
                      <span className="text-xs font-bold text-ink-700">{p.unit}</span>
                      {qty > 0 && p.price && (
                        <span className="ml-auto font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          = ₹{(qty * p.price).toFixed(2)}
                        </span>
                      )}
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

                    {/* Dozen / Piece quick selector for bananas */}
                    {p.unit === 'dozen' && (
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: '½ Doz (6 Pcs)', val: 0.5 },
                          { label: '1 Dozen (12)', val: 1.0 },
                          { label: '2 Dozen (24)', val: 2.0 },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => onSet(p.id, chip.val)}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                              qty === chip.val
                                ? 'bg-amber-700 text-white'
                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Amount-Based Auto-Calculate Feature ("Buy by ₹") */}
                    {p.price && (
                      <div className="flex items-center justify-between gap-1.5 rounded-lg bg-emerald-50/90 px-2.5 py-1 text-[11px] border border-emerald-300 shadow-2xs">
                        <span className="font-bold text-emerald-900">Buy by ₹:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder={`₹${p.price}`}
                            className="w-16 rounded border border-emerald-300 bg-white px-1.5 py-0.5 text-[11px] font-bold text-ink-900 focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const amt = Number(e.currentTarget.value);
                                if (amt > 0 && p.price) {
                                  const calcQty = Math.round((amt / p.price) * 100) / 100;
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
                          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Auto-Calc</span>
                        </div>
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
    first_name: '',
    last_name: '',
    customer_name: '',
    email: '',
    mobile: '',
    telephone: '',
    country: 'India',
    state: 'GUJARAT',
    city: 'AHMEDABAD',
    street_address: '',
    pincode: '',
    house_flat: '',
    building_society: '',
    landmark: '',
    area: '',
    digipin: '',
    address: '',
    notes: '',
    billing_same_as_shipping: true,
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deliveryOtpGenerated, setDeliveryOtpGenerated] = useState<string>('');
  const { user, profile } = useAuth();

  // 1st-Timer vs 2nd-Timer & Saved Draft State
  const [saveDraftConsent, setSaveDraftConsent] = useState<boolean>(() => {
    return localStorage.getItem('jvlsd_save_draft_consent') === 'true';
  });
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);
  const [previousOrdersCount, setPreviousOrdersCount] = useState<number>(() => {
    const localCount = parseInt(localStorage.getItem('jvlsd_local_orders_count') || '0', 10);
    return localCount;
  });
  const [showSecondTimerGateModal, setShowSecondTimerGateModal] = useState<boolean>(false);

  // Customer Lien & Observation Status (Undelivered Repeated Incidences)
  const [lienProfile, setLienProfile] = useState<CustomerLienProfile | null>(null);

  // Ahmedabad Pin code lookup database for automatic city/area/state & Digipin mapping
  const AHMEDABAD_PIN_MAP: Record<string, { area: string; city: string; state: string; digipin: string; distKm: number }> = {
    '380009': { area: 'NAVRANGPURA / LAKUDI / STADIUM', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-NAV-009', distKm: 0.5 },
    '380014': { area: 'USMANPURA / ASHRAM ROAD', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-USM-014', distKm: 1.2 },
    '380013': { area: 'VADAJ / SUBHASH BRIDGE', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-VDJ-013', distKm: 1.8 },
    '380006': { area: 'ELLISBRIDGE / PALDI', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-ELL-006', distKm: 2.2 },
    '380015': { area: 'AMBAWADI / POLYTECHNIC / SATELLITE', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-AMB-015', distKm: 2.7 },
    '380052': { area: 'MEMNAGAR / GURUKUL ROAD', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-MEM-052', distKm: 3.4 },
    '380054': { area: 'THALTEJ / DRIVE-IN ROAD', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-THA-054', distKm: 4.8 },
    '380051': { area: 'BODAKDEV / S.G. HIGHWAY', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-BDK-051', distKm: 5.5 },
    '380018': { area: 'SARASPUR / GOMTIPUR', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-SAR-018', distKm: 5.2 },
    '380001': { area: 'OLD CITY / RELIEF ROAD', city: 'AHMEDABAD', state: 'GUJARAT', digipin: 'GJ-380-CTY-001', distKm: 2.8 },
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a valid coupon code.');
      return;
    }
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME' || code === 'FIRST50' || code === 'JVLSD') {
      setCouponApplied(true);
      setCouponDiscount(50);
      setCouponMessage('Coupon code applied successfully! ₹50 deducted.');
    } else {
      setCouponMessage(`Coupon code "${code}" is not valid or expired.`);
    }
  };

  const handlePincodeChange = (pin: string) => {
    const cleanPin = pin.trim().slice(0, 6);
    const mapping = AHMEDABAD_PIN_MAP[cleanPin];
    if (mapping) {
      setInfo((prev) => {
        const fullAddr = `${prev.street_address ? prev.street_address + ', ' : ''}${prev.house_flat ? prev.house_flat + ', ' : ''}${prev.building_society ? prev.building_society + ', ' : ''}${prev.landmark ? 'NEAR ' + prev.landmark + ', ' : ''}${mapping.area}, ${mapping.city}, ${mapping.state} - ${cleanPin}`;
        const updated = {
          ...prev,
          pincode: cleanPin,
          area: mapping.area,
          city: mapping.city,
          state: mapping.state,
          digipin: mapping.digipin,
          address: fullAddr.toUpperCase(),
        };
        if (saveDraftConsent) {
          try {
            localStorage.setItem('jvlsd_checkout_draft', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
      if (errors.pincode) setErrors((e) => ({ ...e, pincode: '' }));
    } else {
      setInfo((prev) => ({
        ...prev,
        pincode: cleanPin,
      }));
    }
  };

  // Financial States (Strict 0 default for unauthenticated/guest users)
  const [walletBalance, setWalletBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [promoBalance, setPromoBalance] = useState(0);
  const [applyWallet, setApplyWallet] = useState(false);
  const [applyPromo, setApplyPromo] = useState(false);
  const [applyLoyalty, setApplyLoyalty] = useState(false);
  const [isAddressLocked, setIsAddressLocked] = useState(false);
  const [monthlyOrdersCount, setMonthlyOrdersCount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card' | 'sodexo'>('wallet');
  const [refundPreference, setRefundPreference] = useState<'wallet' | 'original'>('wallet');
  const [hasMonthFirst500Order, setHasMonthFirst500Order] = useState<boolean>(false);
  const [smaller100OrdersMonthCount, setSmaller100OrdersMonthCount] = useState<number>(0);
  const [systemDiscountConfig, setSystemDiscountConfig] = useState<SystemDiscountConfig | null>(null);

  // Compute Base Total from Cart Items
  const rawSubtotal = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + (it.price || 40) * it.quantity, 0);
  }, [cartItems]);

  // A: 20% Discount Rules configured per client instruction:
  // 1. 20% discount applies on first purchase ₹500 & above every month.
  // 2. Only THEN can 20% discount be availed for smaller amounts (₹100+ purchases) any time in the month.
  // 3. Controlled by Master / Store switch toggle activation / deactivation by Super Admin / Admin.
  // 4. Also controlled by toggle for making less than 3 smaller ₹100+ purchases in a month.
  const isMasterDiscountActive = systemDiscountConfig?.master_discount_switch ?? true;

  const tieredDiscountPercent = useMemo(() => {
    if (!isMasterDiscountActive) return 0;

    // Rule A: Current cart is ₹500 or above
    if (rawSubtotal >= 500) {
      return 20;
    }

    // Rule B: Current cart is a smaller ₹100+ purchase
    if (rawSubtotal >= 100) {
      const require500First = systemDiscountConfig?.require_first_purchase_500_for_100_tier ?? true;
      const limitUnder3 = systemDiscountConfig?.limit_smaller_100_purchases_to_under_3 ?? true;

      // Must have made a ₹500+ purchase this month first (if condition is active)
      if (require500First && !hasMonthFirst500Order) {
        return 0;
      }

      // Must have made less than 3 smaller ₹100+ purchases this month (if condition is active)
      if (limitUnder3 && smaller100OrdersMonthCount >= 3) {
        return 0;
      }

      return 20;
    }

    return 0;
  }, [isMasterDiscountActive, rawSubtotal, systemDiscountConfig, hasMonthFirst500Order, smaller100OrdersMonthCount]);

  const tieredDiscountAmount = useMemo(() => {
    if (tieredDiscountPercent <= 0 || rawSubtotal <= 0) return 0;
    return Math.round((rawSubtotal * tieredDiscountPercent) / 100);
  }, [rawSubtotal, tieredDiscountPercent]);

  // Promo discount calculation:
  // Customer can use ₹50 from discount balance for orders of ₹100 & above monthly
  const promoDiscount = useMemo(() => {
    if (!applyPromo || promoBalance <= 0 || rawSubtotal < 100) return 0;
    return Math.min(50, promoBalance, Math.max(0, rawSubtotal - tieredDiscountAmount));
  }, [applyPromo, promoBalance, rawSubtotal, tieredDiscountAmount]);

  // Loyalty deduction calculation: Eligible only if points >= 75; max 5 points (₹5) per bill; keeps >= 20 floor
  const loyaltyDeduction = useMemo(() => {
    if (!applyLoyalty || loyaltyPoints < 75) return 0;
    const maxUsable = Math.min(5, loyaltyPoints - 20, Math.max(0, rawSubtotal - tieredDiscountAmount - promoDiscount));
    return Math.max(0, maxUsable);
  }, [applyLoyalty, loyaltyPoints, rawSubtotal, tieredDiscountAmount, promoDiscount]);

  // Applicable credit card convenience fee: 1.8% disclosed upfront
  const cardFee = useMemo(() => {
    if (paymentMethod === 'card') {
      const netBeforeFee = Math.max(0, rawSubtotal - tieredDiscountAmount - promoDiscount - loyaltyDeduction);
      return Math.round(netBeforeFee * 0.018 * 100) / 100;
    }
    return 0;
  }, [paymentMethod, rawSubtotal, tieredDiscountAmount, promoDiscount, loyaltyDeduction]);

  // Distance estimation from Navrangpura Hub (23.0372° N, 72.5613° E)
  const estimatedDistanceKm = useMemo(() => {
    const pinMatch = info.address.match(/\b(380\d{3})\b/);
    const pin = pinMatch ? pinMatch[1] : info.pincode;
    if (pin && AHMEDABAD_PIN_MAP[pin]) {
      return AHMEDABAD_PIN_MAP[pin].distKm;
    }
    if (
      info.address.toUpperCase().includes('MEMNAGAR') ||
      info.address.toUpperCase().includes('THALTEJ') ||
      info.address.toUpperCase().includes('BODAKDEV') ||
      info.address.toUpperCase().includes('SARASPUR')
    ) {
      return 4.5;
    }
    return 1.5; // Default within 3km Navrangpura core
  }, [info.address, info.pincode, AHMEDABAD_PIN_MAP]);

  // Delivery Charges with Lien Period / Caution Rules:
  // - If customer is in 6-month lien observation period (due to 3+ quarter or 5+ annual undelivered incidents):
  //   * Within 3 km: ₹100 penalty delivery charge
  //   * 3 to 10 km: ₹150 penalty delivery charge
  // - Otherwise, standard rules apply:
  //   * Same-day emergency dispatch: ₹125 below ₹500, ₹75 above ₹500
  //   * Next-day pre-order: Free (unless in lien period, where ₹100 / ₹150 applies)
  const deliveryFee = useMemo(() => {
    if (lienProfile?.is_in_lien_period) {
      return estimatedDistanceKm <= 3.0
        ? lienProfile.penalty_delivery_fee_3km || 100
        : lienProfile.penalty_delivery_fee_3_10km || 150;
    }

    if (mode === 'same_day') {
      return rawSubtotal < 500 ? 125 : 75;
    }
    return 0;
  }, [lienProfile, estimatedDistanceKm, mode, rawSubtotal]);

  const afterDiscountTotal = Math.max(0, rawSubtotal - tieredDiscountAmount - promoDiscount - couponDiscount - loyaltyDeduction + cardFee + deliveryFee);

  // Wallet deduction calculation
  const walletDeduction = useMemo(() => {
    if (!applyWallet || walletBalance <= 0 || paymentMethod !== 'wallet') return 0;
    return Math.min(walletBalance, afterDiscountTotal);
  }, [applyWallet, walletBalance, paymentMethod, afterDiscountTotal]);

  const finalPayable = Math.max(0, afterDiscountTotal - walletDeduction);

  // Pre-fill from customer's saved profile or family locked address
  useEffect(() => {
    // Check saved draft from previous session
    try {
      const saved = localStorage.getItem('jvlsd_checkout_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.customer_name || parsed.mobile || parsed.address)) {
          setHasSavedDraft(true);
        }
      }
    } catch (e) {}

    // Check if user has ordered before locally or in profile
    const localOrderHistory = localStorage.getItem('jvlsd_completed_orders');
    if (localOrderHistory) {
      try {
        const parsedOrders = JSON.parse(localOrderHistory);
        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          setPreviousOrdersCount((prev) => Math.max(prev, parsedOrders.length));
        }
      } catch (e) {}
    }

    if (profile) {
      const activeAddr = profile.addresses?.[0];
      const addrStr = activeAddr
        ? `${activeAddr.house_flat}, ${activeAddr.building_society}, ${activeAddr.area_road}, ${activeAddr.city} - ${activeAddr.pincode}${activeAddr.digipin ? ' (DIGIPIN: ' + activeAddr.digipin + ')' : ''}`
        : '';

      const nameParts = (profile.full_name || '').trim().split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      // Check if user has domestic help address lock (directly or via family group)
      if (profile.family_group_id) {
        fetchFamilyGroup(profile.family_group_id).then((grp) => {
          if (grp) {
            const memberRecord = grp.members?.find((m) => m.uid === user?.uid);
            if (memberRecord?.address_locked) {
              setIsAddressLocked(true);
              setInfo((prev) => ({
                ...prev,
                address: grp.household_address || prev.address || addrStr,
                street_address: grp.household_address || prev.street_address || addrStr,
              }));
            }
          }
        }).catch(() => {});
      } else {
        const locked = (profile as any).address_locked === true;
        setIsAddressLocked(locked);
      }

      setInfo((prev) => ({
        ...prev,
        first_name: prev.first_name || fName,
        last_name: prev.last_name || lName,
        customer_name: prev.customer_name || profile.full_name || '',
        email: prev.email || profile.email || user?.email || '',
        telephone: prev.telephone || profile.mobile || '',
        mobile: prev.mobile || profile.mobile || '',
        city: activeAddr?.city || prev.city || 'AHMEDABAD',
        state: activeAddr?.state || prev.state || 'GUJARAT',
        pincode: activeAddr?.pincode || prev.pincode || '',
        digipin: activeAddr?.digipin || prev.digipin || '',
        house_flat: activeAddr?.house_flat || prev.house_flat || '',
        building_society: activeAddr?.building_society || prev.building_society || '',
        landmark: activeAddr?.landmark || prev.landmark || '',
        area: activeAddr?.area_road || prev.area || '',
        street_address: prev.street_address || addrStr,
        address: prev.address || addrStr,
      }));
    } else {
      // For returning guest / 1st-timer who saved info locally: auto-populate seamlessly
      try {
        const saved = localStorage.getItem('jvlsd_checkout_draft');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.customer_name || parsed.first_name || parsed.mobile || parsed.address)) {
            setInfo((prev) => ({
              ...prev,
              ...parsed,
            }));
          }
        }
      } catch (e) {}
    }
    // Load customer lien & observation profile if phone or user is available
    const activePhone = profile?.mobile || info.mobile || user?.uid;
    if (activePhone) {
      fetchCustomerLienProfile(activePhone).then((lp) => {
        setLienProfile(lp);
      }).catch(() => {});
    }

    if (user?.uid) {
      fetchUserFinancials(user.uid).then((fin) => {
        setWalletBalance(fin.walletBalance);
        setLoyaltyPoints(fin.loyaltyPoints);
        setPromoBalance(fin.promoBalance);
        if (fin.walletBalance > 0) setApplyWallet(true);
        if (fin.promoBalance > 0) setApplyPromo(true);
      });

      // Track monthly orders count and ₹500+ qualifying order for tiered discount eligibility
      fetchOrders(user.uid).then((orders) => {
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthOrders = orders.filter((o) => (o.created_at || '').startsWith(thisMonth));
        setMonthlyOrdersCount(thisMonthOrders.length);

        // Check if user has an order >= ₹500 this month
        const has500 = thisMonthOrders.some((o) => (o.total_amount || 0) >= 500);
        setHasMonthFirst500Order(has500);

        // Check count of smaller orders (between ₹100 and ₹499) this month
        const smaller100Count = thisMonthOrders.filter((o) => {
          const amt = o.total_amount || 0;
          return amt >= 100 && amt < 500;
        }).length;
        setSmaller100OrdersMonthCount(smaller100Count);
      });
    }
  }, [profile, user]);

  const deliveryDate = mode === 'next_day' ? tomorrowISO() : todayISO();

  const resumeFromDraft = () => {
    try {
      const saved = localStorage.getItem('jvlsd_checkout_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setInfo((prev) => ({
          ...prev,
          ...parsed,
        }));
        setHasSavedDraft(false);
      }
    } catch (e) {}
  };

  const clearSavedDraft = () => {
    localStorage.removeItem('jvlsd_checkout_draft');
    setHasSavedDraft(false);
  };

  const update = (k: keyof typeof info, v: string) => {
    // Requirements (Part D):
    // 1. Profile fields strictly CAPITAL LETTERS & NUMBERS (NUMERIC ONLY) - no special characters.
    // 2. Address can have ONLY commas (,) and hyphens (-) alongside alphanumeric characters.
    let sanitized = v;

    if (k === 'notes') {
      sanitized = v; // notes can have normal punctuation
    } else if (k === 'email') {
      sanitized = v.toLowerCase().trim();
    } else if (k === 'street_address' || k === 'address' || k === 'house_flat' || k === 'building_society' || k === 'landmark' || k === 'area') {
      // Address allowed: A-Z, 0-9, space, comma (,), hyphen (-)
      sanitized = v.replace(/[^A-Za-z0-9, \-]/g, '').toUpperCase();
    } else if (k === 'telephone' || k === 'mobile' || k === 'pincode') {
      // Numeric only
      sanitized = v.replace(/\D/g, '');
    } else {
      // Customer profile fields: uppercase alphanumeric only, no special characters
      sanitized = v.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase();
    }

    const updated = { ...info, [k]: sanitized };
    setInfo(updated);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));

    // Auto-save draft if permission granted
    if (saveDraftConsent) {
      try {
        localStorage.setItem('jvlsd_checkout_draft', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!info.first_name.trim() && !info.customer_name.trim()) e.first_name = 'Please enter first name.';
    if (!info.last_name.trim() && !info.customer_name.trim()) e.last_name = 'Please enter last name.';
    if (!info.email.trim()) e.email = 'Please enter email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())) e.email = 'Please enter a valid email address.';

    const phone = (info.telephone || info.mobile).trim().replace(/\D/g, '');
    if (!phone) e.telephone = 'Please enter 10-digit telephone / mobile number.';
    else if (!/^[6-9]\d{9}$/.test(phone)) e.telephone = 'Mobile/Telephone strictly 10 digits (India).';

    if (!info.street_address.trim() && !info.address.trim()) e.street_address = 'Please enter your street address / apartment.';
    if (!info.pincode.trim()) e.pincode = 'Please enter valid 6-digit PIN code.';

    // Geofencing validation for dispatch zones from Navrangpura Hub (23.0372° N, 72.5613° E)
    // 0 to 3 km: Free delivery
    // 3 to 10 km: Paid delivery (default ₹30 fee) when enabled by administrator
    // Beyond 10 km: Outside service boundary
    const NAVRANGPURA_HUB = { lat: 23.0372, lng: 72.5613 };
    const AHMEDABAD_PIN_COORDS: Record<string, { lat: number; lng: number }> = {
      '380009': { lat: 23.0372, lng: 72.5613 }, // Navrangpura (~0.0 km)
      '380014': { lat: 23.0410, lng: 72.5700 }, // Usmanpura (~1.0 km)
      '380013': { lat: 23.0520, lng: 72.5650 }, // Vadaj (~1.7 km)
      '380006': { lat: 23.0180, lng: 72.5560 }, // Ellisbridge (~2.2 km)
      '380015': { lat: 23.0250, lng: 72.5350 }, // Ambawadi / Polytechnic (~2.8 km)
      '380052': { lat: 23.0550, lng: 72.5300 }, // Memnagar (~3.4 km) - 3-10km zone
      '380054': { lat: 23.0500, lng: 72.5150 }, // Thaltej (~4.9 km) - 3-10km zone
      '380051': { lat: 23.0350, lng: 72.5050 }, // Bodakdev (~5.5 km) - 3-10km zone
      '380018': { lat: 23.0200, lng: 72.6100 }, // Saraspur (~5.2 km) - 3-10km zone
      '380001': { lat: 23.0260, lng: 72.5870 }, // Old City (~2.8 km)
    };

    const calculateHaversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const pinMatch = info.address.match(/\b(380\d{3})\b/);
    let calculatedDistance = 1.5; // default nearby
    if (pinMatch && AHMEDABAD_PIN_COORDS[pinMatch[1]]) {
      const coords = AHMEDABAD_PIN_COORDS[pinMatch[1]];
      calculatedDistance = calculateHaversineKm(NAVRANGPURA_HUB.lat, NAVRANGPURA_HUB.lng, coords.lat, coords.lng);
    } else if (
      info.address.toUpperCase().includes('NAVRANGPURA') ||
      info.address.toUpperCase().includes('LAKUDI') ||
      info.address.toUpperCase().includes('STADIUM') ||
      info.address.toUpperCase().includes('USMANPURA')
    ) {
      calculatedDistance = 1.0;
    }

    if (calculatedDistance > 10.0) {
      e.address = `Delivery address is approximately ${calculatedDistance.toFixed(1)} km away, which is outside our 10 km maximum service boundary (as per DIGIPIN).`;
    }

    return e;
  };

  const handlePreConfirm = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // 2nd-Timer Rule Enforcement:
    // If returning customer (has ordered previously or profile exists) and not logged in with completed profile
    const isReturningCustomer = previousOrdersCount > 0 || monthlyOrdersCount > 0;
    const isProfileIncomplete = !user || !profile || !profile.full_name || !profile.mobile || !(profile.addresses && profile.addresses.length > 0);

    if (isReturningCustomer && isProfileIncomplete) {
      setShowSecondTimerGateModal(true);
      return;
    }

    // Open mandatory Address Confirmation Modal before submission
    setShowConfirmModal(true);
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const finalCustomerName = (info.customer_name || `${info.first_name} ${info.last_name}`).trim();
      const finalMobile = (info.telephone || info.mobile).trim();
      const finalAddress = info.address.trim() || `${info.street_address ? info.street_address + ', ' : ''}${info.house_flat ? info.house_flat + ', ' : ''}${info.building_society ? info.building_society + ', ' : ''}${info.area ? info.area + ', ' : ''}${info.city}, ${info.state} - ${info.pincode}`;

      const res = await createOrder({
        customer_name: finalCustomerName,
        mobile: finalMobile,
        address: finalAddress,
        mode,
        items: cartItems,
        expected_delivery: deliveryDate,
        notes: info.notes.trim() || undefined,
        user_id: user?.uid ?? undefined,
        subtotal: rawSubtotal,
        delivery_charge: deliveryFee,
        discount_amount: tieredDiscountAmount + promoDiscount + couponDiscount + loyaltyDeduction,
        total_amount: finalPayable,
        payment_method: paymentMethod === 'wallet' ? 'Prepaid Wallet' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'sodexo' ? 'Sodexo/Pluxee' : 'Cash on Delivery',
      });

      // Update user financial balance if wallet or discounts applied
      if (user?.uid && (walletDeduction > 0 || promoDiscount > 0 || loyaltyDeduction > 0)) {
        try {
          const current = await fetchUserFinancials(user.uid);
          const newWallet = current.walletBalance - walletDeduction;
          const newPromo = current.promoBalance - promoDiscount;
          const newLoyalty = current.loyaltyPoints - loyaltyDeduction + 5; // +5 earned
          localStorage.setItem(`jvlsd_wallet_${user.uid}`, JSON.stringify({
            ...current,
            walletBalance: Math.max(0, newWallet),
            promoBalance: Math.max(0, newPromo),
            loyaltyPoints: newLoyalty,
          }));
        } catch (e) {}
      }

      // Record local order history for 2nd-time tracking
      try {
        const existingHistory = JSON.parse(localStorage.getItem('jvlsd_completed_orders') || '[]');
        existingHistory.push({
          order_id: res?.id || `ORD-${Date.now()}`,
          date: new Date().toISOString(),
          customer_name: finalCustomerName,
          mobile: finalMobile,
        });
        localStorage.setItem('jvlsd_completed_orders', JSON.stringify(existingHistory));
        localStorage.setItem('jvlsd_local_orders_count', String(existingHistory.length));
        // Clear draft once ordered successfully
        localStorage.removeItem('jvlsd_checkout_draft');
      } catch (e) {}

      // Send Audio alert + SMS/WhatsApp order confirmation
      try {
        await sendSmsWhatsAppAlert({
          recipient_phone: finalMobile,
          channel: 'both',
          type: 'subscription_change',
          title: 'Order Placed & Dispatched Alert',
          message: `Namaste ${finalCustomerName}! Your JVLSD Fresh Daily order (#${(res?.id || `ORD-${Date.now()}`).slice(-8)}) has been successfully confirmed for delivery on ${deliveryDate}. Final payable: ₹${finalPayable.toFixed(2)}. Verified via WhatsApp OTP upon morning arrival.`,
          action_target_id: res?.id,
          approval_status: 'accepted',
        });
      } catch (e) {}

      setShowConfirmModal(false);
      onPlaced(res?.id || `ORD-${Date.now()}`, finalCustomerName);
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

      {/* Rural Paradise Style Progress Stepper */}
      <div className="mt-4 mb-6 flex items-center justify-center gap-2 text-xs font-semibold text-ink-500">
        <span className="font-bold text-ink-950 border-b-2 border-gold-500 pb-0.5">Address</span>
        <span className="text-ink-300">---------</span>
        <span>Dispatch</span>
        <span className="text-ink-300">---------</span>
        <span>Review Order &amp; Make Payment</span>
      </div>

      {/* 1st-Timer vs 2nd-Timer Notice Banner */}
      {!user && previousOrdersCount === 0 && (
        <div className="mt-4 rounded-2xl bg-emerald-50/80 p-4 border border-emerald-300 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-bold text-emerald-900">Welcome, 1st-Time Shopper!</p>
              <p className="text-emerald-800 text-[11px] leading-snug">
                Enjoy seamless guest checkout — no mandatory pre-registration required for your initial order. All applicable promotional discounts are automatically applied.
              </p>
            </div>
          </div>
          <a
            href="/login"
            className="shrink-0 inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline text-xs"
          >
            Have an account? Sign in
          </a>
        </div>
      )}

      {/* Draft Resume Alert */}
      {hasSavedDraft && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 border border-amber-300 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
              <RotateCcw className="h-4 w-4" />
            </span>
            <div>
              <p className="font-bold text-amber-950">You have unsaved details from your previous session</p>
              <p className="text-amber-800 text-[11px]">Would you like to complete checkout from where you left off?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resumeFromDraft}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-3.5 py-1.5 font-bold text-white hover:bg-amber-800 shadow-2xs text-xs"
            >
              Resume Draft
            </button>
            <button
              type="button"
              onClick={clearSavedDraft}
              className="rounded-xl border border-amber-300 px-3 py-1.5 font-semibold text-amber-900 hover:bg-amber-100 text-xs"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Returning 2nd-Time Customer Registration Callout */}
      {!user && previousOrdersCount > 0 && (
        <div className="mt-4 rounded-2xl bg-gold-50 p-4 border border-gold-300 text-xs text-ink-900 flex items-start gap-3 shadow-2xs">
          <UserCheck className="h-5 w-5 shrink-0 text-gold-700 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-ink-950">Welcome Back! (2nd Purchase Requirement):</span> Per store policy, customers placing their 2nd order must create an account and complete their profile details before final payment.
            <div className="mt-2">
              <a
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3.5 py-1.5 font-bold text-white hover:bg-brand-800 text-xs shadow-soft"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In / Register Account
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Customer Caution & 6-Month Lien Period Notification Banner */}
      {lienProfile?.is_cautious_marked && (
        <div className="mt-4 rounded-2xl bg-rose-50 border-2 border-rose-300 p-4 text-xs shadow-soft animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-black">
              ⚠️
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-extrabold text-sm uppercase tracking-wider text-rose-950 bg-rose-200/80 px-2 py-0.5 rounded-md">
                  Account Status: BE CAUTIOUS
                </span>
                {lienProfile.is_in_lien_period && (
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    6-Month Lien Observation Active
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-rose-900 leading-relaxed font-medium">
                Our logistics records indicate multiple past undelivered attempts due to non-availability with no instructions on where to deliver next door.
                {lienProfile.is_in_lien_period ? (
                  <>
                    {' '}During this 6-month lien observation period (until{' '}
                    <span className="font-bold">
                      {new Date(lienProfile.lien_end_date || '').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    ), an adjusted delivery charge of <span className="font-bold">₹100 (within 3km)</span> or <span className="font-bold">₹150 (3-10km range)</span> applies.
                    Once orders complete without missed deliveries, standard rates will be restored.
                  </>
                ) : (
                  ' Please ensure someone is present or leave specific doorstep delivery notes below.'
                )}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-rose-800 font-semibold">
                <span>Total Recorded Incidences: {lienProfile.incidents.length}</span>
                <span>•</span>
                <span>Current Distance: ~{estimatedDistanceKm.toFixed(1)} km ({estimatedDistanceKm <= 3 ? '≤ 3km tier: ₹100' : '3-10km tier: ₹150'})</span>
              </div>
            </div>
          </div>
        </div>
      )}

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

        {/* Coupon Code Section (Directly from reference page) */}
        <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-3.5 shadow-2xs">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="input-field py-2 text-xs uppercase font-mono tracking-wider flex-1"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#2e7d32] px-5 py-2 text-xs font-bold text-white hover:bg-[#256629] shadow-soft shrink-0"
            >
              Apply
            </button>
          </form>
          {couponMessage && (
            <p className={`mt-2 text-[11px] font-semibold ${couponApplied ? 'text-emerald-700' : 'text-amber-800'}`}>
              {couponMessage}
            </p>
          )}
        </div>

        {/* Financial & Automated Checkout Breakdown */}
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-brand-50/40 p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-200/60 pb-3">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-700" /> LSD Privilege, Tiered Discounts &amp; Balances
            </span>
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] text-white">Verified Account</span>
          </div>

          <div className="mt-3 space-y-2.5 text-xs text-ink-700">
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Subtotal ({cartItems.length} items):</span>
              <span className="font-mono font-bold text-ink-900">₹{rawSubtotal.toFixed(2)}</span>
            </div>

            {/* A: Monthly Order Tier Status */}
            <div className="rounded-xl bg-white/80 p-3 border border-emerald-300">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink-900">20% Volume Privilege Discount</span>
                  <p className="text-[10px] text-ink-500">
                    {!isMasterDiscountActive
                      ? 'Discount switch is currently inactive per store operator master switch.'
                      : rawSubtotal >= 500
                      ? '✓ 20% discount unlocked for monthly first purchase ₹500 and above!'
                      : rawSubtotal >= 100
                      ? hasMonthFirst500Order
                        ? smaller100OrdersMonthCount < 3
                          ? `✓ 20% discount unlocked for ₹100+ purchase (${smaller100OrdersMonthCount}/3 used this month)!`
                          : 'Limit reached: Maximum 3 smaller ₹100+ purchases with 20% discount allowed per month.'
                        : 'Requires prior ₹500+ qualifying monthly purchase to unlock 20% on smaller ₹100+ purchases.'
                      : `Add ₹${(500 - rawSubtotal).toFixed(2)} more to cart to unlock 20% discount.`}
                  </p>
                </div>
                <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg ${tieredDiscountPercent > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-ink-100 text-ink-600'}`}>
                  {tieredDiscountPercent > 0 ? `${tieredDiscountPercent}% OFF (-₹${tieredDiscountAmount.toFixed(2)})` : '0%'}
                </span>
              </div>
            </div>

            {/* Promo Discount Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-white/70 p-2.5 border border-ink-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyPromo}
                  onChange={(e) => setApplyPromo(e.target.checked)}
                  disabled={promoBalance <= 0 || rawSubtotal < 100}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-ink-900">Use ₹50 from Discount Balance</span>
                  <p className="text-[10px] text-ink-500">
                    {rawSubtotal >= 100
                      ? `Applicable for orders of ₹100 & above monthly · Available: ₹${promoBalance}`
                      : 'Requires minimum order of ₹100 to apply discount balance'}
                  </p>
                </div>
              </label>
              <span className="font-mono font-bold text-emerald-700">
                -₹{promoDiscount.toFixed(2)}
              </span>
            </div>

            {/* Loyalty Points Redemption Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-white/70 p-2.5 border border-ink-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyLoyalty}
                  onChange={(e) => setApplyLoyalty(e.target.checked)}
                  disabled={loyaltyPoints < 75}
                  className="rounded text-gold-600 focus:ring-gold-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-ink-900">Redeem Loyalty Points (1 pt = ₹1)</span>
                  <p className="text-[10px] text-ink-500">
                    {loyaltyPoints >= 75
                      ? `Eligible (Balance: ${loyaltyPoints} pts · Max 5 pts/bill · Keeps 20 floor)`
                      : `Needs 75 pts to redeem (Current: ${loyaltyPoints} pts)`}
                  </p>
                </div>
              </label>
              <span className="font-mono font-bold text-gold-700">
                {loyaltyDeduction > 0 ? `-₹${loyaltyDeduction.toFixed(2)}` : '₹0.00'}
              </span>
            </div>

            {/* Coupon Code Discount Line */}
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span>Coupon Code Discount ({couponCode}):</span>
                <span className="font-mono font-bold">-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Credit Card Fee Display if Applicable */}
            {cardFee > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <span>Disclosed Credit Card Processing Fee (1.8%):</span>
                <span className="font-mono font-bold">+₹{cardFee.toFixed(2)}</span>
              </div>
            )}

            {/* Delivery Charge Line Item (Including Caution/Lien Observation Penalties) */}
            {deliveryFee > 0 && (
              <div className={`flex items-center justify-between rounded-xl p-2.5 border text-xs ${
                lienProfile?.is_in_lien_period
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}>
                <div>
                  <span className="font-bold flex items-center gap-1.5">
                    <Truck className={`h-3.5 w-3.5 ${lienProfile?.is_in_lien_period ? 'text-rose-700' : 'text-amber-700'}`} />
                    {lienProfile?.is_in_lien_period
                      ? 'Lien Period Delivery Charge (6-Month Observation Penalty):'
                      : 'Same-Day Immediate Delivery Charge (10 km radius as per DIGIPIN):'}
                  </span>
                  <p className="text-[10px] mt-0.5 leading-snug">
                    {lienProfile?.is_in_lien_period ? (
                      estimatedDistanceKm <= 3.0
                        ? `₹100 applied (Within 3 km penalty tier for accounts under 6-month lien observation). Note: Delivery charges are strictly non-refundable upon cancellation.`
                        : `₹150 applied (3-10 km range penalty tier for accounts under 6-month lien observation). Note: Delivery charges are strictly non-refundable upon cancellation.`
                    ) : rawSubtotal < 500 ? (
                      '₹125 applied (Order value is below ₹500. Order ₹500+ for ₹75 delivery). Non-refundable upon cancellation.'
                    ) : (
                      '₹75 applied (Discounted delivery charge for orders of ₹500 and above). Non-refundable upon cancellation.'
                    )}
                  </p>
                </div>
                <span className="font-mono font-bold shrink-0 ml-2">+₹{deliveryFee.toFixed(2)}</span>
              </div>
            )}

            {/* Prepaid Wallet Deduction Toggle */}
            {paymentMethod === 'wallet' && (
              <div className="flex items-center justify-between rounded-xl bg-white/70 p-2.5 border border-ink-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyWallet}
                    onChange={(e) => setApplyWallet(e.target.checked)}
                    disabled={walletBalance <= 0}
                    className="rounded text-brand-700 focus:ring-brand-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-ink-900">Deduct from Prepaid Wallet</span>
                    <p className="text-[10px] text-ink-500">Available Wallet Balance: ₹{walletBalance.toFixed(2)}</p>
                  </div>
                </label>
                <span className="font-mono font-bold text-brand-700">
                  -₹{walletDeduction.toFixed(2)}
                </span>
              </div>
            )}

            {/* Final Payable */}
            <div className="flex items-center justify-between pt-3 border-t border-emerald-200 text-sm font-bold">
              <span className="text-ink-900">Net Payable Amount:</span>
              <span className="font-mono text-lg text-emerald-950 font-black">₹{finalPayable.toFixed(2)}</span>
            </div>
            {finalPayable === 0 && rawSubtotal > 0 && (
              <p className="text-center text-[11px] font-semibold text-emerald-800">
                ✓ Fully covered by prepaid wallet &amp; promotional allowances. Zero cash due at delivery.
              </p>
            )}
          </div>
        </div>

        {/* D: Multi-Payment Methods Selector with Disclosures */}
        <div className="mt-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft">
          <h3 className="font-display text-sm font-bold text-ink-950">Payment &amp; Settlement Method</h3>
          <p className="mt-0.5 text-xs text-ink-500">Select how you want to pay the net balance.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                id: 'wallet',
                label: 'Prepaid Wallet',
                desc: `Instant default settlement (Balance: ₹${walletBalance})`,
              },
              {
                id: 'upi',
                label: 'UPI (GPay / PhonePe / Paytm)',
                desc: 'Zero transaction fee · Instant secure gateway settlement',
              },
              {
                id: 'card',
                label: 'Credit / Debit Card',
                desc: '1.8% gateway processing fee charged by merchant provider',
              },
              {
                id: 'sodexo',
                label: 'Sodexo / Pluxee Food Card',
                desc: 'Supported for fresh meal & fruit produce',
              },
            ].map((pm) => (
              <label
                key={pm.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                  paymentMethod === pm.id
                    ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={pm.id}
                  checked={paymentMethod === pm.id}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="mt-0.5 text-brand-700 focus:ring-brand-500"
                />
                <div>
                  <p className="text-xs font-bold text-ink-950">{pm.label}</p>
                  <p className="text-[10px] text-ink-500 leading-tight mt-0.5">{pm.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Refund Destination Preference */}
          <div className="mt-4 border-t border-ink-100 pt-3">
            <label className="text-xs font-bold text-ink-800">Refund Destination Option (in case of quality return):</label>
            <div className="mt-2 flex gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="refundPreference"
                  value="wallet"
                  checked={refundPreference === 'wallet'}
                  onChange={() => setRefundPreference('wallet')}
                  className="text-brand-700"
                />
                <span>Instant Credit to Prepaid Wallet (Recommended for next order)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="refundPreference"
                  value="original"
                  checked={refundPreference === 'original'}
                  onChange={() => setRefundPreference('original')}
                  className="text-brand-700"
                />
                <span>Refund to Original Source (Takes 3–5 banking days)</span>
              </label>
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
              {mode === 'next_day' ? 'Tomorrow: 8:00 AM – 9:00 AM only' : 'Any time & immediate delivery (within 10 km DIGIPIN)'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-soft">
        <div className="flex items-center justify-between border-b border-ink-100 pb-3">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-ink-900">Shipping Address</h2>
            <p className="text-xs text-ink-500">Provide recipient contact and delivery coordinates for verified doorstep dispatch.</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
            No COD · WhatsApp OTP Verification
          </span>
        </div>

        {submitError && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* 1. First Name */}
          <div>
            <label className="label" htmlFor="co-first-name">First Name <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-first-name"
              className="input-field uppercase tracking-wide font-medium"
              value={info.first_name}
              onChange={(e) => {
                const val = e.target.value.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase();
                setInfo((prev) => ({
                  ...prev,
                  first_name: val,
                  customer_name: `${val} ${prev.last_name}`.trim(),
                }));
                if (errors.first_name) setErrors((err) => ({ ...err, first_name: '' }));
              }}
              autoComplete="given-name"
              placeholder="e.g. SURESH (CAPITALS ONLY)"
            />
            {errors.first_name && <p className="field-error" role="alert">{errors.first_name}</p>}
          </div>

          {/* 2. Last Name */}
          <div>
            <label className="label" htmlFor="co-last-name">Last Name <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-last-name"
              className="input-field uppercase tracking-wide font-medium"
              value={info.last_name}
              onChange={(e) => {
                const val = e.target.value.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase();
                setInfo((prev) => ({
                  ...prev,
                  last_name: val,
                  customer_name: `${prev.first_name} ${val}`.trim(),
                }));
                if (errors.last_name) setErrors((err) => ({ ...err, last_name: '' }));
              }}
              autoComplete="family-name"
              placeholder="e.g. SHAH (CAPITALS ONLY)"
            />
            {errors.last_name && <p className="field-error" role="alert">{errors.last_name}</p>}
          </div>

          {/* 3. Email */}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="co-email">Email <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-email"
              type="email"
              className="input-field font-medium lowercase"
              value={info.email}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().trim();
                setInfo((prev) => ({ ...prev, email: val }));
                if (errors.email) setErrors((err) => ({ ...err, email: '' }));
              }}
              autoComplete="email"
              placeholder="e.g. suresh.shah@gmail.com"
            />
            {errors.email && <p className="field-error" role="alert">{errors.email}</p>}
          </div>

          {/* 4. Address (Textarea style - only letters, numbers, spaces, commas and hyphens allowed) */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="co-address">Address <span className="text-red-600" aria-hidden>*</span></label>
              <span className="text-[10px] text-ink-500 font-mono">Only commas (,) &amp; hyphens (-) allowed</span>
            </div>
            <textarea
              id="co-address"
              rows={3}
              className="input-field resize-y font-medium uppercase"
              value={info.street_address}
              onChange={(e) => {
                const val = e.target.value.replace(/[^A-Za-z0-9, \-]/g, '').toUpperCase();
                setInfo((prev) => {
                  const combined = `${val ? val + ', ' : ''}${prev.landmark ? 'NEAR ' + prev.landmark + ', ' : ''}${prev.area ? prev.area + ', ' : ''}${prev.city}, ${prev.state} - ${prev.pincode}`;
                  return { ...prev, street_address: val, address: combined.toUpperCase() };
                });
                if (errors.street_address) setErrors((err) => ({ ...err, street_address: '' }));
              }}
              placeholder="e.g. FLAT B-402, SHIVALIK GREENS APARTMENT, NEAR SARDAR PATEL STADIUM"
            />
            {errors.street_address && <p className="field-error" role="alert">{errors.street_address}</p>}
          </div>

          {/* 5. City */}
          <div>
            <label className="label" htmlFor="co-city">City <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-city"
              className="input-field uppercase font-medium"
              value={info.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="e.g. AHMEDABAD"
            />
          </div>

          {/* 6. Country Dropdown */}
          <div>
            <label className="label" htmlFor="co-country">Country <span className="text-red-600" aria-hidden>*</span></label>
            <select
              id="co-country"
              className="input-field font-medium"
              value={info.country}
              onChange={(e) => update('country', e.target.value)}
            >
              <option value="India">India</option>
            </select>
          </div>

          {/* 7. State / Province Dropdown */}
          <div>
            <label className="label" htmlFor="co-state">State / Province <span className="text-red-600" aria-hidden>*</span></label>
            <select
              id="co-state"
              className="input-field font-medium"
              value={info.state}
              onChange={(e) => update('state', e.target.value)}
            >
              <option value="GUJARAT">Gujarat</option>
              <option value="MAHARASHTRA">Maharashtra</option>
              <option value="RAJASTHAN">Rajasthan</option>
              <option value="DELHI">Delhi</option>
              <option value="MADHYA PRADESH">Madhya Pradesh</option>
            </select>
          </div>

          {/* 8. ZIP Code with Auto-Mapping */}
          <div>
            <label className="label" htmlFor="co-pin">ZIP Code <span className="text-red-600" aria-hidden>*</span></label>
            <input
              id="co-pin"
              type="text"
              className="input-field font-mono font-bold tracking-wider"
              value={info.pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              maxLength={6}
              placeholder="e.g. 380009"
            />
            {errors.pincode && <p className="field-error" role="alert">{errors.pincode}</p>}
          </div>

          {/* 9. Telephone */}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="co-telephone">Telephone / Mobile (Numbers Only) <span className="text-red-600" aria-hidden>*</span></label>
            <div className="relative">
              <input
                id="co-telephone"
                type="tel"
                className="input-field font-mono pr-28"
                value={info.telephone || info.mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setInfo((prev) => ({ ...prev, telephone: val, mobile: val }));
                  if (errors.telephone) setErrors((err) => ({ ...err, telephone: '' }));
                }}
                autoComplete="tel"
                placeholder="9825012345 (10 DIGITS ONLY)"
                maxLength={10}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                WhatsApp OTP
              </span>
            </div>
            {errors.telephone && <p className="field-error" role="alert">{errors.telephone}</p>}
          </div>

          {/* 10. Billing Address is same as Shipping Address Checkbox */}
          <div className="sm:col-span-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink-900">
              <input
                type="checkbox"
                checked={info.billing_same_as_shipping}
                onChange={(e) => setInfo((prev) => ({ ...prev, billing_same_as_shipping: e.target.checked }))}
                className="rounded text-brand-700 focus:ring-brand-500 h-4 w-4"
              />
              <span>Billing Address is same as Shipping Address</span>
            </label>
          </div>

          {/* 11. Auto DIGIPIN Field & Resolved Area */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="label">Auto-Captured DIGIPIN (Postal Grid Code)</label>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Postal Code
              </span>
            </div>
            <input
              type="text"
              readOnly
              className="input-field font-mono text-xs bg-ink-50/80 cursor-not-allowed font-bold text-brand-900"
              value={info.digipin || 'Automatically assigned upon entering PIN / ZIP code'}
            />
          </div>

          {/* 12. Order Notes */}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="co-notes">Delivery &amp; Special Handling Notes <span className="text-ink-400 font-normal">(optional)</span></label>
            <textarea
              id="co-notes"
              rows={2}
              className="input-field resize-y font-semibold text-ink-900"
              value={info.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="e.g. Please ring bell twice. Delivery slot: 8:00 AM - 9:00 AM."
            />
          </div>

          {/* 13. Save Draft with Permission Option */}
          <div className="sm:col-span-2 rounded-2xl bg-ink-50/70 p-3.5 border border-ink-200/80">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveDraftConsent}
                onChange={(e) => {
                  const allowed = e.target.checked;
                  setSaveDraftConsent(allowed);
                  localStorage.setItem('jvlsd_save_draft_consent', String(allowed));
                  if (allowed) {
                    try {
                      localStorage.setItem('jvlsd_checkout_draft', JSON.stringify(info));
                    } catch (err) {}
                  } else {
                    localStorage.removeItem('jvlsd_checkout_draft');
                  }
                }}
                className="mt-0.5 rounded text-brand-700 focus:ring-brand-500 h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-bold text-ink-900 flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5 text-brand-700" /> Save entered information for quick completion
                </span>
                <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">
                  With your permission, we securely store your delivery address and contact details locally in your browser so you can pick up exactly from where you left off if you navigate away.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-[#eab308] hover:bg-[#ca8a04] px-10 py-3.5 text-sm font-bold text-ink-950 shadow-soft transition-all"
          disabled={submitting}
        >
          Continue
        </button>
      </div>

      {/* 2nd-Timer Registration Enforcement Modal */}
      {showSecondTimerGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-scale-in border border-gold-300">
            <div className="flex items-center gap-3 text-brand-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-800">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink-950">Registration Required</h3>
                <p className="text-xs text-ink-500">2nd-time purchase policy for verified households.</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-950 space-y-2">
              <p className="font-bold text-amber-900">
                You have previously placed an order with JVLSD Fresh Daily.
              </p>
              <p className="leading-relaxed">
                While first-time customers can checkout as guests to explore easily, returning 2nd-time customers must register an account and complete customer profiling (Name, Mobile, Family details &amp; Delivery address) before final checkout and payment settlement.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setShowSecondTimerGateModal(false)}
                className="w-full sm:w-auto rounded-xl border border-ink-200 px-4 py-2.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
              >
                Back to Review
              </button>
              <a
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-800 shadow-soft"
              >
                <LogIn className="h-4 w-4" /> Sign In / Complete Registration
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Address Re-Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-fade-up border border-gold-300">
            <div className="flex items-center gap-3 text-brand-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink-950">Address Re-Confirmation &amp; Compliance</h3>
                <p className="text-xs text-ink-500">Please verify your doorstep dispatch location before final invoice generation.</p>
              </div>
            </div>

            {/* Official JVLSD Authenticity & Compliance Card */}
            <div className="mt-4">
              <JvlsdAuthenticitySeal className="w-full" />
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50/60 p-4 border border-amber-200/80">
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

              {/* Order Delivery Instruction clearly differentiated in bold readable font */}
              <div className="mt-3 rounded-xl bg-white p-3 border border-amber-300 shadow-2xs">
                <p className="text-xs font-black uppercase tracking-wider text-forest-900">
                  📋 Order Delivery Instructions on Bill:
                </p>
                <p className="mt-1 font-sans text-sm font-black text-ink-950 leading-snug">
                  {info.notes ? `"${info.notes}"` : mode === 'next_day' ? 'NEXT-DAY 8:00 AM – 9:00 AM ONLY · VERIFY OTP ON ARRIVAL' : 'SAME-DAY IMMEDIATE DELIVERY · VERIFY OTP ON ARRIVAL'}
                </p>
              </div>

              {/* Mandatory Official Compliance Licenses on Bill Invoice */}
              <div className="mt-3 rounded-xl bg-ink-950 p-3 text-gold-200 font-mono text-[10px] space-y-0.5 border border-gold-400/30">
                <p className="font-bold text-gold-300 uppercase tracking-wider text-[11px] mb-1">
                  Official Bill / Invoice Compliance Record
                </p>
                <p><span className="text-ink-400">OPERATOR:</span> {COMPANY_CONFIG.legalName} ({COMPANY_CONFIG.franchiseeClarification})</p>
                <p><span className="text-ink-400">LLPIN:</span> {COMPANY_CONFIG.certifications.cinLlp}</p>
                <p><span className="text-ink-400">FSSAI:</span> {COMPANY_CONFIG.certifications.fssaiLicense}</p>
                <p><span className="text-ink-400">GSTIN:</span> {COMPANY_CONFIG.certifications.gstin}</p>
                <p className="text-emerald-400 text-[9px] pt-1 font-sans">{COMPANY_CONFIG.sustainabilityStatement}</p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-200">
                <span>💬</span>
                <span>Delivery OTP will be sent to WhatsApp number ({info.mobile}) upon dispatch.</span>
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
