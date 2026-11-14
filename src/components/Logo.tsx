export function Logo({ className = 'h-14 w-auto' }: { className?: string }) {
  return (
    <img
      src="/jvlsd-celestial-master-logo.jpg"
      alt="JVLSD - Jagatpati Vigneshwara LSD LLP (Trust • Quality • Fairness)"
      className={`shrink-0 rounded-2xl object-contain shadow-soft ${className}`}
    />
  );
}

export function Wordmark() {
  return <Logo className="h-14 w-auto" />;
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
