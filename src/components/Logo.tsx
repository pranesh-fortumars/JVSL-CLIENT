export function Logo({ className = 'h-12 w-auto' }: { className?: string }) {
  return (
    <img
      src="/JVLSD_Standalone_Option_A_Approved_Master_Font_Refinement.png"
      alt="JVLSD - Jagatpati Vigneshwara LSD LLP"
      width={1049}
      height={1014}
      className={`shrink-0 rounded-xl object-contain ${className}`}
    />
  );
}

export function Wordmark() {
  return <Logo className="h-12 w-auto" />;
}
