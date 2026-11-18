import {
  Target,
  Eye,
  Compass,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Users,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { navigate, PATHS } from '@/lib/router';

const VALUES = [
  {
    icon: Leaf,
    title: 'Freshness first',
    desc: 'We prioritise genuine freshness over volume — produce is sourced and packed per order.',
  },
  {
    icon: ShieldCheck,
    title: 'Authenticity & trust',
    desc: 'Customers should know what they are receiving. We are building traceability into everything.',
  },
  {
    icon: HeartHandshake,
    title: 'Reduce waste',
    desc: 'Advance ordering helps us plan procurement around real demand and cut unnecessary waste.',
  },
  {
    icon: Users,
    title: 'Customer focus',
    desc: 'Simple, accessible experiences for households of every age group.',
  },
];

export function AboutPage() {
  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 sm:pb-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sage-100/60 via-mint-50/30 to-transparent" />
        <div className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden />
        <div className="absolute left-10 top-1/2 -z-10 h-72 w-72 rounded-full bg-gold-200/25 blur-3xl" aria-hidden />
        
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal className="max-w-2xl">
            <span className="eyebrow text-forest-800">
              <Sprout className="h-3.5 w-3.5 text-brand-600" /> About JVLSD
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-ink-950 sm:text-5xl lg:text-6xl">
              Building a trusted house of everyday essentials.
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-ink-700">
              Jagatpati Vigneshwara LSD LLP (JVLSD) is the parent organisation behind a
              growing family of business activities. We are starting with Shakhwala and the
              JVLSD-FD Fresh Daily direct delivery service — and the structure is designed to
              welcome new divisions over time.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button onClick={() => navigate(PATHS.order)} className="btn-primary px-6 py-3 text-base">
                Explore Fresh Daily <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate(PATHS.contact)} className="btn-outline px-6 py-3 text-base">
                Get in Touch
              </button>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-black/5 group">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Fresh farm produce and vegetables"
                className="h-80 sm:h-96 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold-300 font-semibold">Direct Source</p>
                  <p className="font-display text-lg font-bold">Planned Procurement &amp; Trust</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white">
                  <Leaf className="h-5 w-5 text-gold-300" />
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="section-title">Who we are.</h2>
            <div className="mt-6 space-y-4 text-ink-600 leading-relaxed">
              <p>
                JVLSD was established to create a professional, scalable platform for
                everyday essentials — beginning with fresh vegetables, fruits and milk
                delivered directly to households under the Shakhwala business section.
              </p>
              <p>
                The organisation's structure deliberately separates the parent corporate
                identity from its individual business activities. This allows JVLSD to grow
                into additional categories without restructuring the customer experience
                each time.
              </p>
              <p>
                Our initial focus is simple: help households plan their kitchen requirements
                one day in advance, source fresh produce accordingly, and deliver it
                reliably — so food waste is reduced and quality stays high.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="card p-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { k: 'Parent Corporate', v: 'Jagatpati Vigneshwara LSD LLP' },
                { k: 'Registered Office', v: 'Vardan Tower, Navrangpura, Ahmedabad 380009' },
                { k: 'First venture', v: 'Shakhwala' },
                { k: 'Service', v: 'JVLSD-FD Fresh Daily' },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-brand-50/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{s.k}</p>
                  <p className="mt-1.5 font-display text-lg font-bold text-ink-900">{s.v}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Vision / Mission / Purpose */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2e1f] via-[#113a27] to-[#071d13] py-20 text-white sm:py-28">
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" aria-hidden />
        <div className="container-page relative z-10">
          <Reveal className="max-w-2xl">
            <span className="eyebrow text-gold-300 font-semibold tracking-widest">What guides us</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
              Vision, mission &amp; purpose.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Eye,
                title: 'Vision',
                desc: 'To become a trusted, multi-category business house that makes everyday essentials fresher, more accessible and less wasteful for households across India.',
              },
              {
                icon: Target,
                title: 'Mission',
                desc: 'Deliver fresh vegetables, fruits and milk directly to households through advance-planned procurement and reliable doorstep delivery — and expand thoughtfully into new categories.',
              },
              {
                icon: Compass,
                title: 'Purpose',
                desc: 'Help families plan their kitchen a day in advance, so quality stays high, prices stay fair, and food waste is reduced across the supply chain.',
              },
            ].map((b, i) => (
              <Reveal key={b.title} delay={i * 100}>
                <div className="group h-full rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.12] hover:border-gold-400/50 hover:-translate-y-1.5 hover:shadow-lift">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500/30 to-gold-400/15 text-gold-300 ring-1 ring-gold-400/40 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                    <b.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-bold text-white transition-colors group-hover:text-gold-200">{b.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-emerald-50/95 font-normal">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Business values</span>
            <h2 className="section-title mt-4">The principles behind everything we do.</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="card h-full p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-ink-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-ink-600">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Future-ready */}
      <section className="pb-24">
        <div className="container-page">
          <Reveal className="rounded-3xl border border-ink-100 bg-gradient-to-br from-brand-50 to-white p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <span className="eyebrow">Built to scale</span>
                <h2 className="mt-4 font-display text-2xl font-bold text-ink-950 sm:text-3xl">
                  A foundation for future business divisions.
                </h2>
                <p className="mt-4 text-ink-600 leading-relaxed">
                  JVLSD's website architecture separates the parent identity from individual
                  business activities, so new categories — and their products, services and
                  customer journeys — can be introduced over time without restructuring the
                  whole site.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <button onClick={() => navigate(PATHS.shakhwala)} className="btn-primary px-5 py-3">
                  Explore Shakhwala <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate(PATHS.contact)} className="btn-outline px-5 py-3">
                  Talk to the team
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
