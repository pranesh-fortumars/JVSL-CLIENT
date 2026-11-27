import { useState } from 'react';
import {
  Cookie,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Heart,
  CheckCircle2,
  Clock,
  Package,
  Layers,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { navigate, PATHS } from '@/lib/router';

type BiteItem = {
  id: string;
  name: string;
  vernacularName?: string;
  category: 'khakhra' | 'biscuit_toast' | 'nuts_seeds';
  categoryLabel: string;
  packSize: string;
  price: number;
  imageUrl: string;
  description: string;
  highlights: string[];
};

export const BITES_CATALOGUE: BiteItem[] = [
  {
    id: 'bites-khakhra-methi',
    name: 'Artisanal Methi Khakhra',
    vernacularName: 'મેથી ખાખરા (ઘીમાં શેકેલા)',
    category: 'khakhra',
    categoryLabel: 'Crisp Khakhra',
    packSize: '200g Vacuum Pack',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    description: 'Slow-roasted whole wheat crispbread infused with fresh fenugreek leaves and pure spices. High dietary fiber.',
    highlights: ['Zero Trans Fats', 'Whole Wheat Fiber', 'Vacuum Packed Freshness'],
  },
  {
    id: 'bites-khakhra-jeera',
    name: 'Roasted Jeera & Ajwain Khakhra',
    vernacularName: 'જીરું-અજમો ખાખરા',
    category: 'khakhra',
    categoryLabel: 'Crisp Khakhra',
    packSize: '200g Vacuum Pack',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Digestive elixir blend of roasted cumin and carom seeds. Light, flaky, and ideal with morning tea or buttermilk.',
    highlights: ['Digestive Support', 'Low Calorie', 'Preservative Free'],
  },
  {
    id: 'bites-toast-suji',
    name: 'Cardamom Suji Toast',
    vernacularName: 'ઇલાયચી સુજી ટોસ્ટ (રસ)',
    category: 'biscuit_toast',
    categoryLabel: 'Biscuits & Toast',
    packSize: '300g Box',
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    description: 'Twice-baked crisp semolina toasts flavoured with freshly ground green cardamom. Melt-in-mouth morning crunch.',
    highlights: ['100% Semolina (Suji)', 'Real Green Cardamom', 'Golden Twice Baked'],
  },
  {
    id: 'bites-cookies-oats',
    name: 'Jaggery & Oats Nutri-Cookies',
    vernacularName: 'ગોળ-ઓટ્સ હેલ્થ કુકીઝ',
    category: 'biscuit_toast',
    categoryLabel: 'Biscuits & Toast',
    packSize: '250g Tin',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
    description: 'Wholesome rolled oats sweetened naturally with organic desi jaggery. Free of refined white sugar and palm oil.',
    highlights: ['No Refined White Sugar', 'Rich in Rolled Oats', 'No Palm Oil'],
  },
  {
    id: 'bites-nuts-california',
    name: 'Premium California Almonds (Badam)',
    vernacularName: 'કેલિફોર્નિયા બદામ',
    category: 'nuts_seeds',
    categoryLabel: 'Nuts & Seeds',
    packSize: '250g Pouch',
    price: 245,
    imageUrl: 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80',
    description: 'Hand-selected, jumbo nutrient-dense almonds. Naturally packed with Vitamin E, protein, and healthy monounsaturated fats.',
    highlights: ['Jumbo Grade Selection', 'Natural Vitamin E', 'Brain & Heart Nutrition'],
  },
  {
    id: 'bites-seeds-omega',
    name: 'Roasted 5-Seed Omega Energy Mix',
    vernacularName: 'પંચ-બીજ એનર્જી મિક્સ',
    category: 'nuts_seeds',
    categoryLabel: 'Nuts & Seeds',
    packSize: '200g Jar',
    price: 175,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Lightly salted dry-roasted blend of Pumpkin, Sunflower, Flax, Chia, and Watermelon seeds. Rich in plant-based Omega-3.',
    highlights: ['Plant Omega-3 & Zinc', 'Dry Roasted (Oil Free)', 'Zero Added Sugar'],
  },
];

export function BitesPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | BiteItem['category']>('all');

  const filteredItems = activeCategory === 'all'
    ? BITES_CATALOGUE
    : BITES_CATALOGUE.filter((it) => it.category === activeCategory);

  return (
    <div className="pt-[calc(var(--header-h)+2rem)] pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a140b] via-[#2a1e0f] to-[#140e06] text-white">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute left-1/4 -bottom-20 h-72 w-72 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" aria-hidden />
        
        <div className="container-page py-12 sm:py-16">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300 backdrop-blur-md">
              <Cookie className="h-3.5 w-3.5" /> JVLSD Business Division · Bites
            </span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold leading-tight text-white drop-shadow-sm">
              JVLSD Bites &amp; Beyond.
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-amber-100/90 leading-relaxed font-medium">
              Wholesome biscuits, artisanal khakhra, twice-baked toasts, and heart-healthy roasted nuts. Clean, nutritious snacks crafted for mindful household snacking.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(PATHS.order)}
                className="btn-gold px-6 py-3 text-base text-ink-950 font-bold flex items-center gap-2 shadow-soft hover:shadow-lift"
              >
                Order Fresh Daily <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate(PATHS.about)}
                className="rounded-2xl border-2 border-white/50 bg-white/10 hover:bg-white hover:text-ink-950 text-white font-bold px-6 py-3 text-base transition-all backdrop-blur-sm"
              >
                About JVLSD House
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Brand Values Banner */}
      <section className="py-10 bg-amber-50/60 border-b border-amber-100">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, title: 'Clean Ingredients', desc: 'No synthetic colours or palm oil' },
            { icon: ShieldCheck, title: 'Quality Sealed', desc: 'Air-tight & vacuum preserved packs' },
            { icon: Heart, title: 'Mindful Snacking', desc: 'Whole grains, dietary fiber & omega-3' },
            { icon: Package, title: 'Convenient Sizes', desc: 'Family boxes and handy 200g-300g packs' },
          ].map((v) => (
            <div key={v.title} className="p-4 rounded-2xl bg-white border border-amber-200/60 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-display text-sm font-bold text-ink-900">{v.title}</h3>
              <p className="mt-0.5 text-xs text-ink-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catalogue & Filters */}
      <section className="container-page mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-ink-100">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-950">Approved Range</h2>
            <p className="text-sm text-ink-600">Select categories to explore current offerings.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Bites' },
              { id: 'khakhra', label: 'Crisp Khakhra' },
              { id: 'biscuit_toast', label: 'Biscuits & Toast' },
              { id: 'nuts_seeds', label: 'Nuts & Seeds' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-ink-950 text-white shadow-soft'
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1 flex flex-col"
            >
              <div className="relative h-56 w-full overflow-hidden bg-ink-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="absolute top-3 left-3 rounded-full bg-ink-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-gold-300">
                  {item.categoryLabel}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-ink-900 shadow-soft">
                  ₹{item.price}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-950 group-hover:text-amber-800 transition-colors">
                    {item.name}
                  </h3>
                  {item.vernacularName && (
                    <p className="text-xs text-brand-700 font-medium mt-0.5">{item.vernacularName}</p>
                  )}
                  <p className="mt-2 text-xs text-ink-600 leading-relaxed">{item.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-200/50"
                      >
                        <CheckCircle2 className="h-3 w-3 text-amber-700" /> {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-500">Pack: {item.packSize}</span>
                  <button
                    type="button"
                    onClick={() => navigate(PATHS.order)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 underline"
                  >
                    Check Availability <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Blinkit-Style Seller Hub / Partner with JVLSD Section */}
      <section className="mt-16 bg-gradient-to-br from-emerald-950 via-forest-950 to-ink-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-900 shadow-lift">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/15 px-3.5 py-1 text-xs font-bold text-gold-300">
              <Sparkles className="h-3.5 w-3.5" /> JVLSD Seller Hub &amp; Entrepreneurial Launchpad
            </div>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Grow Your Brand on JVLSD. Direct Access to Daily Kitchen Households.
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              Inspired by leading seller platforms (like Blinkit Partner Hub, IndiaMart, and Shopify), we provide a dedicated launchpad for local food artisans, regional producers, and home chefs. Join our platform to connect with a verified daily consumer market with zero predatory listing costs, 100% biodegradable composite packaging, and prompt payouts.
            </p>

            <div className="mt-6 space-y-2 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-300 shrink-0" />
                <span>Daily recurring breakfast and evening tea consumer audience.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-300 shrink-0" />
                <span>100% zero-plastic biodegradable composite packaging and sustainable logistics.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-300 shrink-0" />
                <span>Fair 60/40 franchisee unit revenue share and transparent account settlement.</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(PATHS.contact)}
                className="btn-primary px-6 py-2.5 text-xs font-bold shadow-lift flex items-center gap-2"
              >
                Join as Seller Partner <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate(PATHS.survey)}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                Seller Hub Survey
              </button>
            </div>
          </div>

          {/* Seller Hub Benefits Comparison */}
          <div className="rounded-3xl border border-gold-400/30 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
            <h3 className="font-display text-base font-bold text-gold-300 mb-4">
              Why Partner With JVLSD Over Generic Marketplaces?
            </h3>
            <div className="space-y-3 text-xs text-ink-200">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-bold text-white text-xs">Dedicated High-Retention Audience</p>
                <p className="mt-1 text-emerald-100/80 text-[11px]">Unlike generic listings lost in millions of products on Amazon or IndiaMart, your regional snacks &amp; bites get direct doorstep placement in verified family baskets.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-bold text-white text-xs">Zero Inventory Hoarding &amp; Spoilage</p>
                <p className="mt-1 text-emerald-100/80 text-[11px]">Advance planned pre-ordering aligns supply with exact demand—no leftover warehouse waste or inventory write-offs.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-bold text-white text-xs">Eco-Conscious Brand Association</p>
                <p className="mt-1 text-emerald-100/80 text-[11px]">Packed and delivered with our 100% zero-plastic, biodegradable composite packaging standard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

