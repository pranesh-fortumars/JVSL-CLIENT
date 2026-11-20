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
    <div className={`relative flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-brand-500/10 border border-emerald-500/20 shadow-soft ${className}`}>
      {/* Green Leafy Vegreenman Mascot */}
      <img
        src="/jvlsd-mascot-leafy.jpg"
        alt="Vegreenman - Green Leafy Farm Mascot"
        className="h-full w-auto object-contain rounded-xl"
      />
      {/* Cow-free Pure Milk-Can Mascot */}
      <img
        src="/jvlsd-mascot-milkcan.jpg"
        alt="Pure Farm Milk Can - Cruelty-free Fresh Milk"
        className="h-full w-auto object-contain rounded-xl"
      />
    </div>
  );
}
