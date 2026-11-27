import React from 'react';
import { 
  Heart, 
  Sparkles, 
  Leaf, 
  ShieldCheck, 
  Droplets, 
  Zap, 
  CalendarClock, 
  ShoppingBag, 
  Check, 
  Award,
  Globe2,
  TrendingDown
} from 'lucide-react';

interface SustainableImpactCardProps {
  className?: string;
  compact?: boolean;
}

export function SustainableImpactShowcase({ className = '', compact = false }: SustainableImpactCardProps) {
  const healthBenefits = [
    { label: 'Pure & 100% Nutrient Retention', sub: 'Retains natural vitamins, minerals & active enzymes' },
    { label: 'Extended Fresh Shelf Life', sub: 'Zero food spoilage or degradation' },
    { label: 'Pure, Preserved & Chemical-Free', sub: 'Zero artificial preservatives, colourings or additives' },
    { label: 'Cost-Effective & Kitchen Ready', sub: 'Pre-sorted, weighed & ready to consume immediately' },
  ];

  const earthBenefits = [
    { label: 'Zero Single-Use Plastic', sub: '100% compostable & biodegradable composite pouches' },
    { label: 'Stops Vegetable & Food Waste', sub: 'Advance planned pre-ordering prevents landfill loss' },
    { label: 'Lowers Carbon Footprint', sub: 'Direct farm-to-doorstep local route optimization' },
    { label: 'Saves Water & Storage Energy', sub: 'Reduces heavy refrigeration energy consumption' },
  ];

  return (
    <div className={`overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-lift ${className}`}>
      {/* Header Banner */}
      <div className="border-b border-emerald-100/80 bg-white/80 px-6 py-6 sm:px-10 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-soft">
              <Globe2 className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                JVLSD Technology · Eco-Conscious Standard
              </span>
              <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-ink-950 tracking-tight">
                Benefits To Your Health, Wallet &amp; Mother Earth
              </h3>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-bold text-emerald-900 border border-emerald-200">
            <Leaf className="h-3.5 w-3.5 text-emerald-700" /> 100% Compostable Packaging
          </span>
        </div>
      </div>

      {/* Main Visual: Center Stage Prominent Showcase with Flanking Feature Highlights */}
      <div className="p-6 sm:p-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Health & Wallet (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 font-display font-bold text-base sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              </span>
              Health &amp; Household Wallet
            </div>

            <div className="space-y-2.5">
              {healthBenefits.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-stone-200/90 bg-white p-3 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-soft">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-ink-950 leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-ink-600 mt-0.5 leading-snug">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Graphic: Prominent, High-Resolution Master Infographic (6 columns) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
            <div className="relative w-full flex items-center justify-center">
              {/* Soft ambient glow blending into background */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-400/25 via-teal-300/20 to-amber-300/30 blur-2xl pointer-events-none" />
              
              {/* Enhanced Large-Scale Display Frame */}
              <div className="relative w-full max-w-[540px] overflow-hidden rounded-3xl border border-emerald-300/80 bg-white p-3 sm:p-4 shadow-lift transition-all duration-300 hover:shadow-2xl">
                <img
                  src="/jvlsd-benefits-health-wallet-earth.jpg"
                  alt="Benefits To Your Health, Wallet & Mother Earth - JVLSD THE Bites"
                  className="w-full h-auto object-contain rounded-2xl"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100/90 px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-emerald-950 border border-emerald-300/60 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              <span>Natural Preservation &amp; Zero Waste</span>
            </div>
            <p className="text-xs text-ink-600 max-w-sm mt-1">
              Powered by JVLSD-FD &amp; Clean Dehydration Processing Technology
            </p>
          </div>

          {/* Right Column: Mother Earth & Sustainability (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 font-display font-bold text-base sm:text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <Leaf className="h-4 w-4 fill-teal-600 text-teal-600" />
              </span>
              Mother Earth &amp; Environment
            </div>

            <div className="space-y-2.5">
              {earthBenefits.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-stone-200/90 bg-white p-3 shadow-2xs transition-all hover:border-teal-300 hover:shadow-soft">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-ink-950 leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-ink-600 mt-0.5 leading-snug">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Summary Banner */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-900 via-brand-800 to-teal-900 px-6 py-4 text-white shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-ink-950 font-bold">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="text-xs sm:text-sm font-medium text-emerald-100">
              <strong className="text-white font-bold">100% Breathable &amp; Compostable Packaging:</strong> Every vegetable, fruit, and bite pack is hygienically sealed to eliminate bacteria formation, oxidation, and plastic waste.
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-gold-300 uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            Zero Plastic Verified
          </span>
        </div>
      </div>
    </div>
  );
}
