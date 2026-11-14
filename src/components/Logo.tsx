export function Logo({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-soft ring-1 ring-gold-400/25 bg-brand-950 shrink-0 ${className}`}>
      <img
        src="/jvlsd-celestial-square.jpg"
        alt="JVLSD - Jagatpati Vigneshwara LSD LLP (Trust • Quality • Fairness)"
        className="h-full w-full object-cover object-center"
      />
    </div>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      {/* Blended Rounded Square Celestial Logo Badge */}
      <div className="relative h-12 w-12 sm:h-13 sm:w-13 overflow-hidden rounded-2xl shadow-card ring-1 ring-gold-400/30 bg-[#0a2016] shrink-0 transition-transform duration-300 hover:scale-105">
        <img
          src="/jvlsd-celestial-square.jpg"
          alt="JVLSD - Jagatpati Vigneshwara LSD LLP"
          className="h-full w-full object-cover object-center"
        />
        {/* Subtle luminous inner highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
      </div>

      <div className="flex flex-col text-left justify-center">
        <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-ink-950 leading-none">
          JVLSD-FD
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-700 mt-1">
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
