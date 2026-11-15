export function Logo({ className = 'h-11 w-14' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-soft ring-1 ring-gold-400/40 bg-gradient-to-r from-emerald-950 via-brand-950 to-emerald-950 shrink-0 ${className}`}>
      <img
        src="/jvlsd-celestial-badge.png"
        alt="JVLSD - Jagatpati Vigneshwara LSD LLP (Trust • Quality • Fairness)"
        className="h-full w-full object-contain object-center"
      />
    </div>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {/* Stadium / Rounded Pill Master Logo Badge */}
      <div className="relative h-11 w-14 sm:h-12 sm:w-16 overflow-hidden rounded-2xl shadow-card ring-1.5 ring-gold-400/50 bg-[#081e14] shrink-0 transition-transform duration-300 hover:scale-105 flex items-center justify-center p-0.5">
        <img
          src="/jvlsd-celestial-badge.png"
          alt="JVLSD - Jagatpati Vigneshwara LSD LLP"
          className="h-full w-full object-contain object-center"
        />
        {/* Subtle luminous gold overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-300/30" />
      </div>

      <div className="flex flex-col text-left justify-center">
        <span className="font-display text-base sm:text-lg font-black tracking-tight text-ink-950 leading-tight">
          JVLSD-FD
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-700 leading-tight">
          FRANCHISEE OF SHAKHWALA
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
        alt="Jagatpati Vigneshwara LSD LLP - Trust • Quality • Fairness"
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

export function Mascot({ className = 'h-16 w-auto' }: { className?: string }) {
  return (
    <img
      src="/jvlsd-mascot-milkcan.jpg"
      alt="JVLSD-FD Fresh Daily Mascot - Franchisee of Shakhwala"
      className={`shrink-0 rounded-2xl object-contain shadow-soft ${className}`}
    />
  );
}
