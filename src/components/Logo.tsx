export function Logo({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/jvlsd-celestial-master-logo.jpg"
        alt="Jagatpati Vigneshwara LSD LLP • TRUST · QUALITY · FAIRNESS"
        className="h-full w-auto object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
      />
    </div>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {/* Approved JVLSD Celestial Master Emblem */}
      <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
        <img
          src="/jvlsd-celestial-master-logo.jpg"
          alt="Jagatpati Vigneshwara LSD LLP • TRUST · QUALITY · FAIRNESS"
          className="h-full w-auto object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
        />
      </div>

      <div className="flex flex-col text-left justify-center">
        <span className={`font-display text-base sm:text-lg font-black tracking-tight leading-tight ${dark ? 'text-white' : 'text-ink-950'}`}>
          JVLSD
        </span>
        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight ${dark ? 'text-emerald-400' : 'text-brand-700'}`}>
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
        alt="Jagatpati Vigneshwara LSD LLP • TRUST · QUALITY · FAIRNESS"
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
    <div className={`relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/70 p-6 sm:p-8 shadow-card transition-all duration-300 hover:shadow-lift ${compact ? 'max-w-md' : 'w-full'}`}>
      {/* Glow blobs */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-gold-300/20 blur-2xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-forest-900">
          🌱 JVLSD Guardians of Freshness
        </span>
        <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
          Daily Friends
        </span>
      </div>

      {/* Side-by-Side Standing Mascots */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
        {/* Leafy Vegreenman */}
        <div className="group flex flex-col items-center text-center">
          <div className="relative">
            {/* Friendly Floating speech tag */}
            <div className="absolute -top-3 -right-2 z-10 rounded-full bg-emerald-700 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-soft animate-bounce">
              100% Farm-Fresh!
            </div>
            <div className="relative h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-2xl bg-white p-2 shadow-soft ring-2 ring-emerald-300/60 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lift">
              <img
                src="/jvlsd-mascot-leafy.jpg"
                alt="Vegreenman - Green Leafy Farm Produce Mascot"
                className="h-full w-full object-contain rounded-xl"
              />
            </div>
            {/* Soft ground pedestal shadow */}
            <div className="mx-auto mt-2 h-2 w-28 rounded-full bg-emerald-950/15 blur-xs" />
          </div>
          <h4 className="mt-3 font-display text-base font-extrabold text-ink-950">Vegreenman</h4>
          <p className="text-xs text-brand-700 font-semibold">Fresh Vegetable Guardian</p>
        </div>

        {/* Golden connecting bridge icon */}
        <div className="hidden sm:flex flex-col items-center justify-center text-emerald-400">
          <span className="text-2xl font-black">✦</span>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest mt-1">Daily Duo</span>
        </div>

        {/* Milkcan Mascot */}
        <div className="group flex flex-col items-center text-center">
          <div className="relative">
            {/* Friendly Floating speech tag */}
            <div className="absolute -top-3 -left-2 z-10 rounded-full bg-gold-600 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-soft animate-bounce [animation-delay:0.5s]">
              Pure &amp; Natural!
            </div>
            <div className="relative h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-2xl bg-white p-2 shadow-soft ring-2 ring-gold-300/60 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lift">
              <img
                src="/jvlsd-mascot-milkcan.jpg"
                alt="Pure Can - Farm Milk Mascot"
                className="h-full w-full object-contain rounded-xl"
              />
            </div>
            {/* Soft ground pedestal shadow */}
            <div className="mx-auto mt-2 h-2 w-28 rounded-full bg-amber-950/15 blur-xs" />
          </div>
          <h4 className="mt-3 font-display text-base font-extrabold text-ink-950">Pure Can</h4>
          <p className="text-xs text-gold-700 font-semibold">Cruelty-Free Dairy Friend</p>
        </div>
      </div>

      {/* Bottom Friendly Speech/Message */}
      <div className="mt-6 rounded-2xl bg-white/80 p-4 border border-emerald-100 text-center text-xs leading-relaxed text-ink-700">
        <p>
          Say hello to our official JVLSD mascots! Together they remind every household: <strong>pre-order today, harvest tonight, and cook fresh tomorrow with zero waste!</strong>
        </p>
      </div>
    </div>
  );
}
