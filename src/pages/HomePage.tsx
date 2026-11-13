import {
  ArrowRight,
  ShoppingBasket,
  Leaf,
  Milk,
  Apple,
  Truck,
  Sun,
  CalendarClock,
  ShieldCheck,
  Sprout,
  Star,
  Quote,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { navigate, PATHS } from '@/lib/router';

const HERO_IMG =
  'https://images.pexels.com/photos/17161099/pexels-photo-17161099.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400';
const BASKET_IMG =
  'https://images.pexels.com/photos/8422681/pexels-photo-8422681.jpeg?auto=compress&cs=tinysrgb&h=800&w=1000';
const DAIRY_IMG =
  'https://images.pexels.com/photos/69170/pexels-photo-69170.jpeg?auto=compress&cs=tinysrgb&h=800&w=1000';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-[calc(var(--header-h)+1rem)] pb-20 sm:pt-32 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/80 via-white to-white" />
        <div
          className="absolute -right-32 -top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -left-24 top-40 -z-10 h-[22rem] w-[22rem] rounded-full bg-gold-200/40 blur-3xl"
          aria-hidden
        />
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="eyebrow">
              <Sprout className="h-3.5 w-3.5" /> Jagatpati Vigneshwara LSD LLP
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
              Fresh vegetables, fruits
              <span className="block text-brand-700">&amp; milk, delivered direct.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              JVLSD brings everyday freshness to your doorstep through{' '}
              <strong className="font-semibold text-ink-900">Shakhwala</strong> and our
              JVLSD-FD Fresh Daily service. Plan your kitchen a day in advance and help us
              reduce waste — while enjoying genuinely farm-fresh produce.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => navigate(PATHS.order)} className="btn-primary px-6 py-3 text-base">
                <ShoppingBasket className="h-5 w-5" /> Start an Order
              </button>
              <button onClick={() => navigate(PATHS.freshDaily)} className="btn-outline px-6 py-3 text-base">
                Take the Fresh Daily Survey <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { k: '20%', v: 'Introductory offer' },
                { k: '3 km', v: 'Same-day delivery' },
                { k: '1 day', v: 'Pre-order planning' },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-bold text-brand-700">{s.k}</dt>
                  <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative overflow-hidden rounded-3xl shadow-lift">
              <img
                src={HERO_IMG}
                alt="Fresh vegetables at a vibrant market stall"
                className="h-[28rem] w-full object-cover sm:h-[34rem]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 w-60 rounded-2xl border border-ink-100 bg-white p-4 shadow-lift animate-float">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Farm-fresh daily</p>
                  <p className="text-xs text-ink-500">Sourced &amp; packed per order</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-5 right-4 hidden rounded-2xl border border-ink-100 bg-white p-4 shadow-lift sm:block animate-float [animation-delay:2s]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Trusted quality</p>
                  <p className="text-xs text-ink-500">Cleaned, weighed &amp; sealed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / corporate identity */}
      <section className="py-20 sm:py-24">
        <div className="container-page grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <span className="eyebrow">About JVLSD</span>
            <h2 className="section-title mt-4">
              A growing business house, built on trust &amp; freshness.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-600">
              Jagatpati Vigneshwara LSD LLP is the parent organisation behind a family of
              business activities. Our first consumer-facing venture,{' '}
              <strong className="font-semibold text-ink-900">Shakhwala</strong>, brings
              fresh vegetables, fruits and milk directly to households — with an emphasis on
              quality, authenticity and reducing food waste through advance planning.
            </p>
            <p className="mt-4 text-ink-600 leading-relaxed">
              The platform is designed to grow: additional business divisions and categories
              can be introduced over time without restructuring the whole experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate(PATHS.about)} className="btn-primary px-5 py-2.5">
                Learn about JVLSD <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate(PATHS.shakhwala)} className="btn-outline px-5 py-2.5">
                Explore Shakhwala
              </button>
            </div>
          </Reveal>

          <Reveal delay={120} className="grid grid-cols-2 gap-4">
            {[
              { icon: Leaf, title: 'Fresh produce', desc: 'Vegetables & fruits, sourced daily.' },
              { icon: Milk, title: 'Farm milk', desc: 'Pure milk delivered to your door.' },
              { icon: CalendarClock, title: 'Plan ahead', desc: 'Pre-order one day in advance.' },
              { icon: Truck, title: 'Reliable delivery', desc: 'Same-day within 3 km service area.' },
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-600">{f.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Business divisions */}
      <section className="bg-brand-950 py-20 text-white sm:py-28">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow text-gold-300">Our business divisions</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold leading-tight text-white">
              One parent company, a growing family of services.
            </h2>
            <p className="mt-4 text-brand-100">
              JVLSD is structured so that new business categories can be added under the
              parent brand without disrupting the customer experience.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                tag: 'Active',
                icon: ShoppingBasket,
                title: 'Shakhwala',
                desc: 'Fresh vegetables, fruits and milk delivered direct to households.',
                cta: 'Explore Shakhwala',
                path: PATHS.shakhwala,
              },
              {
                tag: 'Active',
                icon: Sun,
                title: 'JVLSD-FD Fresh Daily',
                desc: 'Advance-order & same-day delivery service that helps reduce food waste.',
                cta: 'Order Fresh Daily',
                path: PATHS.order,
              },
              {
                tag: 'Coming soon',
                icon: Sprout,
                title: 'Future divisions',
                desc: 'Additional business categories will be introduced as JVLSD grows.',
                cta: null,
              },
            ].map((d) => (
              <Reveal key={d.title}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all hover:bg-white/[0.08] hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-300">
                      <d.icon className="h-6 w-6" />
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                        d.tag === 'Active'
                          ? 'bg-brand-400/15 text-brand-200'
                          : 'bg-white/5 text-ink-300'
                      }`}
                    >
                      {d.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-100">{d.desc}</p>
                  {d.cta && (
                    <button
                      onClick={() => navigate(d.path!)}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-200"
                    >
                      {d.cta} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fresh Daily highlight with images */}
      <section className="py-20 sm:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="grid grid-cols-2 gap-5">
            <div className="overflow-hidden rounded-3xl shadow-card">
              <img src={BASKET_IMG} alt="Basket of fresh greens at a market" className="h-64 w-full object-cover" loading="lazy" />
            </div>
            <div className="mt-10 overflow-hidden rounded-3xl shadow-card">
              <img src={DAIRY_IMG} alt="Dairy farm cows" className="h-64 w-full object-cover" loading="lazy" />
            </div>
            <div className="-mt-6 col-span-2 rounded-3xl bg-brand-700 p-6 text-white shadow-lift">
              <ShieldCheck className="h-7 w-7 text-gold-300" />
              <p className="mt-3 font-display text-lg font-bold leading-snug">
                Cleaned, weighed, sealed &amp; packed — order by order.
              </p>
              <p className="mt-1.5 text-sm text-brand-100">
                Every Fresh Daily order is prepared specifically for you, so nothing sits
                around and nothing is wasted.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <span className="eyebrow">JVLSD-FD Fresh Daily</span>
            <h2 className="section-title mt-4">Two simple ways to order your fresh.</h2>
            <p className="mt-5 text-lg text-ink-600">
              Choose what fits your day — and help us plan better, reduce waste, and keep
              prices fair.
            </p>

            <div className="mt-8 space-y-4">
              <div className="card flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900">Next-day pre-order</h3>
                  <p className="mt-1 text-sm text-ink-600">
                    Plan your kitchen a day in advance. Every product in the catalogue is
                    selectable, even if it isn't available today. Delivered tomorrow morning.
                  </p>
                </div>
              </div>
              <div className="card flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900">Same-day order</h3>
                  <p className="mt-1 text-sm text-ink-600">
                    Need it today? Available products are shown normally; unavailable items
                    appear greyed out and can't be added to a same-day order. Within 3 km.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={() => navigate(PATHS.order)} className="btn-primary mt-8 px-6 py-3 text-base">
              <ShoppingBasket className="h-5 w-5" /> Order Fresh Daily
            </button>
          </Reveal>
        </div>
      </section>

      {/* Offer banner */}
      <section className="pb-20 sm:pb-24">
        <div className="container-page">
          <Reveal className="overflow-hidden rounded-3xl bg-gradient-to-br from-gold-500 to-gold-600 p-8 sm:p-12 shadow-lift">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-ink-950/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-950">
                  <Star className="h-3.5 w-3.5 fill-ink-950 text-ink-950" /> Introductory offer
                </span>
                <h2 className="mt-4 font-display text-3xl font-extrabold text-ink-950 sm:text-4xl">
                  20% off your first Fresh Daily order.
                </h2>
                <p className="mt-2 max-w-lg text-ink-900/80">
                  A fixed 20% introductory offer as we launch. Final promotional rules will
                  be confirmed before going live.
                </p>
              </div>
              <button
                onClick={() => navigate(PATHS.order)}
                className="btn bg-ink-950 text-white hover:bg-ink-900 px-6 py-3 text-base shadow-lift"
              >
                Order now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-brand-50/60 py-20 sm:py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Quote className="mx-auto h-10 w-10 text-brand-300" />
            <p className="mt-6 font-serif text-2xl leading-relaxed text-ink-800 sm:text-3xl">
              &ldquo;The advance-order idea changed how my family shops for vegetables. We
              plan once, and fresh produce arrives the next morning — nothing is wasted.&rdquo;
            </p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-700">
              Early Fresh Daily customer
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <div className="container-page text-center">
          <Reveal>
            <Apple className="mx-auto h-10 w-10 text-brand-600" />
            <h2 className="mt-5 section-title">Ready for fresher mornings?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">
              Place a Fresh Daily order or take our quick household survey — it takes less
              than two minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate(PATHS.order)} className="btn-primary px-6 py-3 text-base">
                <ShoppingBasket className="h-5 w-5" /> Order Fresh Daily
              </button>
              <button onClick={() => navigate(PATHS.contact)} className="btn-outline px-6 py-3 text-base">
                Talk to us
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
