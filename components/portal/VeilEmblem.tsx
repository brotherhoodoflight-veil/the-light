export default function VeilEmblem({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx="60"
        cy="60"
        r="56"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke="currentColor"
        strokeWidth="0.3"
        opacity="0.25"
      />

      {/* Tick marks around the outer ring */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 60 + 53.5 * Math.cos(angle);
        const y1 = 60 + 53.5 * Math.sin(angle);
        const x2 = 60 + 56 * Math.cos(angle);
        const y2 = 60 + 56 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.4"
            opacity="0.35"
          />
        );
      })}

      {/* Radiating lines from center */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x1 = 60 + 18 * Math.cos(angle);
        const y1 = 60 + 18 * Math.sin(angle);
        const x2 = 60 + 46 * Math.cos(angle);
        const y2 = 60 + 46 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.2"
            opacity="0.08"
          />
        );
      })}

      {/* Inner triangle (pointing up) */}
      <polygon
        points="60,22 95,82 25,82"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />

      {/* Inner triangle (pointing down) - Star of David inspired geometry */}
      <polygon
        points="60,98 25,38 95,38"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.3"
      />

      {/* Middle circle */}
      <circle
        cx="60"
        cy="60"
        r="22"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.35"
      />

      {/* Inner eye shape */}
      <ellipse
        cx="60"
        cy="60"
        rx="14"
        ry="8"
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
        opacity="0.45"
      />

      {/* Pupil */}
      <circle
        cx="60"
        cy="60"
        r="3"
        fill="currentColor"
        opacity="0.5"
      />

      {/* Inner glow around pupil */}
      <circle
        cx="60"
        cy="60"
        r="5"
        fill="currentColor"
        opacity="0.08"
      />

      {/* Small decorative dots at cardinal points */}
      <circle cx="60" cy="12" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="60" cy="108" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="60" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="108" cy="60" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
