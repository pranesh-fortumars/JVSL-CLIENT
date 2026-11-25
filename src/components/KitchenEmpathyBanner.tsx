import { useState, useEffect } from 'react';
import {
  Coffee,
  Heart,
  CloudRain,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sunrise,
  CheckCircle2,
  Users,
  Compass,
  X,
} from 'lucide-react';
import { navigate, PATHS } from '@/lib/router';

export type StoryCard = {
  id: string;
  tag: string;
  tagTone: 'amber' | 'emerald' | 'gold' | 'sky';
  icon: React.ElementType;
  hardshipHeadline: string;
  hardshipText: string;
  jvlsdSolution: string;
  benefitTime: string; // e.g. "Morning 6:30 AM"
  quote: string;
};

export const KITCHEN_HARDSHIP_STORIES: StoryCard[] = [
  {
    id: 'morning-routine',
    tag: 'Daily Kitchen Reality',
    tagTone: 'amber',
    icon: Coffee,
    hardshipHeadline: 'The Silent Morning Clock as a Woman & Household Chef',
    hardshipText:
      'Waking up before sunrise to anxious kitchen thoughts: Is milk fresh for morning tea? Will kids get pure milk before school bus arrives? Will tiffin vegetables be ready before office rush and elderly breakfast?',
    jvlsdSolution:
      'Doorstep Delivery between 8:00 AM – 9:00 AM. Pure A2 Cow & Buffalo milk arrives chilled with farm-harvested crisp veggies, making morning tea and family breakfast peaceful.',
    benefitTime: 'Sunrise & Morning Tea (6:30 AM – 8:30 AM)',
    quote: '“No more wondering if the milk or veggies will arrive in time. The kitchen runs with grace.”',
  },
  {
    id: 'market-struggle',
    tag: 'Market Hardship & Filth',
    tagTone: 'amber',
    icon: CloudRain,
    hardshipHeadline: 'Dirty Pavements, Rain & The Exhausting Market Scouting',
    hardshipText:
      'Stepping out in scorching heat or sudden rain, navigating muddy unhygienic roads, scouting stalls for basic coriander, and having to haggle on quality, doubtful weights, and unfair prices.',
    jvlsdSolution:
      'Zero Market Hustle. 100% advance cold-chain procurement direct from growers. Transparent digital gram/piece weighing with pre-cut recipe kits delivered clean and sanitized.',
    benefitTime: 'Afternoon & Evening Peace',
    quote: '“No more dirty streets or haggling on price. You get pure farm goodness right at home.”',
  },
  {
    id: 'office-elderly',
    tag: 'Tiffin & Elderly Nourishment',
    tagTone: 'emerald',
    icon: Heart,
    hardshipHeadline: 'Balanced Office Lunchboxes & Tender Elder Care',
    hardshipText:
      'Balancing low-oil digestive dietary needs for aged parents while packing vibrant, nutritious lunchboxes for working spouses and energetic children — all within minutes.',
    jvlsdSolution:
      'Ayurvedic & seasonal produce curation. Customized cutting styles (fine, thin, cubes) and recipe prep kits tailored for satvik, diabetic, and heart-healthy home cooking.',
    benefitTime: 'Lunch Prep & Office Tiffin',
    quote: '“Healthy nourishment for every generation under one roof, prepared effortlessly.”',
  },
  {
    id: 'beyond-delivery',
    tag: 'Beyond Quick Commerce',
    tagTone: 'sky',
    icon: Compass,
    hardshipHeadline: 'Ours Is No "Next Essential Delivery Option"',
    hardshipText:
      'We are not a hasty 10-minute instant delivery app that pushes stale warehouse stock. We refused the wasteful, chaotic retail model.',
    jvlsdSolution:
      'A holistic solution platform for individuals, families, and society with zero food wastage, farmer welfare, domestic help inclusion, and unlimited community possibilities.',
    benefitTime: 'Sustainable Living Platform',
    quote: '“A platform built with empathy for the home chef, dignity for growers, and health for society.”',
  },
];

export function KitchenEmpathyBanner({ userName }: { userName?: string | null }) {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-scroll through stories every 7 seconds unless paused by hovering
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % KITCHEN_HARDSHIP_STORIES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused]);

  if (isDismissed) return null;

  const current = KITCHEN_HARDSHIP_STORIES[activeStoryIndex];
  const Icon = current.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-3xl border border-gold-300/60 bg-gradient-to-br from-[#12281d] via-[#163a28] to-[#0c1f16] text-white shadow-lift transition-all"
    >
      {/* Subtle background glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

      {/* Top Ticker Ribbon */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse shrink-0" />
          <span className="font-extrabold uppercase tracking-wider text-gold-300 text-[10px] sm:text-xs shrink-0">
            {userName ? `Welcome back, ${userName} · ` : ''}Kitchen Empathy &amp; Solution Movement
          </span>
          <span className="hidden md:inline text-white/50">|</span>
          <span className="hidden md:inline text-white/80 font-medium truncate text-[11px]">
            Ours is no next essential delivery option — It's a mindful solution platform for you &amp; our society
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {KITCHEN_HARDSHIP_STORIES.map((st, i) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStoryIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeStoryIndex ? 'w-6 bg-gold-400' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={st.tag}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Story Content Showcase */}
      <div className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-12 items-center">
          {/* Left Column: The Real Hardship (Empathy) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <span className="text-gold-300 font-bold">{current.tag}</span>
              <span className="text-white/40">·</span>
              <span className="text-emerald-200 text-[11px]">{current.benefitTime}</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-300 border border-gold-400/30">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                  {current.hardshipHeadline}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-amber-100/80 leading-relaxed">
                  {current.hardshipText}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: JVLSD's Holistic Solution & Society Impact */}
          <div className="lg:col-span-6 rounded-2xl bg-white/10 p-5 sm:p-6 border border-white/15 backdrop-blur-md space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span>How JVLSD Solves This For You</span>
            </div>

            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
              {current.jvlsdSolution}
            </p>

            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="italic text-gold-200/90 text-[11px] leading-snug">
                {current.quote}
              </p>

              <button
                type="button"
                onClick={() => navigate(PATHS.order)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold px-4 py-2 text-xs shadow-soft transition-all active:scale-[0.98]"
              >
                <span>Plan Fresh Baskets</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Solution Manifesto Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/70">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 100% Zero Food Waste Pre-Order
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Same-Day Emergency Hub Dispatch
            </span>
            <span className="flex items-center gap-1.5 text-white/90 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Society &amp; Individual Platform
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gold-300 font-bold">Story {activeStoryIndex + 1} of {KITCHEN_HARDSHIP_STORIES.length}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveStoryIndex((prev) => (prev - 1 + KITCHEN_HARDSHIP_STORIES.length) % KITCHEN_HARDSHIP_STORIES.length)}
                className="h-6 w-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"
                title="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setActiveStoryIndex((prev) => (prev + 1) % KITCHEN_HARDSHIP_STORIES.length)}
                className="h-6 w-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"
                title="Next"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
