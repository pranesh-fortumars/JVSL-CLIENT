import { useState, useEffect } from 'react';
import {
  Leaf,
  Apple,
  Milk,
  Clock,
  Truck,
  ShieldCheck,
  CalendarCheck,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  PackageCheck,
  MapPin,
  TrendingDown,
  ShoppingBasket,
  X,
} from 'lucide-react';
import { navigate, PATHS } from '@/lib/router';
import { fetchProducts, type Product } from '@/lib/firestoreService';
import { SEASONAL_CATALOGUE, type Season, type SeasonalProduce } from '@/data/seasonalProduce';
import { Mascot, MascotDuoStanding, MascotRotator, JvlsdAuthenticitySeal } from '@/components/Logo';
import { MilkbasketCategoryExplorer } from '@/components/MilkbasketCategoryExplorer';
import { COMPANY_CONFIG } from '@/data/companyConfig';

export function FreshDailyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [healthTipProduce, setHealthTipProduce] = useState<SeasonalProduce | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((items) => setProducts(items))
      .catch((e) => console.warn('Fetch products in FreshDailyPage notice:', e))
      .finally(() => setLoading(false));
  }, []);

  const seasonalMatchedList = products.map((p) => {
    const sMatch = SEASONAL_CATALOGUE.find(
      (sc) =>
        sc.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) ||
        p.name.toLowerCase().includes(sc.name.toLowerCase().split(' ')[0])
    );
    return { product: p, seasonalMatch: sMatch };
  });

  const filteredProducts = seasonalMatchedList.filter(({ seasonalMatch }) => {
    if (selectedSeason === 'all') return true;
    if (!seasonalMatch) return true;
    return seasonalMatch.season === selectedSeason || seasonalMatch.season === 'all_year';
  });

  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a2719] via-[#103825] to-[#06170f] text-white">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute left-1/4 -bottom-24 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" aria-hidden />
        
        <div className="container-page py-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-300 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-gold-300" /> JVLSD-FD · Fresh Daily Division
              </div>
              <h1 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-sm">
                Pure Farm Essentials Delivered Every Single Morning.
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-emerald-50/90 font-medium">
                Operated as JVLSD-FD Fresh Daily, franchisee partner of Shakhwala.com, by Jagatpati Vigneshwara LSD LLP (JVLSD). 
                Our first venture is launched in Gurukul Road, Memnagar, and Thaltej, Ahmedabad—bringing natural vegetables, harvest fruits, and farm-fresh unadulterated milk directly to your doorstep with zero warehouse hoarding.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(PATHS.order)}
                  className="btn-primary px-7 py-3.5 text-base flex items-center gap-2 shadow-soft font-bold"
                >
                  <ShoppingBasket className="h-5 w-5" /> Order Daily Produce <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(PATHS.survey)}
                  className="rounded-2xl border border-gold-400/60 bg-gold-400/20 px-6 py-3.5 text-base font-bold text-gold-200 hover:bg-gold-400/30 transition-all flex items-center gap-2"
                >
                  <ClipboardList className="h-5 w-5" /> Household Survey
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-xs text-emerald-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-gold-300 shrink-0" />
                  <span>100% Unadulterated Desi Farm Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-gold-300 shrink-0" />
                  <span>Planned Harvest: Zero Food Wastage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gold-300 shrink-0" />
                  <span>Morning 8–9 AM Prompt Delivery</span>
                </div>
              </div>

              {/* JVLSD Authenticity Seal & License Summary */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <JvlsdAuthenticitySeal compact />
                <div className="text-[11px] text-emerald-200/90 font-mono">
                  <span>{COMPANY_CONFIG.certifications.fssaiLicense}</span><br />
                  <span>{COMPANY_CONFIG.certifications.gstin}</span>
                </div>
              </div>
            </div>

            {/* Lively Rotating Mascot Carousel */}
            <div className="flex flex-col items-center justify-center">
              <MascotRotator className="max-w-md w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Local Vendor Customer Experience: Ending Daily Bargaining, Disputes & Losing Temper */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-brand-50/50 via-white to-amber-50/40 border-y border-ink-100">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow text-forest-800">Peace of Mind For Every Household</span>
              <h2 className="mt-3 font-display text-3xl font-black text-ink-950 sm:text-4xl leading-tight">
                No More Arguing at the Handcart. No More Losing Temper Over Daily Bargaining.
              </h2>
              <div className="mt-5 space-y-4 text-sm sm:text-base leading-relaxed text-ink-700">
                <p>
                  Every morning, millions of Indian households go through the same stressful routine: standing in crowded street corners, debating erratic prices with roadside vendors, arguing over rigged weighing scales, and losing temper over inconsistent freshness.
                </p>
                <p>
                  <strong>JVLSD-FD Fresh Daily completely eliminates this friction.</strong> You get farm-fresh produce weighed transparently to the exact gram, priced fairly with bold rate transparency, and delivered calmly to your doorstep with guaranteed WhatsApp verification.
                </p>
              </div>

              {/* Contrast Points */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-red-50/70 p-4 border border-red-200">
                  <p className="text-xs font-black uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                    ❌ Street Vendor Frustrations
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-red-900/90 font-medium">
                    <li>• Daily verbal arguments &amp; stressful bargaining</li>
                    <li>• Stale leftover stock sprayed with tap water</li>
                    <li>• Manipulation of manual balance scales</li>
                    <li>• Mood swings, temper loss &amp; wasted morning time</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-300">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    ✓ JVLSD-FD Peaceful Living
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-emerald-950 font-medium">
                    <li>• Fixed, bold prices &amp; transparent "Buy by ₹" budget</li>
                    <li>• Digital precision weighment (250g, 500g, kg)</li>
                    <li>• Harvested per order — 100% farm fresh, never frozen</li>
                    <li>• Respectful, peaceful 8–9 AM doorstep delivery</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(PATHS.order)}
                  className="btn-primary px-7 py-3 text-sm font-bold shadow-soft flex items-center gap-2"
                >
                  <ShoppingBasket className="h-4 w-4" /> Switch to Peaceful Morning Delivery <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Experience Visual Showcase */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-black/5 group">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                  alt="Traditional Indian Vegetable Market Customer Shopping"
                  className="h-80 sm:h-96 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="rounded-full bg-gold-400 text-ink-950 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-md">
                    Harmonious Living
                  </span>
                  <p className="mt-2 font-display text-lg font-bold">
                    Respectful Household Supply Without Daily Conflict
                  </p>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Restoring dignity, mutual trust, and calm mornings to your home.
                  </p>
                </div>
              </div>

              {/* Floating Testimonial Pill */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 w-68 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-lift backdrop-blur-md">
                <p className="text-xs font-black text-ink-900">"No more disputes over ₹5 or ₹10"</p>
                <p className="text-[11px] text-ink-600 mt-0.5">
                  Clear weights, fixed rates &amp; zero argument mornings for elders and homemakers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Milkbasket Style Visual Category Explorer */}
      <section className="py-10 bg-emerald-50/40 border-b border-emerald-100">
        <div className="container-page">
          <MilkbasketCategoryExplorer
            onSelectCategory={(clusterId: string, subId?: string) => {
              navigate(PATHS.order);
            }}
          />
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-forest-800">Fresh Daily Verticals</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl">
              Nourishing Essentials for Every Family Meal
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-600">
              Direct sourcing guarantees real nutritional integrity without overnight chilling or market middlemen.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* 1. Fresh Vegetables */}
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white p-7 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-soft">
                <Leaf className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink-950">Farm Fresh Vegetables</h3>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                Hand-picked greens, root vegetables, gourds, and native Gujarati culinary staples harvested according to daily pre-orders.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-ink-700">
                <li className="flex items-center gap-1.5">✓ Native and seasonal varieties (Desi Palak, Bhindi, Methi)</li>
                <li className="flex items-center gap-1.5">✓ Strict zero synthetic coating or chemical ripening</li>
                <li className="flex items-center gap-1.5">✓ Graded and hygiene-packed in eco-friendly wraps</li>
              </ul>
            </div>

            {/* 2. Seasonal Fruits */}
            <div className="rounded-3xl border border-gold-200 bg-gradient-to-b from-gold-50/60 to-white p-7 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-600 text-white shadow-soft">
                <Apple className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink-950">Seasonal Orchard Fruits</h3>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                Naturally matured, sweet, nutrient-dense fruits attuned to the traditional Gujarati calendar seasons.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-ink-700">
                <li className="flex items-center gap-1.5">✓ Naturally tree-ripened orchard harvests</li>
                <li className="flex items-center gap-1.5">✓ Rich in dietary antioxidants and digestive enzymes</li>
                <li className="flex items-center gap-1.5">✓ High-pectin seasonal apples, fresh oranges &amp; bananas</li>
              </ul>
            </div>

            {/* 3. Pure Farm Milk */}
            <div className="rounded-3xl border border-brand-200 bg-gradient-to-b from-brand-50/60 to-white p-7 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-soft">
                <Milk className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink-950">Pure Farm Milk</h3>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                Direct, unadulterated farm milk collected early in the morning and delivered in hygienic, food-grade chilled containers.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-ink-700">
                <li className="flex items-center gap-1.5">✓ Wholesome natural protein and bio-available calcium</li>
                <li className="flex items-center gap-1.5">✓ Zero reconstituted milk powder or neutralizers</li>
                <li className="flex items-center gap-1.5">✓ Direct chilled morning dispatch to your kitchen door</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Produce Showcase & Ayurvedic Guidance */}
      <section className="py-16 bg-sage-50/60 border-y border-ink-100">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-forest-800">Gujarati Seasonal Calendar</span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                Produce Preview &amp; Seasonal Wisdom
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                Filter by seasonal weather harmony to keep family health and digestion balanced.
              </p>
            </div>

            {/* Gujarati Season Filter Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'all_year', label: 'બારેમાસ (Perennial)' },
                { id: 'winter', label: 'શિયાળો (Winter)' },
                { id: 'monsoon', label: 'ચોમાસુ (Monsoon)' },
                { id: 'summer', label: 'ઉનાળો (Summer)' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSeason(s.id as any)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedSeason === s.id
                      ? 'bg-forest-900 text-gold-300 shadow-soft'
                      : 'bg-white text-ink-700 hover:bg-ink-100 border border-ink-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid with Lightbox Preview and Ayurvedic Tips */}
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.slice(0, 8).map(({ product: p, seasonalMatch }) => (
              <div
                key={p.id}
                className="group card overflow-hidden p-3 transition-all hover:shadow-lift flex flex-col justify-between"
              >
                <div>
                  <div
                    className="relative h-44 sm:h-48 w-full overflow-hidden rounded-xl bg-ink-100 cursor-pointer"
                    onClick={() => setPreviewProduct(p)}
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-300">
                        <ShoppingBasket className="h-10 w-10" />
                      </div>
                    )}
                    {seasonalMatch?.seasonLabel && (
                      <span className="absolute left-2 top-2 rounded-full bg-forest-900/90 px-2 py-0.5 text-[10px] font-bold text-gold-300 backdrop-blur-sm">
                        {seasonalMatch.seasonLabel}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <h4 className="font-display text-sm font-bold text-ink-950">{p.name}</h4>
                    {seasonalMatch?.vernacularName && (
                      <p className="text-xs text-brand-700 font-medium">{seasonalMatch.vernacularName}</p>
                    )}
                    {p.price && (
                      <p className="mt-1 text-xs font-extrabold text-ink-900">
                        ₹{p.price} <span className="font-normal text-ink-500">/ {p.unit}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-ink-100 flex items-center justify-between">
                  {seasonalMatch ? (
                    <button
                      type="button"
                      onClick={() => setHealthTipProduce(seasonalMatch)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950"
                    >
                      <HeartPulse className="h-3.5 w-3.5 text-emerald-600" /> Ayurvedic Tip
                    </button>
                  ) : <span />}
                  <button
                    type="button"
                    onClick={() => navigate(PATHS.order)}
                    className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-800 hover:bg-brand-100 transition-colors"
                  >
                    Order →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate(PATHS.order)}
              className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2 font-bold"
            >
              Browse Full Order Catalogue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How the Planned Procurement System Works */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-forest-800">How It Works</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl">
              From Evening Harvest to 7 AM Kitchen Doorstep
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-600">
              A 3-step sustainable model protecting your health and minimizing farm produce discard.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3 text-center">
            <div className="rounded-3xl border border-ink-100 bg-ink-50/50 p-8 shadow-soft">
              <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-brand-800 text-gold-300 font-display font-extrabold text-xl shadow-soft">
                1
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-950">1. Pre-Order or Take Survey</h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                Tell us your daily family vegetable, fruit, and milk needs before the evening cut-off, or submit our one-time survey.
              </p>
            </div>

            <div className="rounded-3xl border border-ink-100 bg-ink-50/50 p-8 shadow-soft">
              <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-brand-800 text-gold-300 font-display font-extrabold text-xl shadow-soft">
                2
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-950">2. Night Procurement &amp; Grading</h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                We harvest and pack exactly what households ordered. No leftover heaps or unsold stock decomposing in hot markets.
              </p>
            </div>

            <div className="rounded-3xl border border-ink-100 bg-ink-50/50 p-8 shadow-soft">
              <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-brand-800 text-gold-300 font-display font-extrabold text-xl shadow-soft">
                3
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-950">3. Morning 8–9 AM Doorstep Dispatch</h3>
              <p className="mt-2 text-xs sm:text-sm text-ink-600 leading-relaxed">
                Delivered cleanly before cooking begins. Enjoy verified farm quality with LSD monthly subscription savings.
              </p>
            </div>
          </div>
        </div>
      </section>

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
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink-800 shadow-lift backdrop-blur-md transition-all hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative h-72 w-full overflow-hidden bg-ink-100">
              {previewProduct.image_url && (
                <img
                  src={previewProduct.image_url}
                  alt={previewProduct.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-6">
              <h3 className="font-display text-2xl font-bold text-ink-950">{previewProduct.name}</h3>
              <p className="mt-1 text-sm text-ink-600">Unit: {previewProduct.unit}</p>
              {previewProduct.price && (
                <p className="mt-1 text-base font-bold text-brand-700">₹{previewProduct.price} / {previewProduct.unit}</p>
              )}
              <div className="mt-6 flex justify-end gap-3 border-t border-ink-100 pt-4">
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="btn-outline px-4 py-2 text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewProduct(null);
                    navigate(PATHS.order);
                  }}
                  className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  <ShoppingBasket className="h-4 w-4" /> Go to Order Page
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
                  {healthTipProduce.vernacularName && (
                    <p className="text-xs text-brand-700 font-semibold">
                      {healthTipProduce.vernacularName}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHealthTipProduce(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-100 text-ink-600 hover:bg-ink-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs sm:text-sm text-ink-700 leading-relaxed">
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/60 p-4">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-700" /> Ayurvedic &amp; Health Insights:
                </p>
                <p className="mt-1 text-emerald-900">{healthTipProduce.nutritionalNotes}</p>
              </div>

              {healthTipProduce.benefits && healthTipProduce.benefits.length > 0 && (
                <div className="rounded-2xl bg-gold-50/70 border border-gold-200/60 p-4">
                  <p className="font-bold text-gold-950 flex items-center gap-1.5">
                    <PackageCheck className="h-4 w-4 text-gold-700" /> Key Health Benefits:
                  </p>
                  <ul className="mt-1 list-disc pl-5 space-y-1 text-gold-900">
                    {healthTipProduce.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setHealthTipProduce(null)}
                className="btn-primary text-xs px-5 py-2.5"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
