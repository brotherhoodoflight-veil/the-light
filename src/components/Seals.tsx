export const SealPentagram = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-[180px] w-[180px] drop-shadow-[0_0_25px_rgba(212,175,55,0.7)] md:h-[240px] md:w-[240px]"
  >
    <g stroke="#D4AF37" fill="none" strokeWidth="0.8" opacity="0.9">
      <circle cx="50" cy="50" r="45" />
      <path d="M50 8 L87 78 L13 78 Z M50 8 L18 35 L82 35 Z" />
    </g>
  </svg>
);

export const SealEye = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-[140px] w-[140px] drop-shadow-[0_0_25px_rgba(212,175,55,0.6)] md:h-[190px] md:w-[190px]"
  >
    <g stroke="#D4AF37" fill="none" strokeWidth="0.7" opacity="0.8">
      <circle cx="50" cy="50" r="40" />
      <path d="M20 50 Q50 20 80 50 Q50 80 20 50" />
      <circle cx="50" cy="50" r="8" fill="#D4AF37" />
    </g>
  </svg>
);