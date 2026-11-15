export function Logo({ className = 'h-11 w-13' }: { className?: string }) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/jvlsd-celestial-badge.png"
        alt="JVLSD - Jagatpati Vigneshwara LSD LLP (Trust • Quality • Fairness)"
        className="h-full w-auto object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
      />
    </div>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {/* Stadium / Rounded Pill Master Logo Badge without black borders */}
      <div className="relative h-11 w-13 sm:h-12 sm:w-14 shrink-0 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
        <img
          src="/jvlsd-celestial-badge.png"
          alt="JVLSD - Jagatpati Vigneshwara LSD LLP"
          className="h-full w-auto object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]"
        />
      </div>

      <div className="flex flex-col text-left justify-center">
        <span className={`font-display text-base sm:text-lg font-black tracking-tight leading-tight ${dark ? 'text-white' : 'text-ink-950'}`}>
          JVLSD-FD
        </span>
        <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-tight ${dark ? 'text-emerald-400' : 'text-brand-700'}`}>
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
