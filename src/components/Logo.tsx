export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="snakeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD980" />
          <stop offset="50%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#FF3B8A" />
        </linearGradient>
        <linearGradient id="snakeGradDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9500" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF3B8A" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#FFD980" />
        </radialGradient>
        <filter id="logoGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* shadow body */}
      <path
        d="M14 46 C 14 30, 28 30, 32 38 C 36 46, 50 46, 50 30 C 50 20, 42 16, 34 20"
        fill="none"
        stroke="url(#snakeGradDark)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* main body */}
      <path
        d="M14 44 C 14 28, 28 28, 32 36 C 36 44, 50 44, 50 28 C 50 18, 42 14, 34 18"
        fill="none"
        stroke="url(#snakeGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logoGlow)"
      />
      {/* scale segments */}
      {[0.18, 0.36, 0.55, 0.74].map((t, i) => (
        <circle key={i} cx={14 + t * 36} cy={44 - Math.sin(t * Math.PI) * 18} r="1.4" fill="#FFD980" opacity="0.7" />
      ))}
      {/* eye */}
      <circle cx="36" cy="20" r="3.5" fill="url(#eyeGrad)" />
      <circle cx="36" cy="20" r="1.4" fill="#06070A" />
      <circle cx="37" cy="19" r="0.6" fill="#fff" />
    </svg>
  );
}
