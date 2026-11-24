import { useState, useEffect } from 'react';

export function Logo({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/jvlsd-emblem-round.png"
        alt="Jagatpati Vigneshwara LSD LLP • Celestial Emblem"
        className="h-full w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.45)]"
      />
    </div>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* JVLSD Pure Round Emblem without rectangular/pill enclosure */}
      <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
        <img
          src="/jvlsd-emblem-round.png"
          alt="Jagatpati Vigneshwara LSD LLP"
          className="h-full w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]"
        />
      </div>

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-display text-lg sm:text-xl font-black tracking-tight ${dark ? 'text-white' : 'text-ink-950'}`}>
            JVLSD
          </span>
          <span className={`text-[10px] font-black tracking-widest uppercase ${dark ? 'text-gold-300' : 'text-gold-600'}`}>
            · FRESH DAILY
          </span>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase mt-1 leading-tight ${dark ? 'text-emerald-300' : 'text-brand-800'}`}>
          Jagatpati Vigneshwara LSD LLP
        </span>
      </div>
    </div>
  );
}

export function CelestialMasterBanner({ className = 'max-w-md w-full' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-3xl shadow-lift ring-1 ring-gold-400/30 ${className}`}>
      <img
        src="/jvlsd-celestial-master-logo.jpg"
        alt="Jagatpati Vigneshwara LSD LLP • Master Corporate Identity"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

export function Mascot({ className = 'h-16 w-auto' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-brand-500/10 border border-emerald-500/20 shadow-soft ${className}`}>
      {/* Green Leafy Vegreenman Mascot */}
      <img
        src="/jvlsd-mascot-leafy.jpg"
        alt="Vegreenman - Green Leafy Farm Mascot"
        className="h-full w-auto object-contain rounded-xl shadow-sm"
      />
      {/* Cow-free Pure Milk-Can Mascot */}
      <img
        src="/jvlsd-mascot-milkcan.jpg"
        alt="Pure Farm Milk Can - Cruelty-free Fresh Milk"
        className="h-full w-auto object-contain rounded-xl shadow-sm"
      />
    </div>
  );
}

/**
 * Standing / Pair Mascot Duo Showcase Component
 * Shows Vegreenman & Pure Milk Can standing side-by-side with lovely friendly speech bubbles
 */
export function MascotDuoStanding({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-amber-50/80 p-6 sm:p-8 shadow-lift transition-all duration-300 hover:shadow-2xl ${compact ? 'max-w-xl w-full' : 'w-full'}`}>
      {/* Background glow blobs */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-forest-950 shadow-xs">
          🌱 JVLSD Guardians of Freshness
        </span>
        <span className="text-[11px] font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs">
          Daily Friends
        </span>
      </div>

      {/* Side-by-Side Standing Mascots - Exact Two Approved Images */}
      <div className="mt-8 flex flex-col sm:flex-row items-end justify-center gap-6 sm:gap-8">
        {/* Left Mascot: Gau-Mata & Leafy Friend */}
        <div className="group flex flex-col items-center text-center flex-1">
          <div className="relative flex flex-col items-center w-full">
            {/* Friendly Floating speech tag */}
            <div className="mb-2 z-10 rounded-full bg-emerald-700 text-white px-3.5 py-1 text-[11px] font-black shadow-soft animate-bounce">
              100% Farm-Fresh!
            </div>
            
            {/* 2D Vector Character image */}
            <div className="relative transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2 cursor-pointer flex justify-center w-full">
              <img
                src="/jvlsd-mascot-gau-mata-2d.png"
                alt="JVLSD Fresh Daily - Gau-Mata & Leafy Produce Friend"
                className="h-56 sm:h-68 w-auto object-contain filter drop-shadow-[0_15px_20px_rgba(5,150,105,0.28)]"
              />
            </div>

            {/* Soft ground pedestal shadow */}
            <div className="mt-3.5 h-3.5 w-44 rounded-[100%] bg-emerald-950/20 blur-[2px]" />
          </div>
          
          <div className="mt-3.5">
            <h4 className="font-display text-base sm:text-lg font-black text-ink-950">Gau-Mata &amp; Vegreenman</h4>
            <p className="text-xs text-brand-800 font-bold">Fresh Produce Guardians</p>
          </div>
        </div>

        {/* Central Connecting Emblem */}
        <div className="hidden sm:flex flex-col items-center justify-center pb-8 text-emerald-600">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
            <span className="text-lg font-black">✦</span>
          </div>
          <span className="text-[10px] font-black text-forest-900 uppercase tracking-widest mt-1.5">DAILY DUO</span>
        </div>

        {/* Right Mascot: Pure Milk Can with Cape */}
        <div className="group flex flex-col items-center text-center flex-1">
          <div className="relative flex flex-col items-center w-full">
            {/* Friendly Floating speech tag */}
            <div className="mb-2 z-10 rounded-full bg-amber-600 text-white px-3.5 py-1 text-[11px] font-black shadow-soft animate-bounce [animation-delay:0.5s]">
              Pure &amp; Natural!
            </div>

            {/* 2D Vector Character image */}
            <div className="relative transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2 cursor-pointer flex justify-center w-full">
              <img
                src="/jvlsd-mascot-milk-can-2d.png"
                alt="JVLSD Fresh Daily - Pure Can Mascot"
                className="h-56 sm:h-68 w-auto object-contain filter drop-shadow-[0_15px_20px_rgba(217,119,6,0.28)]"
              />
            </div>

            {/* Soft ground pedestal shadow */}
            <div className="mt-3.5 h-3.5 w-44 rounded-[100%] bg-amber-950/20 blur-[2px]" />
          </div>

          <div className="mt-3.5">
            <h4 className="font-display text-base sm:text-lg font-black text-ink-950">Pure Can</h4>
            <p className="text-xs text-amber-700 font-bold">Cruelty-Free Dairy Friend</p>
          </div>
        </div>
      </div>

      {/* Bottom Friendly Speech/Message */}
      <div className="mt-8 rounded-2xl bg-white/95 p-4 border border-emerald-100 shadow-soft text-center text-xs leading-relaxed text-ink-800">
        <p>
          Say hello to our official JVLSD mascots! Together they remind every household: <strong>pre-order today, harvest tonight, and cook fresh tomorrow with zero waste!</strong>
        </p>
      </div>
    </div>
  );
}

/**
 * Rotating Mascot Carousel Component
 * Smoothly transitions between:
 * 1. Captain Fresh (The Delivery Boy Hero Mascot)
 * 2. Gau-Mata & Vegreenman (The Fresh Harvest Mascot)
 * 3. Pure Can (The Cruelty-Free Farm Milk Mascot)
 */
export function MascotRotator({ className = 'max-w-md w-full' }: { className?: string }) {
  const MASCOTS = [
    {
      id: 'captain_fresh',
      name: 'Captain Fresh',
      title: 'Doorstep Delivery Hero',
      tagline: 'Fresh Vegetables & Pure Milk at 7 AM!',
      description: 'Our energetic delivery guardian bringing early morning harvest and pure farm milk directly to kitchen doorsteps.',
      image: '/jvlsd-mascot-hero.png',
      badgeColor: 'bg-emerald-700',
      tag: 'Morning Champion',
    },
    {
      id: 'gau_mata',
      name: 'Gau-Mata & Vegreenman',
      title: 'Fresh Produce Guardians',
      tagline: '100% Unadulterated Farm-Fresh!',
      description: 'Charming farm cow in an emerald apron with her smiling leafy companion, holding the morning harvest basket.',
      image: '/jvlsd-mascot-gau-mata-2d.png',
      badgeColor: 'bg-forest-900',
      tag: 'Fresh Harvest Duo',
    },
    {
      id: 'pure_can',
      name: 'Pure Can',
      title: 'Cruelty-Free Dairy Friend',
      tagline: 'Unadulterated Pure Desi Cow Milk!',
      description: 'Lively vintage milk can hero wearing an emerald cape, championing pure, preservative-free morning dairy.',
      image: '/jvlsd-mascot-milk-can-2d.png',
      badgeColor: 'bg-amber-600',
      tag: 'Pure Milk Friend',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MASCOTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [MASCOTS.length]);

  const active = MASCOTS[currentIndex];

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-amber-50/80 p-6 sm:p-8 shadow-card transition-all duration-300 hover:shadow-lift ${className}`}>
      {/* Background glow blobs */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-forest-950 shadow-xs">
          🌱 JVLSD Guardians of Freshness
        </span>
        <span className="text-[11px] font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs">
          {active.tag}
        </span>
      </div>

      {/* Rotating Mascot Character Showcase */}
      <div className="mt-6 flex flex-col items-center text-center">
        {/* Floating animated speech tag */}
        <div key={`tagline-${active.id}`} className="mb-2 z-10 rounded-full text-white px-3.5 py-1 text-xs font-black shadow-soft animate-bounce transition-all duration-500" style={{ backgroundColor: active.id === 'pure_can' ? '#d97706' : '#047857' }}>
          {active.tagline}
        </div>

        {/* Character Image Container with Fade Animation */}
        <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-2 flex justify-center w-full">
          <img
            key={active.id}
            src={active.image}
            alt={active.name}
            className="h-64 sm:h-80 w-auto object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.22)] animate-fade-in transition-all duration-500"
          />
        </div>

        {/* Soft ground pedestal shadow */}
        <div className="mt-3.5 h-4 w-48 rounded-[100%] bg-emerald-950/20 blur-[2px] transition-all" />

        {/* Mascot Name & Role */}
        <div className="mt-4">
          <h4 className="font-display text-xl font-black text-ink-950">{active.name}</h4>
          <p className="text-xs text-brand-800 font-bold mt-0.5">{active.title}</p>
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {MASCOTS.map((m, idx) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-7 h-2 bg-emerald-700'
                : 'w-2 h-2 bg-ink-200 hover:bg-ink-400'
            }`}
            aria-label={`Show ${m.name}`}
          />
        ))}
      </div>

      {/* Bottom Friendly Speech/Message */}
      <div className="mt-5 rounded-2xl bg-white/95 p-3.5 border border-emerald-100 shadow-soft text-center text-xs leading-relaxed text-ink-800">
        <p>{active.description}</p>
      </div>
    </div>
  );
}

/**
 * Live Standing Mascot Component (Full unboxed character standing directly on canvas)
 * Based on the Mailchimp-style character reference: lively unboxed character with speech bubble,
 * dynamic drop-shadow, and smoothly rotating between the 3 official brand mascots.
 */
export function MascotLiveStanding({ className = '' }: { className?: string }) {
  const MASCOTS = [
    {
      id: 'gau_mata',
      name: 'Gau-Mata & Vegreenman',
      title: 'Fresh Produce Guardians',
      tagline: '100% Farm-Fresh Daily!',
      speech: 'Pre-order tonight, harvested by dawn!',
      image: '/jvlsd-mascot-gau-mata-2d.png',
      badgeColor: 'bg-emerald-700',
    },
    {
      id: 'pure_can',
      name: 'Pure Can',
      title: 'Cruelty-Free Dairy Friend',
      tagline: 'Pure Desi Cow Milk!',
      speech: '100% unadulterated, preservative-free!',
      image: '/jvlsd-mascot-milk-can-2d.png',
      badgeColor: 'bg-amber-600',
    },
    {
      id: 'captain_fresh',
      name: 'Captain Fresh',
      title: 'Doorstep Delivery Hero',
      tagline: 'Morning 7 AM Prompt!',
      speech: 'Speeding fresh harvest straight to your door!',
      image: '/jvlsd-mascot-hero.png',
      badgeColor: 'bg-emerald-800',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MASCOTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [MASCOTS.length]);

  const active = MASCOTS[currentIndex];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Lively Floating Speech Bubble */}
      <div className="relative mb-3 z-10 animate-bounce">
        <div className={`rounded-2xl ${active.badgeColor} text-white px-4 py-1.5 text-xs font-black shadow-lg flex items-center gap-2 transition-colors duration-500`}>
          <span>💬</span>
          <span>{active.speech}</span>
        </div>
        <div
          className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto"
          style={{ borderTopColor: active.id === 'pure_can' ? '#d97706' : '#047857' }}
        />
      </div>

      {/* Real Full Standing Character (Transparent cutout - unboxed, living on page) */}
      <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-2 flex flex-col items-center">
        <img
          key={active.id}
          src={active.image}
          alt={active.name}
          className="h-64 sm:h-76 md:h-84 w-auto object-contain transition-all duration-500 animate-fade-in filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.22)]"
        />
        
        {/* Dynamic Character Cast Shadow on the Ground */}
        <div className="mx-auto -mt-3 h-4.5 w-3/4 rounded-[100%] bg-ink-950/25 blur-[3px] transition-all duration-500" />
      </div>

      {/* Floating Info Pill & Mini Carousel Dots */}
      <div className="mt-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/95 px-4 py-1.5 shadow-soft backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-display text-sm font-black text-ink-900">{active.name}</span>
          <span className="text-xs font-semibold text-emerald-700">• {active.title}</span>
        </div>

        {/* Carousel switchers */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {MASCOTS.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-6 h-1.5 bg-emerald-700'
                  : 'w-1.5 h-1.5 bg-ink-300 hover:bg-ink-500'
              }`}
              aria-label={`Switch to ${m.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
