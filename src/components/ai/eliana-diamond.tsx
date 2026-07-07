export function ElianaDiamond({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-label="ELIANA IA"
    >
      <defs>
        <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#197BD2" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#197BD2" />
        </linearGradient>
        <linearGradient id="dg2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#35A8FF" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#197BD2" />
        </linearGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d="M60 6 L114 60 L60 114 L6 60 Z" fill="url(#dg)" stroke="url(#dg2)" strokeWidth={1.5} />
      <path d="M60 6 L114 60 L60 114 L6 60 Z" fill="url(#shine)" opacity={0.4} />
      <path d="M60 30 L90 60 L60 90 L30 60 Z" fill="url(#dg2)" opacity={0.7} />
      <path d="M60 46 L74 60 L60 74 L46 60 Z" fill="url(#shine)" opacity={0.5} />
    </svg>
  );
}
