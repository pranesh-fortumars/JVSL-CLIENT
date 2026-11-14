export function Logo({ className = 'h-11 w-auto' }: { className?: string }) {
  return (
    <img
      src="/JVLSD_Standalone_Option_A_Approved_Master_Font_Refinement.png"
      alt="JVLSD - Jagatpati Vigneshwara LSD LLP (Trust • Quality • Fairness)"
      className={`shrink-0 object-contain transition-transform hover:scale-105 ${className}`}
    />
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/JVLSD_Standalone_Option_A_Approved_Master_Font_Refinement.png"
        alt="JVLSD"
        className="h-10 sm:h-11 w-auto object-contain shrink-0"
      />
      <div className="hidden sm:flex flex-col text-left leading-none">
        <span className="font-display text-sm font-bold tracking-tight text-ink-950">
          JVLSD-FD
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-700 mt-0.5">
          Franchisee of Shakhwala
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
