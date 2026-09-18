export default function SealPentagram({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Golden pentagram seal of the Veiled Order"
    >
      <defs>
        <linearGradient id="seal-pent-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F0D682" />
          <stop offset="0.5" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#8A6D2B" />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke="url(#seal-pent-grad)"
        strokeWidth="1"
        opacity="0.45"
      />
      <polygon
        points="100,15 150,168.8 19.2,73.7 180.8,73.7 50,168.8"
        fill="none"
        stroke="url(#seal-pent-grad)"
        strokeWidth="3.2"
        strokeLinejoin="miter"
      />
      <polygon
        points="119.1,73.7 130.9,110 100,132.5 69.1,110 80.9,73.7"
        fill="none"
        stroke="url(#seal-pent-grad)"
        strokeWidth="1.6"
        strokeLinejoin="miter"
      />
      <circle cx="100" cy="100" r="2.5" fill="#D4AF37" />
    </svg>
  );
}