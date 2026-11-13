export function Logo({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <img
      src="/jvlsd-logo.png"
      alt="JVLSD"
      width={1049}
      height={1014}
      className={`shrink-0 rounded-xl object-contain ${className}`}
    />
  );
}

export function Wordmark() {
  return <Logo className="h-11 w-auto" />;
}
