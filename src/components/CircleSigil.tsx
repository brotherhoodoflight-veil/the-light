import { polygonPoints } from "@/lib/sigil";

interface CircleSigilProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function CircleSigil({
  size = 160,
  className = "",
  strokeWidth = 2.1,
}: CircleSigilProps) {
  const centers = polygonPoints(3, 16, -90, 50, 50);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.5}
        opacity="0.22"
        className="sigil-spin"
        strokeDasharray="1 2.6"
      />
      {centers.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="30"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={i === 1 ? 0.55 : 0.85}
        />
      ))}
      <circle
        cx="50"
        cy="50"
        r="2"
        fill="currentColor"
      />
      <circle
        cx="50"
        cy="50"
        r="7.5"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.6}
        opacity="0.5"
      />
    </svg>
  );
}