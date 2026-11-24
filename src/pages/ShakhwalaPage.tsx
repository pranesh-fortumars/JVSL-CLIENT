import {
  ShoppingBasket,
  Leaf,
  Apple,
  Milk,
  Truck,
  CalendarClock,
  ShieldCheck,
  Sun,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { navigate, PATHS } from '@/lib/router';

const VEG_IMG =
  'https://images.pexels.com/photos/39126978/pexels-photo-39126978.jpeg?auto=compress&cs=tinysrgb&h=700&w=1000';
const FRUIT_IMG =
  'https://images.pexels.com/photos/16038612/pexels-photo-16038612.jpeg?auto=compress&cs=tinysrgb&h=700&w=1000';

export function ShakhwalaPage() {
  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow">
              <Leaf className="h-3.5 w-3.5" /> Business section
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink-950 sm:text-5xl">
              Shakhwala — freshness, delivered.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              Operated as a proud Shakhwala franchisee under the brand <strong className="font-semibold text-ink-900">JVLSD-FD Fresh Daily Direct Delivery</strong> — JVLSD's first consumer-facing venture connects with every household as a reliable, trusted family member. Through planned advance procurement, we bring unadulterated vegetables, fruits, and pure farm milk directly to kitchen doorsteps with zero waste.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate(PATHS.order)} className="btn-primary px-6 py-3 text-base">
                <ShoppingBasket className="h-5 w-5" /> Order Fresh Daily
              </button>
              <button onClick={() => navigate(PATHS.freshDaily)} className="btn-outline px-6 py-3 text-base">
                Take the survey
              </button>
            </div>
          </Reveal>

          <Reveal delay={120} className="grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-3xl shadow-card">
              <img src={VEG_IMG} alt="Fresh vegetables display" className="h-44 w-full object-cover sm:h-56" loading="lazy" />
            </div>
            <div className="mt-8 overflow-hidden rounded-3xl shadow-card">
              <img src={FRUIT_IMG} alt="Fresh ripe mangoes" className="h-44 w-full object-cover sm:h-56" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">What Shakhwala offers</span>
            <h2 className="section-title mt-4">Three fresh categories, one reliable service.</h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-300 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-2xs">
              <span>🌿 100% Farm-Fresh Harvest Guarantee · <strong>NO FROZEN VEGETABLES SOLD</strong></span>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: 'Vegetables',
                desc: 'Daily farm-harvested vegetables in grams & kg weight breakdown — Methi, Palak, Cabbage, Cauliflower, gourds & kitchen essentials. Never frozen, never stored in stale warehouses.',
                points: ['Weight breakdown in grams (250g, 500g) & kg', 'Strictly zero frozen produce', 'Available 365 days with seasonal harvest focus'],
              },
              {
                icon: Apple,
                title: 'Fruits',
                desc: 'Whole fruit harvest & combos priced by size, piece count & kg weight — Kerala/Elaichi bananas, Royal apples, Pineapples, Kiwi packs, Mosambi, Oranges & Pomegranates.',
                points: ['Count, piece & kg weight breakdown', 'Seasonal awareness calendar guidance', 'Wholesome fruit mix combo baskets'],
              },
              {
                icon: Milk,
                title: 'Milk & Dairy Essentials',
                desc: 'Pure farm cow/buffalo milk, curd (dahi) and spiced chaas in hygienic sealed pouches & packs with complete product details, fat content & freshness timestamps.',
                points: ['500ml fresh pouches & sealed curd packs', 'Desi A2 cow milk & pure buffalo milk', 'Prompt morning 7:00–9:00 AM delivery'],
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 100}>
                <div className="card h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink-900">{c.title}</h3>
                  <p className="mt-2 text-sm text-ink-600">{c.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-ink-700">
                        <Check className="h-4 w-4 text-brand-600" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Two ordering modes */}
      <section className="bg-brand-950 py-20 text-white sm:py-28">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow text-gold-300">Two ordering modes</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-white">
              Plan ahead, or order for today.
            </h2>
            <p className="mt-4 text-brand-100">
              The Fresh Daily service supports two distinct modes with separate availability
              rules — a simple toggle switches between them.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: CalendarClock,
                tag: 'Next-day pre-order',
                title: 'Tomorrow morning, planned today.',
                desc: 'Every product in the catalogue is selectable — even items that are unavailable today. Pre-orders help us procure against real demand and reduce waste.',
                delivery: 'Tomorrow 7:00–9:00 AM',
                tone: 'gold' as const,
              },
              {
                icon: Truck,
                tag: 'Same-day emergency order',
                title: 'Fresh today, within 3 km.',
                desc: 'Available products are shown normally; unavailable items appear greyed out and cannot be added to a same-day order. Same-day delivery is subject to availability.',
                delivery: 'Today prompt',
                tone: 'brand' as const,
              },
            ].map((m, i) => (
              <Reveal key={m.tag} delay={i * 100}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        m.tone === 'gold' ? 'bg-gold-500/15 text-gold-300' : 'bg-brand-400/15 text-brand-200'
                      }`}
                    >
                      <m.icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-200">
                      {m.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">{m.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-100">{m.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white">
                    <Sun className="h-3.5 w-3.5 text-gold-300" /> Delivery: {m.delivery}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Local Cart & Vendor Shopping Walkthrough Experience Card */}
          <Reveal delay={200} className="mt-10">
            <div className="rounded-3xl border border-gold-400/30 bg-gradient-to-r from-emerald-950/80 via-[#0a2f1b] to-emerald-950/80 p-6 sm:p-8 backdrop-blur-md shadow-soft">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/20 px-3.5 py-1 text-xs font-bold text-gold-300 uppercase tracking-wider border border-gold-400/40">
                    🛒 Intuitive Local Cart Experience
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl">
                    Shop Just Like At Your Local Handcart Vendor — But Digital &amp; Transparent.
                  </h3>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-emerald-100/90 font-medium">
                    Order with total flexibility: buy by exact budget (e.g. <em>"₹20 of coriander"</em>, <em>"₹50 of tomatoes"</em>), choose customary fractions (<em>250g, 500g, 1kg</em>), or count by piece and dozen (<em>6 or 12 bananas</em>). Our auto-calculator translates your budget into exact weight instantly, with zero hassle and verified WhatsApp delivery OTP on arrival.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(PATHS.order)}
                    className="btn bg-gold-500 hover:bg-gold-400 text-forest-950 font-black px-6 py-3 rounded-2xl shadow-lift flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingBasket className="h-4 w-4" /> Try Cart Experience Now
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(PATHS.contact)}
                    className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3 text-xs font-bold text-white transition-all text-center"
                  >
                    Request Assisted Video Walkthrough
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2 className="section-title mt-4">From your kitchen plan to your doorstep.</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CalendarClock, step: '01', title: 'Plan or order', desc: 'Pre-order for tomorrow, or order for today if available.' },
              { icon: ShieldCheck, step: '02', title: 'We procure', desc: 'We source exactly what is needed — nothing more, nothing less.' },
              { icon: Leaf, step: '03', title: 'Cleaned & packed', desc: 'Each order is cleaned, weighed, sealed and packed separately.' },
              { icon: Truck, step: '04', title: 'Delivered fresh', desc: 'To your doorstep — tomorrow morning for pre-orders, today for same-day.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className="card h-full p-6">
                  <span className="text-xs font-bold text-brand-600">{s.step}</span>
                  <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-600">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container-page">
          <Reveal className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 p-8 text-white sm:p-12 shadow-lift">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">Try Fresh Daily today.</h2>
                <p className="mt-2 text-brand-100">Fresh vegetables, fruits and milk — planned, packed and delivered for you.</p>
              </div>
              <button
                onClick={() => navigate(PATHS.order)}
                className="btn-gold px-6 py-3 text-base"
              >
                <ShoppingBasket className="h-5 w-5" /> Start an order <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
