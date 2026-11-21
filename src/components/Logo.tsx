export function Logo({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/jvlsd-verified-seal-master.jpg"
        alt="Jagatpati Vigneshwara LSD LLP • Verified Seal Master"
        className="h-full w-auto object-contain rounded-full drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
      />
    </div>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {/* JVLSD Verified Seal Master Emblem */}
      <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
        <img
          src="/jvlsd-verified-seal-master.jpg"
          alt="Jagatpati Vigneshwara LSD LLP • Verified Seal Master"
          className="h-full w-auto object-contain rounded-full drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
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
        src="/jvlsd-verified-seal-master.jpg"
        alt="Jagatpati Vigneshwara LSD LLP • Verified Seal Master"
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
                src="/jvlsd-mascot-gau-mata-2d.jpg"
                alt="JVLSD Fresh Daily - Gau-Mata & Leafy Produce Friend"
                className="h-52 sm:h-64 w-auto object-contain rounded-2xl drop-shadow-[0_12px_16px_rgba(5,150,105,0.25)]"
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
                src="/jvlsd-mascot-milk-can-2d.jpg"
                alt="JVLSD Fresh Daily - Pure Can Mascot"
                className="h-52 sm:h-64 w-auto object-contain rounded-2xl drop-shadow-[0_12px_16px_rgba(217,119,6,0.25)]"
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
 * Mailchimp-Style Lively Delivery Hero Standing Mascot
 */
export function MascotHeroStanding({ className = 'max-w-md w-full' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-amber-50/80 p-6 sm:p-8 shadow-card transition-all duration-300 hover:shadow-lift ${className}`}>
      {/* Background glow blobs */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-forest-950 shadow-xs">
          🌱 Official Delivery Hero
        </span>
        <span className="text-[11px] font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs">
          Fresh Daily Champion
        </span>
      </div>

      {/* Standing Mascot Character */}
      <div className="mt-6 flex flex-col items-center text-center">
        <div className="relative flex flex-col items-center">
          {/* Friendly floating speech bubble */}
          <div className="mb-2 z-10 rounded-full bg-emerald-700 text-white px-3.5 py-1 text-xs font-black shadow-soft animate-bounce">
            Fresh Vegetables &amp; Pure Milk at 7 AM!
          </div>

          {/* Full Standing Mascot Artwork */}
          <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-2">
            <img
              src="/jvlsd-mascot-hero.jpg"
              alt="JVLSD Delivery Hero Mascot - Fresh Daily Guardian"
              className="h-64 sm:h-72 w-auto object-contain rounded-3xl shadow-soft drop-shadow-[0_16px_20px_rgba(5,150,105,0.25)]"
            />
          </div>

          {/* Pedestal Ground Contact Shadow */}
          <div className="mt-3.5 h-4 w-48 rounded-[100%] bg-emerald-950/20 blur-[2px] transition-all" />
        </div>

        <div className="mt-4">
          <h4 className="font-display text-xl font-black text-ink-950">Captain Fresh</h4>
          <p className="text-xs text-brand-800 font-bold mt-0.5">JVLSD-FD Doorstep Delivery Guardian</p>
        </div>
      </div>

      {/* Speech Box */}
      <div className="mt-6 rounded-2xl bg-white/95 p-4 border border-emerald-100 shadow-soft text-center text-xs leading-relaxed text-ink-800">
        <p>
          Meet our cheerful delivery hero! Delivering farm-harvested crisp vegetables, fruits, and pure milk right to your doorstep with <strong>zero food waste and planned freshness</strong>.
        </p>
      </div>
    </div>
  );
}
